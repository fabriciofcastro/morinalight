import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Global Audit Interceptor
 * 
 * Logs all requests for security audit trail
 */
export async function globalAuditInterceptor(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const start = Date.now();

    // Add hook to log after response is sent
    reply.addHook("onSend", async () => {
        const duration = Date.now() - start;

        // Log all requests
        const auditLog = {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            userId: (request.user as any)?.userId || "anonymous",
            orgId: (request.user as any)?.orgId,
            duration,
            statusCode: reply.statusCode,
            ip: request.ip,
            userAgent: request.headers["user-agent"],
        };

        // Log to console (in production, send to audit system)
        console.log("[AUDIT]", JSON.stringify(auditLog));

        // TODO: Integrate with audit system v3.0
        // await auditService.log(auditLog);
    });
}
