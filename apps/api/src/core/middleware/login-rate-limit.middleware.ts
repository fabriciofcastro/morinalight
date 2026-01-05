import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { getRedisClient } from "../../infra/cache/redis.service";

type RateLimitConfig = {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs: number;
};

const DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 15 * 60 * 1000, // 15 minutos de bloqueio
};

export class LoginRateLimiter {
    private redis = getRedisClient();
    private config: RateLimitConfig;

    constructor(config: Partial<RateLimitConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    private getKey(identifier: string): string {
        return `rate_limit:login:${identifier}`;
    }

    private getBlockKey(identifier: string): string {
        return `rate_limit:login:block:${identifier}`;
    }

    async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt?: Date; blockedUntil?: Date }> {
        try {
            const blockKey = this.getBlockKey(identifier);
            const blocked = await this.redis.get(blockKey);

            if (blocked) {
                const ttl = await this.redis.ttl(blockKey);
                return {
                    allowed: false,
                    remaining: 0,
                    blockedUntil: new Date(Date.now() + ttl * 1000),
                };
            }

            const key = this.getKey(identifier);
            const current = await this.redis.get(key);
            const attempts = current ? parseInt(current, 10) : 0;

            if (attempts >= this.config.maxAttempts) {
                // Bloquear por blockDurationMs
                await this.redis.set(blockKey, "1", "PX", this.config.blockDurationMs);
                await this.redis.del(key);

                return {
                    allowed: false,
                    remaining: 0,
                    blockedUntil: new Date(Date.now() + this.config.blockDurationMs),
                };
            }

            const ttl = await this.redis.ttl(key);
            const resetAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : new Date(Date.now() + this.config.windowMs);

            return {
                allowed: true,
                remaining: this.config.maxAttempts - attempts,
                resetAt,
            };
        } catch (error) {
            console.error("Rate Limiter Error:", error);
            // Fail open - permitir em caso de erro do Redis
            return { allowed: true, remaining: this.config.maxAttempts };
        }
    }

    async recordAttempt(identifier: string): Promise<void> {
        try {
            const key = this.getKey(identifier);
            const current = await this.redis.get(key);

            if (current) {
                await this.redis.incr(key);
            } else {
                await this.redis.set(key, "1", "PX", this.config.windowMs);
            }
        } catch (error) {
            console.error("Rate Limiter Record Error:", error);
        }
    }

    async reset(identifier: string): Promise<void> {
        try {
            await this.redis.del(this.getKey(identifier));
            await this.redis.del(this.getBlockKey(identifier));
        } catch (error) {
            console.error("Rate Limiter Reset Error:", error);
        }
    }
}

export function createLoginRateLimitMiddleware(config?: Partial<RateLimitConfig>) {
    const limiter = new LoginRateLimiter(config);

    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Usar IP como identificador (pode ser melhorado com fingerprint)
        const identifier = request.ip;

        const result = await limiter.checkLimit(identifier);

        if (!result.allowed) {
            const retryAfter = result.blockedUntil
                ? Math.ceil((result.blockedUntil.getTime() - Date.now()) / 1000)
                : Math.ceil(config?.blockDurationMs ?? DEFAULT_CONFIG.blockDurationMs / 1000);

            reply.header("Retry-After", retryAfter.toString());
            reply.header("X-RateLimit-Limit", config?.maxAttempts ?? DEFAULT_CONFIG.maxAttempts);
            reply.header("X-RateLimit-Remaining", "0");
            reply.header("X-RateLimit-Reset", result.blockedUntil?.toISOString() ?? "");

            return reply.status(429).send({
                error: "RATE_LIMIT_EXCEEDED",
                message: `Muitas tentativas de login. Tente novamente em ${retryAfter} segundos.`,
                code: "RATE_LIMIT",
                retryAfter,
                blockedUntil: result.blockedUntil,
            });
        }

        // Adicionar headers informativos
        reply.header("X-RateLimit-Limit", config?.maxAttempts ?? DEFAULT_CONFIG.maxAttempts);
        reply.header("X-RateLimit-Remaining", result.remaining.toString());
        if (result.resetAt) {
            reply.header("X-RateLimit-Reset", result.resetAt.toISOString());
        }

        // Armazenar limiter no request para uso posterior
        (request as any).rateLimiter = limiter;
    };
}

export async function registerLoginRateLimitHook(app: FastifyInstance, config?: Partial<RateLimitConfig>) {
    const middleware = createLoginRateLimitMiddleware(config);

    // Aplicar apenas na rota de login
    app.addHook("preHandler", async (request, reply) => {
        if (request.url === "/api/auth/login" && request.method === "POST") {
            await middleware(request, reply);
        }
    });
}
