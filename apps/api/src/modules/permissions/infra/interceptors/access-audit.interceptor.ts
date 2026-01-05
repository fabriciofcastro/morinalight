import type { FastifyReply, FastifyRequest } from "fastify";
import type { AccessAuditLogRepository } from "../domain/repositories/access-audit-log.repository";

export class AccessAuditInterceptor {
    constructor(private readonly accessAuditLogRepository: AccessAuditLogRepository) { }

    async intercept(request: FastifyRequest, reply: FastifyReply, payload: unknown) {
        // Apenas logar se for uma rota autenticada e tiver contexto de organização
        const userId = (request.user as any)?.id;
        const orgId = request.headers["x-org-id"] as string;

        if (!userId || !orgId) {
            return;
        }

        // Extrair informações da rota e método
        const { method, url, routerPath } = request;
        const statusCode = reply.statusCode;

        // Tentar inferir a permissão baseada na rota (opcional)
        // Ou simplesmente logar o acesso à API
        // Para logs de permissão específicos, o UseCase já cuida.
        // Este interceptor serve para "Auditoria de Acesso Geral" (quem acessou o quê).

        try {
            // Nota: O repositório AccessAuditLogRepository espera 'permission' e 'granted'.
            // Se este log for genérico de acesso à API, podemos usar uma permissão coringa "api:access"

            await this.accessAuditLogRepository.registrar({
                orgId,
                userId,
                permission: "api:access", // Marcador para acesso geral via API
                granted: statusCode >= 200 && statusCode < 400,
                reason: statusCode >= 400 ? `HTTP ${statusCode}` : null,
                ipAddress: request.ip,
                userAgent: request.headers["user-agent"] || "unknown",
                resource: routerPath || url,
                endpoint: method,
                metadata: {
                    statusCode,
                    url,
                },
            });
        } catch (error) {
            request.log.error(error, "Falha ao registrar auditoria de acesso no interceptor");
        }
    }
}
