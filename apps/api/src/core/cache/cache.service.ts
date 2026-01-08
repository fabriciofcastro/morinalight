/**
 * Robust caching service with Redis backend and fallback
 * Provides TTL, invalidation, and cache warming capabilities
 */

import Redis from "ioredis";
import { env } from "../config/env";

export type CacheOptions = {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  serialize?: boolean;
};

export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  version: number;
};

const DEFAULT_TTL = 3600; // 1 hour
const DEFAULT_PREFIX = "cache:";
const CACHE_VERSION = 1;

export class CacheService {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly prefix: string;

  constructor(redisUrl?: string, prefix: string = DEFAULT_PREFIX) {
    this.prefix = prefix;

    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: true,
          lazyConnect: true,
        });

        this.redis.on("error", (error) => {
          console.warn("[Cache] Redis error, falling back to memory cache:", error.message);
          // Continue using memory cache on Redis errors
        });

        // Connect asynchronously
        this.redis.connect().catch(() => {
          console.warn("[Cache] Redis connection failed, using memory cache");
        });
      } catch (error) {
        console.warn("[Cache] Failed to initialize Redis, using memory cache:", error);
      }
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);

    // Try Redis first if available
    if (this.redis && this.redis.status === "ready") {
      try {
        const cached = await this.redis.get(fullKey);
        if (cached) {
          const entry = JSON.parse(cached) as CacheEntry<T>;
          if (entry.expiresAt > Date.now() && entry.version === CACHE_VERSION) {
            return entry.value;
          }
          // Expired, delete it
          await this.redis.del(fullKey).catch(() => {
            // Ignore deletion errors
          });
        }
      } catch (error) {
        // Fall back to memory cache on error
        console.warn("[Cache] Redis get error, using memory cache:", error);
      }
    }

    // Fall back to memory cache
    const memoryEntry = this.memoryCache.get(fullKey);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.value as T;
    }

    // Expired or not found
    if (memoryEntry) {
      this.memoryCache.delete(fullKey);
    }

    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getFullKey(key, options.prefix);
    const ttl = options.ttl || DEFAULT_TTL;
    const expiresAt = Date.now() + ttl * 1000;

    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      version: CACHE_VERSION,
    };

    // Store in Redis if available
    if (this.redis && this.redis.status === "ready") {
      try {
        await this.redis.setex(fullKey, ttl, JSON.stringify(entry));
      } catch (error) {
        // Fall back to memory cache on error
        console.warn("[Cache] Redis set error, using memory cache:", error);
      }
    }

    // Always store in memory cache as fallback
    this.memoryCache.set(fullKey, { value, expiresAt });

    // Clean up expired entries periodically (10% chance per set)
    if (Math.random() < 0.1) {
      this.cleanupMemoryCache();
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, prefix?: string): Promise<void> {
    const fullKey = this.getFullKey(key, prefix);

    // Delete from Redis
    if (this.redis && this.redis.status === "ready") {
      try {
        await this.redis.del(fullKey);
      } catch (error) {
        console.warn("[Cache] Redis delete error:", error);
      }
    }

    // Delete from memory cache
    this.memoryCache.delete(fullKey);
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string, prefix?: string): Promise<void> {
    const fullPattern = this.getFullKey(pattern, prefix);

    // Delete from Redis
    if (this.redis && this.redis.status === "ready") {
      try {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.warn("[Cache] Redis delete pattern error:", error);
      }
    }

    // Delete from memory cache
    const regex = new RegExp(fullPattern.replace(/\*/g, ".*"));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.getFullKey(key, prefix);

    // Check Redis
    if (this.redis && this.redis.status === "ready") {
      try {
        const exists = await this.redis.exists(fullKey);
        if (exists) {
          return true;
        }
      } catch (error) {
        // Fall back to memory cache
      }
    }

    // Check memory cache
    const memoryEntry = this.memoryCache.get(fullKey);
    return memoryEntry !== undefined && memoryEntry.expiresAt > Date.now();
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh value
    const value = await fetchFn();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Warm cache with multiple values
   */
  async warmCache<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>,
  ): Promise<void> {
    await Promise.all(entries.map((entry) => this.set(entry.key, entry.value, entry.options)));
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string, customPrefix?: string): string {
    const prefix = customPrefix || this.prefix;
    return `${prefix}${key}`;
  }

  /**
   * Clean up expired entries from memory cache
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      redisConnected: this.redis?.status === "ready",
      memoryCacheSize: this.memoryCache.size,
      prefix: this.prefix,
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear Redis
    if (this.redis && this.redis.status === "ready") {
      try {
        const keys = await this.redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.warn("[Cache] Redis clear error:", error);
      }
    }

    // Clear memory cache
    this.memoryCache.clear();
  }

  /**
   * Disconnect Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService(env.REDIS_URL, DEFAULT_PREFIX);
  }
  return cacheServiceInstance;
}
