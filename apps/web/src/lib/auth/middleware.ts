/**
 * Updated Authorization Middleware with Real JWT Validation
 * 
 * Middleware com validação real de JWT
 */

import { NextRequest, NextResponse } from "next/server";
import { can, type Role, type Action, type Resource, type UserWithPermissions } from "./rbac";
import { abacEngine } from "./abac";
import { logger } from "@/lib/observability";
import { verifyAccessToken } from "./jwt";
import { userRepository } from "@/lib/repositories";

export interface AuthContext {
    user: UserWithPermissions;
    request: NextRequest;
}

/**
 * Middleware para verificar permissão RBAC
 */
export function requirePermission(action: Action, resource: Resource) {
    return async function middleware(
        request: NextRequest,
        context: { params: any },
    ): Promise<NextResponse | null> {
        // Obter usuário do request
        const user = await getUserFromRequest(request);

        if (!user) {
            logger.warn("Unauthorized access attempt", {
                path: request.nextUrl.pathname,
                action,
                resource,
            });

            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Verificar permissão RBAC
        if (!can(user.role, action, resource)) {
            logger.warn("Access denied - insufficient permissions", {
                userId: user.id,
                userRole: user.role,
                action,
                resource,
                path: request.nextUrl.pathname,
            });

            // Audit log de acesso negado
            await logAccessDenied(user, action, resource, request);

            return NextResponse.json(
                { error: "Forbidden - Insufficient permissions" },
                { status: 403 },
            );
        }

        // Log de acesso autorizado
        logger.info("Access granted", {
            userId: user.id,
            userRole: user.role,
            action,
            resource,
            path: request.nextUrl.pathname,
        });

        // Continuar para o handler
        return null;
    };
}

/**
 * Middleware para verificar permissão ABAC
 */
export function requirePolicy(policyId: string) {
    return async function middleware(
        request: NextRequest,
        context: { params: any },
    ): Promise<NextResponse | null> {
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Obter recurso do request
        const resourceData = await getResourceFromRequest(request, context);

        // Avaliar política ABAC
        const { allowed, reason } = abacEngine.evaluate(
            user,
            resourceData,
            request.method.toLowerCase(),
            {
                hour: new Date().getHours(),
                ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
            },
        );

        if (!allowed) {
            logger.warn("Access denied by ABAC policy", {
                userId: user.id,
                policyId,
                reason,
                path: request.nextUrl.pathname,
            });

            await logAccessDenied(user, request.method, resourceData, request);

            return NextResponse.json(
                { error: `Forbidden - ${reason}` },
                { status: 403 },
            );
        }

        logger.info("Access granted by ABAC policy", {
            userId: user.id,
            policyId,
            path: request.nextUrl.pathname,
        });

        return null;
    };
}

/**
 * Combina múltiplos middlewares
 */
export function compose(...middlewares: Array<(req: NextRequest, ctx: any) => Promise<NextResponse | null>>) {
    return async function composedMiddleware(
        request: NextRequest,
        context: any,
    ): Promise<NextResponse | null> {
        for (const middleware of middlewares) {
            const result = await middleware(request, context);
            if (result) {
                return result; // Middleware retornou resposta, parar execução
            }
        }
        return null; // Todos os middlewares passaram
    };
}

/**
 * Helper para obter usuário do request - IMPLEMENTAÇÃO REAL
 */
async function getUserFromRequest(request: NextRequest): Promise<UserWithPermissions | null> {
    try {
        // Obter token do cookie httpOnly
        const authToken = request.cookies.get("auth-token")?.value;

        if (!authToken) {
            return null;
        }

        // Validar JWT token
        const payload = verifyAccessToken(authToken);

        // Buscar usuário no banco
        const user = await userRepository.findById(payload.userId);

        if (!user) {
            logger.warn("User not found for valid token", { userId: payload.userId });
            return null;
        }

        // Verificar se role do token bate com role do usuário
        if (user.role !== payload.role) {
            logger.warn("Role mismatch", {
                userId: user.id,
                tokenRole: payload.role,
                userRole: user.role,
            });
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role as Role,
        };
    } catch (error) {
        logger.error("Failed to get user from request", error as Error);
        return null;
    }
}

/**
 * Helper para obter recurso do request
 */
async function getResourceFromRequest(
    request: NextRequest,
    context: { params: any },
): Promise<any> {
    // Obter de params
    if (context.params) {
        return context.params;
    }

    // Obter de body
    try {
        const body = await request.json();
        return body;
    } catch {
        return {};
    }
}

/**
 * Log de acesso negado para audit trail
 */
async function logAccessDenied(
    user: UserWithPermissions,
    action: string,
    resource: any,
    request: NextRequest,
) {
    try {
        await fetch("/api/audit/access-denied", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                userRole: user.role,
                action,
                resource: typeof resource === "string" ? resource : resource?.constructor?.name,
                resourceId: resource?.id,
                path: request.nextUrl.pathname,
                method: request.method,
                ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
                userAgent: request.headers.get("user-agent"),
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (error) {
        logger.error("Failed to log access denied", error as Error);
    }
}

/**
 * EXEMPLO DE USO:
 * 
 * // app/api/users/[id]/route.ts
 * import { requirePermission } from "@/lib/auth/middleware";
 * import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";
 * 
 * export async function DELETE(
 *   request: NextRequest,
 *   context: { params: { id: string } }
 * ) {
 *   // Verificar permissão
 *   const authResult = await requirePermission(ACTIONS.DELETE, RESOURCES.USERS)(request, context);
 *   if (authResult) return authResult;
 * 
 *   // Lógica de delete
 *   await deleteUser(context.params.id);
 *   return NextResponse.json({ success: true });
 * }
 */
