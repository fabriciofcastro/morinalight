import { randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import { Redis } from "ioredis";
import type { WebSocket } from "ws";

type Connection = {
  socket: WebSocket;
  actorId: string;
};

export class RealtimeHub {
  private readonly connections = new Map<string, Set<Connection>>();
  private readonly redis: Redis;
  private readonly stream: string;
  private readonly group = "realtime-consumers";
  private readonly consumerId = `consumer:${randomUUID()}`;
  private polling = false;

  constructor(
    redisUrl: string,
    stream: string,
    private readonly logger: FastifyBaseLogger,
  ) {
    this.redis = new Redis(redisUrl, { lazyConnect: true });
    this.stream = stream;
  }

  async start() {
    await this.ensureConnection();
    await this.ensureGroup();
    this.polling = true;
    void this.poll();
  }

  async stop() {
    this.polling = false;
    await this.redis.quit();
  }

  addConnection(orgId: string, actorId: string, socket: WebSocket) {
    const group = this.connections.get(orgId) ?? new Set<Connection>();
    group.add({ socket, actorId });
    this.connections.set(orgId, group);

    socket.on("close", () => {
      group.forEach((connection) => {
        if (connection.socket === socket) {
          group.delete(connection);
        }
      });
      if (group.size === 0) {
        this.connections.delete(orgId);
      }
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
              };
              this.broadcast(payload.metadata.orgId, payloadRaw);
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

  private broadcast(orgId: string, message: string) {
    const connections = this.connections.get(orgId);
    if (!connections) return;

    connections.forEach(({ socket }) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    });
  }
}
