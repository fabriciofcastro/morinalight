/**
 * Redis Rate Limiter
 * 
 * Rate limiting baseado em Redis com sliding window
 */

import { getRedisClient } from './client';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export interface RateLimitOptions {
    key: string;
    limit: number;
    window: number; // seconds
}

/**
 * Rate limiter com sliding window usando Redis
 */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const { key, limit, window } = options;
    const redis = getRedisClient();

    // Fallback para in-memory se Redis não disponível
    if (!redis) {
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: Date.now() + window * 1000,
        };
    }

    try {
        const now = Date.now();
        const windowStart = now - window * 1000;

        // Usar pipeline para operações atômicas
        const pipeline = redis.pipeline();

        // Remover entradas antigas
        pipeline.zremrangebyscore(key, 0, windowStart);

        // Contar requisições na janela
        pipeline.zcard(key);

        // Adicionar nova requisição
        pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

        // Definir expiração
        pipeline.expire(key, window);

        const results = await pipeline.exec();

        // results[1] é o count antes de adicionar a nova requisição
        const count = (results[1] as number) || 0;

        const success = count < limit;
        const remaining = Math.max(0, limit - count - 1);
        const reset = now + window * 1000;

        return {
            success,
            limit,
            remaining,
            reset,
        };
    } catch (error) {
        console.error('[Redis Rate Limiter] Error:', error);

        // Fallback: permitir requisição em caso de erro
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: Date.now() + window * 1000,
        };
    }
}

/**
 * Limpa rate limit para uma chave específica
 */
export async function clearRateLimit(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(key);
    } catch (error) {
        console.error('[Redis Rate Limiter] Failed to clear:', error);
    }
}

/**
 * Obtém informações de rate limit sem incrementar
 */
export async function getRateLimitInfo(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const redis = getRedisClient();

    if (!redis) {
        return {
            success: true,
            limit,
            remaining: limit,
            reset: Date.now() + window * 1000,
        };
    }

    try {
        const now = Date.now();
        const windowStart = now - window * 1000;

        await redis.zremrangebyscore(key, 0, windowStart);
        const count = await redis.zcard(key);

        return {
            success: count < limit,
            limit,
            remaining: Math.max(0, limit - count),
            reset: now + window * 1000,
        };
    } catch (error) {
        console.error('[Redis Rate Limiter] Error getting info:', error);
        return {
            success: true,
            limit,
            remaining: limit,
            reset: Date.now() + window * 1000,
        };
    }
}
