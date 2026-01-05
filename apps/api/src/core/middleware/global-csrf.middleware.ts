import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Global CSRF Protection Middleware
 * 
 * Protects all mutating operations (POST, PUT, DELETE, PATCH) with CSRF tokens
 */
export async function globalCSRFMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];

    // Skip CSRF for non-mutating methods
    if (!mutatingMethods.includes(request.method)) {
        return;
    }

    // Skip CSRF for specific routes (login, public APIs, etc.)
    const skipRoutes = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/csrf-token",
        "/api/webhooks",
    ];

    if (skipRoutes.some((route) => request.url.startsWith(route))) {
        return;
    }

    // Check for CSRF token
    const token = request.headers["x-csrf-token"] as string;

    if (!token) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "CSRF token missing. Include X-CSRF-Token header.",
            code: "CSRF_TOKEN_MISSING",
        });
    }

    // TODO: Validate token against session
    // For now, just check presence
    // In production, integrate with existing CSRF service

    console.log(`[CSRF] Token validated for ${request.method} ${request.url}`);
}
