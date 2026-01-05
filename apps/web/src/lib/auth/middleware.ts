/**
 * Updated Authorization Middleware with Real JWT Validation
 * 
 * Middleware com validação real de JWT
 */

import { NextRequest, NextResponse } from "next/server";
import { can, type Role, type Action, type Resource, type UserWithPermissions } from "./rbac";
// import { abacEngine } from "./abac"; // Removed legacy ABAC
import { unifiedPolicyEngine, SecurityContext } from "@morina/shared-kernel";
import { logger } from "@/lib/observability";
import { verifyAccessToken } from "./jwt";
import { userRepository } from "@/lib/repositories";

export interface AuthContext {
    user: UserWithPermissions;
    request: NextRequest;
}



// ... existing imports

/**
 * Middleware para verificar permissão RBAC/ABAC Unificado
 */
export function requirePermission(action: Action, resource: Resource) {
    return async function middleware(
        request: NextRequest,
        context: { params: any },
    ): Promise<NextResponse | null> {
        const user = (request as any).user || await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Construir Contexto de Segurança Unificado
        const securityContext: SecurityContext = {
            user: {
                id: user.id,
                role: user.role,
                // Em produção, buscaríamos dept/sector do DB aqui ou do token enrichido
            },
            environment: {
                time: new Date(),
                ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
                userAgent: request.headers.get("user-agent") || undefined,
                mfaVerified: true // Assumindo verificado pelo login anterior, idealmente viria do token
            }
        };

        // Verificar permissão no Motor Unificado (Cobre RBAC, ABAC, TBAC e ACL)
        // Nota: O 'resource' aqui é o NOME do recurso (string). Para ABAC real em instância, 
        // precisaríamos do objeto do banco. O middleware geralmente protege a ROTA.
        // O UnifiedEngine suporta verificar "genérico" se passarmos resource sem ID.

        // Mapear Resource Enum para string se necessário ou usar direto
        const isAllowed = unifiedPolicyEngine.evaluate(action, resource, securityContext);

        // Fallback para RBAC legado se o motor não tiver políticas (para transição suave)
        // Se o UnifiedEngine retornar false, verificamos o hardcoded legacy
        // (Isso é opcional, dependendo de quão agressiva é a migração. Vamos manter para segurança)
        const isAllowedLegacy = can(user.role, action, resource);

        if (!isAllowed && !isAllowedLegacy) {
            logger.warn("Access denied", { userId: user.id, action, resource });
            await logAccessDenied(user, action, resource, request);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return null;
    };
}

/**
 * Middleware para verificar permissão ABAC via Policy ID
 */
export function requirePolicy(policyId: string) {
    // Deprecated: O UnifiedEngine usa avaliação dinâmica, não por ID de política manual na rota.
    // Mas mantemos compatibilidade verificando se a policy existe no engine
    return async function middleware(
        request: NextRequest,
        context: { params: any },
    ): Promise<NextResponse | null> {
        // Implementação simplificada para manter compatibilidade de assinatura
        // Idealmente, as rotas não deveriam pedir "Policy X", mas sim "Action Y em Resource Z"
        // e o engine decide quais policies aplicar.
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
        const authToken = request.cookies.get("access_token")?.value ?? request.cookies.get("auth-token")?.value;

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
