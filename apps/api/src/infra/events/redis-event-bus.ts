import { randomUUID } from "node:crypto";
import type { DomainEvent, DomainEventBus } from "@morina/shared-kernel";
import { Redis } from "ioredis";

type RedisEventBusOptions = {
  url: string;
  stream?: string;
  realtimeStream?: string;
};

export class RedisEventBus implements DomainEventBus {
  private readonly redis: Redis;
  private readonly stream: string;
  private readonly realtimeStream?: string;

  constructor(options: RedisEventBusOptions) {
    this.redis = new Redis(options.url, { lazyConnect: true });
    this.stream = options.stream ?? "domain.events";
    this.realtimeStream = options.realtimeStream;
  }

  async publish<TPayload>(event: DomainEvent<TPayload>) {
    const enrichedMetadata = { ...event.metadata, eventId: event.metadata.eventId ?? randomUUID() };
    const payload = JSON.stringify({
      ...event,
      metadata: enrichedMetadata,
    });

    try {
      if (!this.redis.status || this.redis.status === "wait") {
        await this.redis.connect();
      }

      await this.redis.xadd(this.stream, "*", "event", payload);

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
      }
    } catch (error) {
      console.error("Falha ao publicar evento no Redis", error);
    }
  }
}
