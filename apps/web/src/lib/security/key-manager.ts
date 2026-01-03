
import { getRedisClient } from "@/lib/redis/client";
import { logger } from "@/lib/observability";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type KeyType = "JWT_SECRET" | "NEXTAUTH_SECRET" | "API_KEY";

const KEY_PREFIX = "security:keys";
const KEY_HISTORY_LIMIT = 5; // Keep last 5 keys for grace period

export class KeyManager {
    private injectedRedis: Redis | null = null;

    constructor(redisClient?: Redis) {
        if (redisClient) {
            this.injectedRedis = redisClient;
        }
    }

    private getClient(): Redis | null {
        return this.injectedRedis || getRedisClient();
    }

    /**
     * Retrieves the current active key for a given type.
     * If no key exists in Redis, it falls back to the environment variable.
     */
    async getCurrentKey(type: KeyType): Promise<string> {
        const redis = this.getClient();
        try {
            const redisKey = `${KEY_PREFIX}:${type}:current`;
            let currentKey: string | null = null;

            if (redis) {
                currentKey = await redis.get<string>(redisKey);
            } else {
                logger.warn("Redis client not initialized, using fallback key interaction");
            }

            if (currentKey) {
                return currentKey;
            }

            // Fallback to env var if not in Redis
            const envKey = this.getEnvKey(type);
            if (envKey) {
                // Initialize Redis with the env key if missing
                await this.setCurrentKey(type, envKey);
                return envKey;
            }

            throw new Error(`No key found for type ${type}`);
        } catch (error) {
            logger.error(`Failed to get current key for ${type}`, error as Error);
            // Failover to env var on Redis error
            return this.getEnvKey(type) || "";
        }
    }

    /**
     * Rotates the key for a given type.
     * Moves the current key to history and generates a new one.
     */
    async rotateKey(type: KeyType): Promise<string> {
        const redis = this.getClient();
        if (!redis) throw new Error("Redis client not initialized");

        const redisCurrentKey = `${KEY_PREFIX}:${type}:current`;
        const redisHistoryKey = `${KEY_PREFIX}:${type}:history`;

        try {
            // Get current key
            const currentKey = await redis.get<string>(redisCurrentKey);

            // Generate new high-entropy key
            const newKey = crypto.randomBytes(64).toString("hex");

            // Transaction: Push current string to history, set new key
            const pipeline = redis.pipeline();

            if (currentKey) {
                pipeline.lpush(redisHistoryKey, currentKey);
                pipeline.ltrim(redisHistoryKey, 0, KEY_HISTORY_LIMIT - 1);
            }

            pipeline.set(redisCurrentKey, newKey);

            await pipeline.exec();

            logger.info(`Key rotated successfully for ${type}`);
            return newKey;

        } catch (error) {
            logger.error(`Failed to rotate key for ${type}`, error as Error);
            throw error;
        }
    }

    /**
     * Validates if a token content matches any valid key (current or history).
     * Useful for verifying signatures during rotation grace periods.
     */
    async isValidKey(keyOrSignature: string, type: KeyType, validator: (key: string) => boolean): Promise<boolean> {
        const redis = this.getClient();

        // Check current key
        const currentKey = await this.getCurrentKey(type);
        if (validator(currentKey)) return true;

        if (!redis) return false;

        // Check history
        const historyKeys = await redis.lrange<string>(`${KEY_PREFIX}:${type}:history`, 0, -1);
        for (const historyKey of historyKeys) {
            if (validator(historyKey)) return true;
        }

        return false;
    }

    private async setCurrentKey(type: KeyType, value: string): Promise<void> {
        const redis = this.getClient();
        if (redis) {
            await redis.set(`${KEY_PREFIX}:${type}:current`, value);
        }
    }

    private getEnvKey(type: KeyType): string | undefined {
        switch (type) {
            case "JWT_SECRET": return process.env.JWT_SECRET;
            case "NEXTAUTH_SECRET": return process.env.NEXTAUTH_SECRET; // This ensures we are fetching from environment correctly if not in Redis
            case "API_KEY": return process.env.API_KEY || "default-api-key";
            default: return undefined;
        }
    }
}

export const keyManager = new KeyManager();
