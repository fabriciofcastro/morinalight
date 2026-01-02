/**
 * Rate Limiting by Role
 * 
 * Rate limiting diferenciado por papel do usuário
 */

import { type Role, ROLES } from "@/lib/auth/rbac";

export interface RateLimitConfig {
    windowMs: number; // Janela de tempo em ms
    maxRequests: number; // Máximo de requisições
}

/**
 * Configuração de rate limit por role
 */
export const RATE_LIMIT_BY_ROLE: Record<Role, RateLimitConfig> = {
    [ROLES.SUPER_ADMIN]: {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 10000, // 10000 req/min
    },
    [ROLES.ADMIN]: {
        windowMs: 60 * 1000,
        maxRequests: 5000, // 5000 req/min
    },
    [ROLES.MANAGER]: {
        windowMs: 60 * 1000,
        maxRequests: 1000, // 1000 req/min
    },
    [ROLES.SUPERVISOR]: {
        windowMs: 60 * 1000,
        maxRequests: 500, // 500 req/min
    },
    [ROLES.USER]: {
        windowMs: 60 * 1000,
        maxRequests: 100, // 100 req/min
    },
    [ROLES.GUEST]: {
        windowMs: 60 * 1000,
        maxRequests: 20, // 20 req/min
    },
};

/**
 * Rate limiter por role
 */
export class RoleBasedRateLimiter {
    private requests: Map<string, number[]> = new Map();

    /**
     * Verifica se usuário excedeu rate limit
     */
    isRateLimited(userId: string, role: Role): boolean {
        const config = RATE_LIMIT_BY_ROLE[role];
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Obter requisições do usuário
        const userRequests = this.requests.get(userId) || [];

        // Filtrar apenas requisições dentro da janela
        const recentRequests = userRequests.filter((time) => time > windowStart);

        // Verificar limite
        return recentRequests.length >= config.maxRequests;
    }

    /**
     * Registra nova requisição
     */
    recordRequest(userId: string, role: Role): void {
        const now = Date.now();
        const config = RATE_LIMIT_BY_ROLE[role];
        const windowStart = now - config.windowMs;

        // Obter requisições do usuário
        const userRequests = this.requests.get(userId) || [];

        // Filtrar apenas requisições dentro da janela e adicionar nova
        const recentRequests = userRequests.filter((time) => time > windowStart);
        recentRequests.push(now);

        // Atualizar
        this.requests.set(userId, recentRequests);
    }

    /**
     * Obtém informações de rate limit
     */
    getRateLimitInfo(userId: string, role: Role): {
        limit: number;
        remaining: number;
        resetAt: Date;
    } {
        const config = RATE_LIMIT_BY_ROLE[role];
        const now = Date.now();
        const windowStart = now - config.windowMs;

        const userRequests = this.requests.get(userId) || [];
        const recentRequests = userRequests.filter((time) => time > windowStart);

        return {
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - recentRequests.length),
            resetAt: new Date(now + config.windowMs),
        };
    }

    /**
     * Limpa dados antigos (cron job)
     */
    cleanup(): void {
        const now = Date.now();
        const maxWindow = Math.max(
            ...Object.values(RATE_LIMIT_BY_ROLE).map((c) => c.windowMs),
        );

        for (const [userId, requests] of this.requests.entries()) {
            const recentRequests = requests.filter((time) => time > now - maxWindow);

            if (recentRequests.length === 0) {
                this.requests.delete(userId);
            } else {
                this.requests.set(userId, recentRequests);
            }
        }
    }
}

export const roleBasedRateLimiter = new RoleBasedRateLimiter();

/**
 * Middleware para rate limiting por role
 */
export async function rateLimitByRole(userId: string, role: Role): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
}> {
    const isLimited = roleBasedRateLimiter.isRateLimited(userId, role);

    if (isLimited) {
        const info = roleBasedRateLimiter.getRateLimitInfo(userId, role);
        return {
            allowed: false,
            ...info,
        };
    }

    // Registrar requisição
    roleBasedRateLimiter.recordRequest(userId, role);

    const info = roleBasedRateLimiter.getRateLimitInfo(userId, role);
    return {
        allowed: true,
        ...info,
    };
}

/**
 * EXEMPLO DE USO:
 * 
 * // Em API route
 * export async function GET(req: NextRequest) {
 *   const user = await getUserFromRequest(req);
 *   
 *   // Verificar rate limit
 *   const rateLimit = await rateLimitByRole(user.id, user.role);
 *   
 *   if (!rateLimit.allowed) {
 *     return NextResponse.json(
 *       {
 *         error: 'Rate limit exceeded',
 *         limit: rateLimit.limit,
 *         resetAt: rateLimit.resetAt,
 *       },
 *       {
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': rateLimit.limit.toString(),
 *           'X-RateLimit-Remaining': '0',
 *           'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
 *         },
 *       }
 *     );
 *   }
 *   
 *   // Adicionar headers de rate limit
 *   const response = NextResponse.json(data);
 *   response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
 *   response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
 *   response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
 *   
 *   return response;
 * }
 * 
 * // Cron job para cleanup (rodar a cada hora)
 * setInterval(() => {
 *   roleBasedRateLimiter.cleanup();
 * }, 60 * 60 * 1000);
 */
