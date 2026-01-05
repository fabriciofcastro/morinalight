/**
 * Security Middleware Composable
 * 
 * Sistema de middleware modular para segurança de rotas API
 */

import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { logger } from "@/lib/observability";
import { intrusionDetector } from "@/lib/security/intrusion-detection";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { userRepository } from "@/lib/repositories";
import { redisRateLimiter } from "@/lib/rate-limit/redis-rate-limiter";
import { getRateLimitConfig, getRateLimitKey } from "@/lib/rate-limit/rate-limit-config";

export type MiddlewareContext = NextFetchEvent | { params?: Record<string, string | string[]> } | unknown;

export type MiddlewareFunction = (
    request: NextRequest,
    context: MiddlewareContext
) => Promise<NextResponse | null>;

/**
 * Compõe múltiplos middlewares em um único
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
    return async (request: NextRequest, context: MiddlewareContext) => {
        for (const middleware of middlewares) {
            const result = await middleware(request, context);
            if (result) {
                return result; // Middleware bloqueou a requisição
            }
        }
        return null; // Todos os middlewares passaram
    };
}

/**
 * Middleware de autenticação JWT
 */
export function authMiddleware(): MiddlewareFunction {
    return async (request: NextRequest, context: MiddlewareContext) => {
        try {
            // Obter token do cookie
            const authToken = request.cookies.get("access_token")?.value ?? request.cookies.get("auth-token")?.value;

            if (!authToken) {
                logger.warn("Missing auth token", {
                    path: request.nextUrl.pathname,
                });

                return NextResponse.json(
                    { error: "Unauthorized - Missing token" },
                    { status: 401 }
                );
            }

            // Verificar JWT
            const payload = verifyAccessToken(authToken);

            // Buscar usuário
            const user = await userRepository.findById(payload.userId);

            if (!user) {
                logger.warn("User not found for valid token", {
                    userId: payload.userId,
                });

                return NextResponse.json(
                    { error: "Unauthorized - Invalid user" },
                    { status: 401 }
                );
            }

            // Verificar se usuário está bloqueado
            if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
                logger.warn("Blocked user attempted access", {
                    userId: user.id,
                    blockedUntil: user.blockedUntil,
                });

                return NextResponse.json(
                    {
                        error: "Account temporarily blocked",
                        blockedUntil: user.blockedUntil,
                    },
                    { status: 403 }
                );
            }

            // Adicionar usuário ao contexto (para próximos middlewares)
            (request as any).user = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            return null; // Autenticação bem-sucedida
        } catch (error) {
            logger.error("Auth middleware error", error as Error);

            return NextResponse.json(
                { error: "Unauthorized - Invalid token" },
                { status: 401 }
            );
        }
    };
}

export function roleMiddleware(allowedRoles: string[]): MiddlewareFunction {
    return async (request: NextRequest, _context: MiddlewareContext) => {
        const user = (request as any).user;

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized - Authentication required" },
                { status: 401 }
            );
        }

        if (!allowedRoles.includes(user.role)) {
            logger.warn("Access denied: insufficient role", {
                userId: user.id,
                userRole: user.role,
                allowedRoles,
                path: request.nextUrl.pathname,
            });

            return NextResponse.json(
                { error: "Forbidden - Insufficient permissions" },
                { status: 403 }
            );
        }

        return null; // Role verificado com sucesso
    };
}

/**
 * Middleware de rate limiting com Redis (fallback para in-memory)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(options: {
    maxRequests: number;
    windowMs: number;
    keyGenerator?: (req: NextRequest) => string;
}): MiddlewareFunction {
    const { maxRequests, windowMs, keyGenerator } = options;

    return async (request: NextRequest, context: MiddlewareContext) => {
        // Gerar chave (por IP ou por usuário)
        const key = keyGenerator
            ? keyGenerator(request)
            : request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        try {
            if (process.env.RATE_LIMIT_ENABLED === 'true') {
                const config = getRateLimitConfig(request.nextUrl.pathname);
                const result = await redisRateLimiter.checkLimit(key, {
                    requests: maxRequests || config.requests,
                    window: config.window // Using config window for consistency
                });

                if (!result.allowed) {
                    logger.warn("Rate limit exceeded (Redis Centralized)", {
                        key,
                        remaining: result.remaining,
                        limit: result.limit,
                    });

                    return NextResponse.json(
                        {
                            error: "Too many requests",
                            retryAfter: result.retryAfter,
                        },
                        {
                            status: 429,
                            headers: {
                                "Retry-After": (result.retryAfter || 60).toString(),
                                "X-RateLimit-Limit": result.limit.toString(),
                                "X-RateLimit-Remaining": "0",
                                "X-RateLimit-Reset": result.resetAt.toISOString(),
                            },
                        }
                    );
                }
            }

            return null;
        } catch (redisError) {
            // Fallback para in-memory se Redis falhar
            logger.warn("Redis rate limiter failed, using in-memory fallback", { error: redisError });
        }

        // Fallback: In-memory rate limiting
        const now = Date.now();

        // Obter ou criar entrada
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 0, resetAt: now + windowMs });
        }

        const entry = rateLimitStore.get(key)!;

        // Reset se janela expirou
        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + windowMs;
        }

        // Verificar limite
        if (entry.count >= maxRequests) {
            logger.warn("Rate limit exceeded (in-memory)", {
                key,
                count: entry.count,
                limit: maxRequests,
            });

            return NextResponse.json(
                {
                    error: "Too many requests",
                    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((entry.resetAt - now) / 1000).toString(),
                    },
                }
            );
        }

        // Incrementar contador
        entry.count += 1;

        return null;
    };
}

/**
 * Middleware de logging de requisições
 */
export function loggingMiddleware(): MiddlewareFunction {
    return async (request: NextRequest, context: MiddlewareContext) => {
        const startTime = Date.now();

        // Log da requisição
        logger.info("API Request", {
            method: request.method,
            path: request.nextUrl.pathname,
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
            userAgent: request.headers.get("user-agent"),
            userId: (request as any).user?.id,
        });

        // Continuar (não bloqueia)
        return null;
    };
}

/**
 * Middleware de security headers
 */
export function securityHeadersMiddleware(): MiddlewareFunction {
    return async (request: NextRequest, context: MiddlewareContext) => {
        // Não bloqueia, apenas adiciona headers na resposta
        // Headers serão adicionados no middleware principal
        return null;
    };
}

/**
 * Middleware de IDS (Intrusion Detection System)
 */
export function idsMiddleware(): MiddlewareFunction {
    return async (request: NextRequest, context: MiddlewareContext) => {
        const user = (request as any).user;

        if (user) {
            // Executar análise de segurança em background (não bloqueia)
            intrusionDetector.analyzeUserSecurity(user.id).catch((error) => {
                logger.error("IDS analysis failed", error as Error);
            });
        }

        return null;
    };
}

/**
 * Middleware de CORS
 */
export function corsMiddleware(options: {
    allowedOrigins: string[];
    allowedMethods: string[];
}): MiddlewareFunction {
    const { allowedOrigins, allowedMethods } = options;

    return async (request: NextRequest, context: MiddlewareContext) => {
        const origin = request.headers.get("origin");

        // Verificar origem
        if (origin && !allowedOrigins.includes(origin) && !allowedOrigins.includes("*")) {
            logger.warn("CORS blocked", { origin, path: request.nextUrl.pathname });

            return NextResponse.json(
                { error: "CORS policy violation" },
                { status: 403 }
            );
        }

        // Verificar método
        if (!allowedMethods.includes(request.method)) {
            return NextResponse.json(
                { error: "Method not allowed" },
                { status: 405 }
            );
        }

        return null;
    };
}

/**
 * Helper para adicionar security headers na resposta
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3333 ws://localhost:3333 http: https: ws: wss:;"
    );

    return response;
}

/**
 * Middleware pré-configurado para rotas públicas
 */
export const publicRouteMiddleware = composeMiddleware(
    rateLimitMiddleware({ maxRequests: 100, windowMs: 60000 }),
    loggingMiddleware(),
    securityHeadersMiddleware()
);

/**
 * Middleware pré-configurado para rotas protegidas
 */
export const protectedRouteMiddleware = composeMiddleware(
    rateLimitMiddleware({ maxRequests: 100, windowMs: 60000 }),
    authMiddleware(),
    loggingMiddleware(),
    idsMiddleware(),
    securityHeadersMiddleware()
);

/**
 * Middleware pré-configurado para rotas admin
 */
export const adminRouteMiddleware = composeMiddleware(
    rateLimitMiddleware({ maxRequests: 50, windowMs: 60000 }),
    authMiddleware(),
    roleMiddleware(["admin", "super_admin"]),
    loggingMiddleware(),
    idsMiddleware(),
    securityHeadersMiddleware()
);

/**
 * EXEMPLO DE USO:
 * 
 * // app/api/users/route.ts
 * import { protectedRouteMiddleware } from "@/lib/middleware/security-middleware";
 * 
 * export async function GET(request: NextRequest, context: any) {
 *   // Aplicar middleware
 *   const middlewareResult = await protectedRouteMiddleware(request, context);
 *   if (middlewareResult) return middlewareResult;
 * 
 *   // Lógica da rota
 *   const users = await getUsers();
 *   return NextResponse.json(users);
 * }
 */
