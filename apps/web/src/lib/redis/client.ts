/**
 * Redis Client
 * 
 * Cliente Redis para rate limiting e cache
 */

import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (redisClient) {
        return redisClient;
    }

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured');
        return null;
    }

    try {
        redisClient = new Redis({
            url,
            token,
        });

        console.log('[Redis] Client initialized successfully');
        return redisClient;
    } catch (error) {
        console.error('[Redis] Failed to initialize client:', error);
        return null;
    }
}

/**
 * Health check do Redis
 */
export async function checkRedisHealth(): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        await client.ping();
        return true;
    } catch (error) {
        console.error('[Redis] Health check failed:', error);
        return false;
    }
}
