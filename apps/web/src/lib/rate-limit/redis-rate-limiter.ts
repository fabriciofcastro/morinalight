/**
 * Redis-Based Distributed Rate Limiter
 * 
 * Sliding window rate limiting with Redis for multi-instance deployments
 */

import Redis from 'ioredis';
import { logger } from '@/lib/observability';

export interface RateLimitConfig {
    requests: number;
    window: string; // '1m', '15m', '1h', '1d'
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid window format: ${window}`);

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return num * multipliers[unit];
}

/**
 * Redis Rate Limiter using Sliding Window algorithm
 */
export class RedisRateLimiter {
    private redis: Redis | null = null;
    private fallbackMap: Map<string, number[]> = new Map();
    private isRedisAvailable = false;

    constructor() {
        this.initializeRedis();
    }

    private async initializeRedis() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.redis = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: true,
            });

            await this.redis.connect();
            this.isRedisAvailable = true;
            logger.info('Redis rate limiter initialized');
        } catch (error) {
            logger.warn('Redis unavailable, falling back to in-memory rate limiting', error as Error);
            this.isRedisAvailable = false;
        }
    }

    /**
     * Check rate limit using sliding window algorithm
     */
    async checkLimit(
        key: string,
        config: RateLimitConfig
    ): Promise<RateLimitResult> {
        const windowMs = parseWindow(config.window);
        const now = Date.now();
        const windowStart = now - windowMs;

        if (this.isRedisAvailable && this.redis) {
            return this.checkLimitRedis(key, config.requests, windowMs, now, windowStart);
        } else {
            return this.checkLimitMemory(key, config.requests, windowMs, now, windowStart);
        }
    }

    /**
     * Redis-based rate limiting with Lua script for atomicity
     */
    private async checkLimitRedis(
        key: string,
        maxRequests: number,
        windowMs: number,
        now: number,
        windowStart: number
    ): Promise<RateLimitResult> {
        try {
            // Lua script for atomic sliding window rate limiting
            const script = `
                local key = KEYS[1]
                local now = tonumber(ARGV[1])
                local window_start = tonumber(ARGV[2])
                local max_requests = tonumber(ARGV[3])
                local window_ms = tonumber(ARGV[4])
                
                -- Remove old entries
                redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
                
                -- Count current requests
                local current = redis.call('ZCARD', key)
                
                if current < max_requests then
                    -- Add new request
                    redis.call('ZADD', key, now, now)
                    redis.call('PEXPIRE', key, window_ms)
                    return {1, max_requests - current - 1}
                else
                    -- Get oldest request time for retry-after
                    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
                    local retry_after = 0
                    if #oldest > 0 then
                        retry_after = math.ceil((tonumber(oldest[2]) + window_ms - now) / 1000)
                    end
                    return {0, 0, retry_after}
                end
            `;

            const result = await this.redis!.eval(
                script,
                1,
                `ratelimit:${key}`,
                now.toString(),
                windowStart.toString(),
                maxRequests.toString(),
                windowMs.toString()
            ) as [number, number, number?];

            const allowed = result[0] === 1;
            const remaining = result[1];
            const retryAfter = result[2];

            return {
                allowed,
                limit: maxRequests,
                remaining,
                resetAt: new Date(now + windowMs),
                retryAfter: retryAfter || undefined,
            };
        } catch (error) {
            logger.error('Redis rate limit check failed, falling back to memory', error as Error);
            this.isRedisAvailable = false;
            return this.checkLimitMemory(key, maxRequests, windowMs, now, windowStart);
        }
    }

    /**
     * In-memory fallback rate limiting
     */
    private checkLimitMemory(
        key: string,
        maxRequests: number,
        windowMs: number,
        now: number,
        windowStart: number
    ): RateLimitResult {
        const requests = this.fallbackMap.get(key) || [];

        // Remove old requests
        const recentRequests = requests.filter(time => time > windowStart);

        if (recentRequests.length < maxRequests) {
            recentRequests.push(now);
            this.fallbackMap.set(key, recentRequests);

            return {
                allowed: true,
                limit: maxRequests,
                remaining: maxRequests - recentRequests.length,
                resetAt: new Date(now + windowMs),
            };
        } else {
            const oldestRequest = Math.min(...recentRequests);
            const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

            return {
                allowed: false,
                limit: maxRequests,
                remaining: 0,
                resetAt: new Date(oldestRequest + windowMs),
                retryAfter,
            };
        }
    }

    /**
     * Cleanup old entries (for in-memory fallback)
     */
    cleanup() {
        const now = Date.now();
        const maxWindow = 24 * 60 * 60 * 1000; // 1 day

        for (const [key, requests] of this.fallbackMap.entries()) {
            const recentRequests = requests.filter(time => time > now - maxWindow);

            if (recentRequests.length === 0) {
                this.fallbackMap.delete(key);
            } else {
                this.fallbackMap.set(key, recentRequests);
            }
        }
    }

    /**
     * Close Redis connection
     */
    async close() {
        if (this.redis) {
            await this.redis.quit();
        }
    }
}

export const redisRateLimiter = new RedisRateLimiter();

// Cleanup every hour
setInterval(() => {
    redisRateLimiter.cleanup();
}, 60 * 60 * 1000);

/**
 * USAGE:
 * 
 * import { redisRateLimiter } from '@/lib/rate-limit/redis-rate-limiter';
 * 
 * // Check rate limit
 * const result = await redisRateLimiter.checkLimit(
 *   `user:${userId}`,
 *   { requests: 100, window: '1m' }
 * );
 * 
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded' },
 *     { 
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': '0',
 *         'X-RateLimit-Reset': result.resetAt.toISOString(),
 *         'Retry-After': result.retryAfter?.toString() || '60',
 *       }
 *     }
 *   );
 * }
 */
