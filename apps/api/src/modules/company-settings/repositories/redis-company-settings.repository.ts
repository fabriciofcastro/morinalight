import { Redis } from "ioredis";

import type { CompanySettings } from "../company-settings.schema";
import type { CompanySettingsRepository } from "./company-settings.repository";

export class RedisCompanySettingsRepository implements CompanySettingsRepository {
  private readonly redis: Redis;
  private readonly keyPrefix = "company-settings";

  constructor(url: string) {
    this.redis = new Redis(url, { lazyConnect: true });
  }

  private buildKey(orgId: string) {
    return `${this.keyPrefix}:${orgId}`;
  }

  async find(orgId: string): Promise<CompanySettings | null> {
    const key = this.buildKey(orgId);

    if (!this.redis.status || this.redis.status === "wait") {
      await this.redis.connect();
    }

    const stored = await this.redis.get(key);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as CompanySettings;
    } catch {
      return null;
    }
  }

  async save(orgId: string, settings: CompanySettings) {
    const key = this.buildKey(orgId);

    if (!this.redis.status || this.redis.status === "wait") {
      await this.redis.connect();
    }

    await this.redis.set(key, JSON.stringify(settings));
  }
}
