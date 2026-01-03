/**
 * Redis Service
 * Serviço centralizado para conexão com Redis usando ioredis
 */

import Redis, { type RedisOptions } from "ioredis";
import { env } from "../../core/config/env";

let redisClient: Redis | null = null;
let hasAuthError = false; // Flag para evitar tentativas infinitas em caso de erro de autenticação

/**
 * Obtém ou cria cliente Redis
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL || process.env.REDIS_URL;

    if (!redisUrl) {
      // Em desenvolvimento, não falhar se Redis não estiver configurado
      if (env.NODE_ENV === "development") {
        console.warn("⚠️ [REDIS] REDIS_URL não configurada. Redis será desabilitado.");
        // Retornar um cliente mock que não faz nada
        redisClient = new Redis({
          lazyConnect: true,
          enableOfflineQueue: false,
        });
        return redisClient;
      }
      throw new Error(
        "REDIS_URL não configurada. Verifique se o arquivo .env existe e contém REDIS_URL",
      );
    }

    const redisOptions: RedisOptions = {
      lazyConnect: true,
      retryStrategy: (times: number) => {
        // Se houver erro de autenticação, parar imediatamente
        if (hasAuthError) {
          return null;
        }
        if (times > 10) {
          console.error("❌ [REDIS] Máximo de tentativas de reconexão atingido");
          return null; // Parar tentativas
        }
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 0, // Desabilitar retry automático para evitar erros não tratados
      enableReadyCheck: true,
      connectTimeout: 5000,
      commandTimeout: 5000,
      // Se a URL não contém senha, tentar usar variáveis de ambiente separadas
      password: process.env.REDIS_PASSWORD || undefined,
      // Desabilitar reconexão automática se houver erro de autenticação
      enableOfflineQueue: false, // Não enfileirar comandos quando offline
    };

    // Se a URL já contém autenticação, usar diretamente
    // Caso contrário, usar as opções configuradas
    try {
      redisClient = new Redis(redisUrl, redisOptions);
    } catch (error) {
      console.error("❌ [REDIS] Erro ao criar cliente:", error);
      // Em desenvolvimento, continuar sem Redis
      if (env.NODE_ENV === "development") {
        redisClient = new Redis({
          lazyConnect: true,
          enableOfflineQueue: false,
        });
        return redisClient;
      }
      throw error;
    }

    redisClient.on("error", (err) => {
      // Detectar erro de autenticação e parar tentativas
      if (err.message.includes("NOAUTH") || err.message.includes("Authentication")) {
        hasAuthError = true;
        // Em desenvolvimento, apenas logar uma vez e silenciar
        if (env.NODE_ENV === "development") {
          if (!redisClient?.options?.lazyConnect) {
            console.error("❌ [REDIS] Erro de autenticação:", err.message);
            console.error("💡 [REDIS] Dica: Verifique se a senha está correta na REDIS_URL ou configure REDIS_PASSWORD");
            console.error("   Formato da URL: redis://:senha@host:port ou redis://host:port (com REDIS_PASSWORD)");
            console.warn("⚠️ [REDIS] Continuando sem Redis - alguns recursos podem não funcionar");
          }
        } else {
          console.error("❌ [REDIS] Erro de autenticação:", err.message);
          console.error("💡 [REDIS] Dica: Verifique se a senha está correta na REDIS_URL ou configure REDIS_PASSWORD");
        }
        // Parar tentativas de reconexão e desconectar
        if (redisClient) {
          // Remover todos os listeners de erro para evitar erros não tratados
          redisClient.removeAllListeners("error");
          // Adicionar listener que silencia todos os erros
          redisClient.on("error", () => {
            // Silenciar todos os erros após autenticação falhar
          });
          // Desconectar de forma segura
          try {
            const disconnectResult = redisClient.disconnect();
            if (disconnectResult && typeof disconnectResult.catch === "function") {
              disconnectResult.catch(() => {
                // Ignorar erros ao desconectar
              });
            }
          } catch {
            // Ignorar erros ao desconectar
          }
        }
        return;
      }
      // Para outros erros, apenas logar se não for erro de conexão fechada
      if (!err.message.includes("Connection is closed") && !err.message.includes("ECONNREFUSED")) {
        console.error("❌ [REDIS] Erro:", err.message);
      }
    });

    redisClient.on("connect", () => {
      if (env.NODE_ENV === "development") {
        console.log("✅ [REDIS] Conectando...");
      }
    });

    redisClient.on("ready", () => {
      if (env.NODE_ENV === "development") {
        console.log("✅ [REDIS] Conectado e pronto");
      }
    });

    redisClient.on("reconnecting", () => {
      if (env.NODE_ENV === "development") {
        console.log("🔄 [REDIS] Reconectando...");
      }
    });

    // Conectar (não bloquear se Redis não estiver disponível)
    redisClient.connect().catch((err) => {
      // Ignorar erros de autenticação em desenvolvimento se Redis não estiver configurado
      if (env.NODE_ENV === "development" && (!env.REDIS_URL && !process.env.REDIS_URL)) {
        return; // Silenciosamente ignorar se não estiver configurado
      }
      
      // Se for erro de autenticação, marcar flag e parar tentativas
      if (err.message.includes("NOAUTH") || err.message.includes("Authentication")) {
        hasAuthError = true;
        // Desabilitar reconexão automática desconectando
        if (redisClient) {
          try {
            const disconnectResult = redisClient.disconnect();
            if (disconnectResult && typeof disconnectResult.catch === "function") {
              disconnectResult.catch(() => {
                // Ignorar erros ao desconectar
              });
            }
          } catch {
            // Ignorar erros ao desconectar
          }
        }
        // Em desenvolvimento, apenas logar uma vez
        if (env.NODE_ENV === "development") {
          // Já foi logado no handler de erro, não repetir
        }
        return;
      }
      
      // Para outros erros, apenas logar se não for erro de conexão fechada
      if (!err.message.includes("Connection is closed") && !err.message.includes("ECONNREFUSED")) {
        console.error("❌ [REDIS] Erro ao conectar:", err.message);
      }
      
      // Em desenvolvimento, continuar sem Redis (fallback)
      if (env.NODE_ENV === "development") {
        // Não repetir o aviso, já foi logado
      } else if (env.NODE_ENV === "production") {
        // Em produção, não falhar imediatamente, mas logar erro
        console.error("⚠️ [REDIS] Redis não disponível em produção - alguns recursos podem não funcionar");
      }
    });
  }

  return redisClient;
}

/**
 * Fecha conexão com Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    hasAuthError = false; // Resetar flag ao desconectar
  }
}

/**
 * Verifica se Redis está disponível
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    // Verificar se está conectado
    if (client.status !== "ready" && client.status !== "connect") {
      // Tentar conectar se não estiver conectado
      if (client.status === "wait" || client.status === "end") {
        await client.connect();
      }
    }
    const result = await client.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

