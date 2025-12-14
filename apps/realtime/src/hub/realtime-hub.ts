import { randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import { Redis } from "ioredis";
import type { WebSocket } from "ws";
import {
  broadcastCounter,
  connectionsGauge,
  connectionsPerOrgGauge,
  pendingMessagesGauge,
} from "../observability/metrics";

type Connection = {
  socket: WebSocket;
  actorId: string;
};

type RealtimeHubOptions = {
  pendingAlertThreshold?: number;
  pendingAlertIntervalMs?: number;
};

export class RealtimeHub {
  private readonly connections = new Map<string, Set<Connection>>();
  private readonly redis: Redis;
  private readonly stream: string;
  private readonly group = "realtime-consumers";
  private readonly consumerId = `consumer:${randomUUID()}`;
  private polling = false;
  private readonly pendingAlertThreshold: number;
  private readonly pendingAlertIntervalMs: number;
  private pendingTimer?: NodeJS.Timeout;

  constructor(
    redisUrl: string,
    stream: string,
    private readonly logger: FastifyBaseLogger,
    options: RealtimeHubOptions = {},
  ) {
    this.redis = new Redis(redisUrl, { lazyConnect: true });
    this.redis.on("error", (err) => {
      this.logger.error({ err }, "Erro de conexão com Redis (realtime)");
    });
    this.stream = stream;
    this.pendingAlertThreshold = options.pendingAlertThreshold ?? 100;
    this.pendingAlertIntervalMs = options.pendingAlertIntervalMs ?? 30000;
  }

  async start() {
    await this.ensureConnection();
    await this.ensureGroup();
    this.polling = true;
    void this.poll();
    this.schedulePendingMonitor();
  }

  async stop() {
    this.polling = false;
    if (this.pendingTimer) {
      clearInterval(this.pendingTimer);
      this.pendingTimer = undefined;
    }
    await this.redis.quit();
    this.connections.clear();
    connectionsGauge.set(0);
    connectionsPerOrgGauge.reset();
    pendingMessagesGauge.set({ stream: this.stream, consumer_group: this.group }, 0);
  }

  addConnection(orgId: string, actorId: string, socket: WebSocket) {
    const group = this.connections.get(orgId) ?? new Set<Connection>();
    group.add({ socket, actorId });
    this.connections.set(orgId, group);
    this.updateConnectionMetrics(orgId);

    socket.on("close", () => {
      group.forEach((connection) => {
        if (connection.socket === socket) {
          group.delete(connection);
        }
      });
      if (group.size === 0) {
        this.connections.delete(orgId);
        try {
          connectionsPerOrgGauge.remove({ org_id: orgId });
        } catch {
          // gauge remove may throw if not registered; ignore
        }
      }
      this.updateConnectionMetrics(orgId);
    });
  }

  private async ensureConnection() {
    if (!this.redis.status || this.redis.status === "wait") {
      await this.redis.connect();
    }
  }

  private async ensureGroup() {
    try {
      await this.redis.xgroup("CREATE", this.stream, this.group, "0", "MKSTREAM");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("BUSYGROUP")) {
        this.logger.error({ err: error }, "Falha ao criar consumer group");
      }
    }
  }

  private async poll() {
    while (this.polling) {
      try {
        const entries = (await this.redis.xreadgroup(
          "GROUP",
          this.group,
          this.consumerId,
          "COUNT",
          50,
          "BLOCK",
          5000,
          "STREAMS",
          this.stream,
          ">",
        )) as Array<[string, Array<[string, Array<string | Buffer>]>]> | null;

        if (!entries) {
          continue;
        }

        for (const [, messages] of entries) {
          for (const [id, fields] of messages) {
            const value = fields[1];
            const payloadRaw = typeof value === "string" ? value : value?.toString();
            if (!payloadRaw) {
              await this.redis.xack(this.stream, this.group, id);
              continue;
            }

            try {
              const payload = JSON.parse(payloadRaw) as {
                metadata: { orgId: string };
                name?: string;
              };
              this.broadcast(payload.metadata.orgId, payloadRaw, payload.name);
            } catch (error) {
              this.logger.error({ err: error }, "Falha ao processar evento realtime");
            } finally {
              await this.redis.xack(this.stream, this.group, id);
            }
          }
        }
      } catch (error) {
        this.logger.error({ err: error }, "Erro ao consumir stream realtime");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private broadcast(orgId: string, message: string, eventName?: string) {
    const connections = this.connections.get(orgId);
    if (!connections) return;

    // Para notificações, entregamos apenas ao usuário-alvo (metadata.actorId).
    // Para outros eventos (Permissions.*, etc.), mantém broadcast por organização.
    const isNotificationEvent =
      eventName === "Notification.Created" ||
      eventName === "notification.created" ||
      (typeof eventName === "string" && eventName.includes("Notification"));

    let targetActorId: string | null = null;
    if (isNotificationEvent) {
      try {
        const parsed = JSON.parse(message) as { metadata?: { actorId?: string } };
        targetActorId = typeof parsed?.metadata?.actorId === "string" ? parsed.metadata.actorId : null;
      } catch {
        targetActorId = null;
      }
    }

    let delivered = 0;
    connections.forEach(({ socket, actorId }) => {
      if (targetActorId && actorId !== targetActorId) {
        return;
      }
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
        delivered += 1;
      }
    });
    broadcastCounter.inc({ event_name: eventName ?? "unknown" }, delivered);
  }

  private updateConnectionMetrics(orgId?: string) {
    const total = Array.from(this.connections.values()).reduce((acc, set) => acc + set.size, 0);
    connectionsGauge.set(total);

    if (orgId) {
      const size = this.connections.get(orgId)?.size ?? 0;
      if (size === 0) {
        try {
          connectionsPerOrgGauge.remove({ org_id: orgId });
        } catch {
          // ignore
        }
      } else {
        connectionsPerOrgGauge.labels(orgId).set(size);
      }
    } else {
      for (const [id, set] of this.connections.entries()) {
        connectionsPerOrgGauge.labels(id).set(set.size);
      }
    }
  }

  private schedulePendingMonitor() {
    if (this.pendingTimer) {
      return;
    }

    this.pendingTimer = setInterval(() => {
      void this.checkPendingMessages();
    }, this.pendingAlertIntervalMs);
    // Evita manter o processo ativo só por causa do timer
    this.pendingTimer.unref();
  }

  private async checkPendingMessages() {
    try {
      await this.ensureConnection();
      const result = (await this.redis.xpending(this.stream, this.group)) as
        | [string, string | null, string | null, Array<[string, string]>]
        | undefined;

      const pendingRaw = Array.isArray(result) ? result[0] : "0";
      const pending = typeof pendingRaw === "number" ? pendingRaw : Number(pendingRaw ?? 0);

      pendingMessagesGauge.set(
        { stream: this.stream, consumer_group: this.group },
        Number.isFinite(pending) ? pending : 0,
      );

      if (pending > this.pendingAlertThreshold) {
        this.logger.warn(
          { pending, stream: this.stream, group: this.group },
          "Mensagens pendentes acima do limite configurado",
        );
      }
    } catch (error) {
      this.logger.error(
        { err: error },
        "Falha ao verificar mensagens pendentes no stream realtime",
      );
    }
  }
}
