import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserRepository } from "../../users/repositories/user.repository";

type LogoutDeps = {
  userRepository: UserRepository;
  auditRepository?: OrganizationAuditLogRepository;
};

export async function registerLogoutRoute(app: FastifyInstance, deps: LogoutDeps) {
  app.post("/auth/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;
    const orgId = request.headers["x-org-id"] as string | undefined;

    // Registrar evento de logout na auditoria
    try {
      if (deps.auditRepository) {
        await deps.auditRepository.registrar({
          orgId: orgId ?? "system",
          action: "auth.logout",
          actorId: userId,
          targetId: userId,
          payload: {
            email: request.auth.email,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (auditError) {
      app.log.error({ error: auditError }, "Erro ao registrar auditoria de logout (ignorado)");
    }

    // TODO: Implementar blacklist de tokens JWT quando necessário
    // Por enquanto, o token JWT continuará válido até expirar naturalmente

    return reply.status(200).send({
      message: "Logout realizado com sucesso",
      timestamp: new Date().toISOString(),
    });
  });
}












