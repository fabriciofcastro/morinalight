import { randomUUID } from "node:crypto";
import type { DomainEvent, DomainEventBus } from "@morina/shared-kernel";
import { Redis } from "ioredis";
import {
  domainEventPublishedCounter,
  domainStreamLengthGauge,
  realtimeForwardCounter,
} from "../../core/observability/metrics";

type RedisEventBusOptions = {
  url: string;
  stream?: string;
  realtimeStream?: string;
};

export class RedisEventBus implements DomainEventBus {
  private readonly redis: Redis;
  private readonly stream: string;
  private readonly realtimeStream?: string;
  private connected: boolean = false;
  private connectionFailed: boolean = false;
  private errorLogged: boolean = false;

  constructor(options: RedisEventBusOptions) {
    // Configurar Redis SEM reconexão automática para evitar loops de erro
    this.redis = new Redis(options.url, {
      lazyConnect: true,
      // Desabilitar completamente a reconexão automática
      retryStrategy: () => null, // Nunca tentar reconectar
      maxRetriesPerRequest: 0, // Não tentar novamente se falhar
      enableOfflineQueue: false, // Não enfileira comandos quando desconectado
      enableReadyCheck: false, // Não verificar se está ready
      connectTimeout: 1000, // Timeout curto de 1 segundo
      commandTimeout: 1000, // Timeout curto de 1 segundo para comandos
      showFriendlyErrorStack: false, // Desabilitar stack trace amigável (mais rápido)
    });

    this.stream = options.stream ?? "domain.events";
    this.realtimeStream = options.realtimeStream;

    // Handler de erro - será chamado apenas uma vez após detectar erro
    const handleError = (error: unknown) => {
      // Se já processou o erro, ignorar completamente
      if (this.connectionFailed || this.errorLogged) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Detectar tipo de erro e logar apenas uma vez
      if (errorMessage.includes("NOAUTH") || errorMessage.includes("Authentication required")) {
        console.warn("⚠️  Redis requer autenticação (eventos serão ignorados). Configure REDIS_URL com senha (redis://:senha@host:port) ou desabilite autenticação no Redis.");
        this.connectionFailed = true;
        this.errorLogged = true;
      } else if (errorMessage.includes("Connection") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ETIMEDOUT")) {
        // Apenas logar uma vez para outros erros de conexão
        console.warn("⚠️  Redis não disponível (eventos serão ignorados):", errorMessage);
        this.connectionFailed = true;
        this.errorLogged = true;
      }

      // Se detectou erro, desconectar permanentemente e remover listeners
      if (this.connectionFailed) {
        try {
          // Remover todos os listeners para evitar loops
          this.redis.removeAllListeners();
          // Desconectar sem tentar reconectar
          if (this.redis.status && this.redis.status !== "end" && this.redis.status !== "close") {
            this.redis.disconnect(false); // false = não reconectar
          }
        } catch {
          // Ignorar erros ao desconectar
        }
      }
    };

    // Adicionar handler de erro (será removido após primeiro erro)
    this.redis.on("error", handleError);

    // Handlers de conexão
    this.redis.on("connect", () => {
      this.connected = true;
      this.connectionFailed = false;
      this.errorLogged = false;
    });

    this.redis.on("close", () => {
      this.connected = false;
    });

    this.redis.on("ready", () => {
      this.connected = true;
      this.connectionFailed = false;
      this.errorLogged = false;
    });
  }

  async publish<TPayload>(event: DomainEvent<TPayload>) {
    // Se a conexão falhou anteriormente, apenas retornar silenciosamente
    if (this.connectionFailed) {
      return;
    }

    const enrichedMetadata = { ...event.metadata, eventId: event.metadata.eventId ?? randomUUID() };
    const payload = JSON.stringify({
      ...event,
      metadata: enrichedMetadata,
    });

    try {
      // Verificar se o Redis está conectado antes de tentar publicar
      if (!this.connected) {
        // Se não estiver conectado e não falhou ainda, não tentar conectar
        // (a conexão será lazy, mas não forçar se já falhou)
        if (this.connectionFailed) {
          return;
        }
        // Tentar conectar apenas uma vez se não estiver conectado
        try {
          if (this.redis.status === "wait" || this.redis.status === "end" || this.redis.status === "close") {
            await this.redis.connect();
          }
        } catch (connectError) {
          // Se falhar ao conectar, marcar como falhado e retornar
          this.connectionFailed = true;
          const errorMessage = connectError instanceof Error ? connectError.message : String(connectError);
          if (!this.errorLogged) {
            if (errorMessage.includes("NOAUTH") || errorMessage.includes("Authentication required")) {
              console.warn("⚠️  Redis requer autenticação (eventos serão ignorados).");
            } else {
              console.warn("⚠️  Redis não disponível (eventos serão ignorados):", errorMessage);
            }
            this.errorLogged = true;
          }
          return;
        }
      }

      // Se ainda não estiver conectado após tentativa, retornar
      if (!this.connected || this.connectionFailed) {
        return;
      }

      // Publicar evento apenas se estiver conectado
      await this.redis.xadd(this.stream, "*", "event", payload);
      domainEventPublishedCounter.inc({ stream: this.stream });

      // Atualizar métricas silenciosamente (ignorar erros)
      this.updateStreamLengthMetric(this.stream).catch(() => {
        // Ignorar erros de métricas
      });

      if (this.realtimeStream) {
        await this.redis.xadd(
          this.realtimeStream,
          "*",
          "event",
          JSON.stringify({
            name: event.name,
            version: event.version,
            metadata: enrichedMetadata,
            payload: event.payload,
          }),
        );
        realtimeForwardCounter.inc({ stream: this.realtimeStream });
        this.updateStreamLengthMetric(this.realtimeStream).catch(() => {
          // Ignorar erros de métricas
        });
      }
    } catch (error) {
      // Se houver erro de autenticação ou conexão, marcar como falhado
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("NOAUTH") || errorMessage.includes("Authentication required") || errorMessage.includes("Connection")) {
          this.connectionFailed = true;
          this.connected = false;
          if (!this.errorLogged) {
            if (errorMessage.includes("NOAUTH") || errorMessage.includes("Authentication required")) {
              console.warn("⚠️  Redis requer autenticação (eventos serão ignorados).");
            } else {
              console.warn("⚠️  Redis não disponível (eventos serão ignorados):", errorMessage);
            }
            this.errorLogged = true;
          }
        }
      }
      // Ignorar outros erros silenciosamente para não interromper o fluxo da aplicação
    }
  }

  private async updateStreamLengthMetric(stream: string) {
    // Se a conexão falhou, não tentar atualizar métricas
    if (this.connectionFailed || !this.connected) {
      return;
    }

    try {
      if (this.redis.status === "end" || this.redis.status === "close") {
        return;
      }

      const length = await this.redis.xlen(stream);
      domainStreamLengthGauge.set({ stream }, length);
    } catch (error) {
      // Ignorar erros de métricas silenciosamente
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("NOAUTH") || errorMessage.includes("Authentication required") || errorMessage.includes("Connection")) {
          this.connectionFailed = true;
          this.connected = false;
        }
      }
    }
  }

  /**
   * Fecha a conexão com o Redis
   */
  async disconnect() {
    try {
      if (this.redis && this.redis.status !== "end") {
        await this.redis.quit();
      }
    } catch (error) {
      // Ignorar erros ao desconectar
    }
  }
}
