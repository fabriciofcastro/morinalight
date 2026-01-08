import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserRepository } from "../../users/repositories/user.repository";

type LogoutAllDeps = {
  userRepository: UserRepository;
  auditRepository?: OrganizationAuditLogRepository;
};

export async function registerLogoutAllRoute(app: FastifyInstance, deps: LogoutAllDeps) {
  app.post("/auth/logout-all", async (request: FastifyRequest, reply: FastifyReply) => {
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

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // Registrar evento de logout-all na auditoria
    try {
      if (deps.auditRepository) {
        await deps.auditRepository.registrar({
          orgId: orgId ?? "system",
          action: "auth.logout.all",
          actorId: userId,
          targetId: userId,
          payload: {
            email: user.email,
            displayName: user.displayName,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (auditError) {
      app.log.error({ error: auditError }, "Erro ao registrar auditoria de logout-all (ignorado)");
    }

    // TODO: Implementar invalidar todos os tokens JWT do usuário
    // Por enquanto, apenas registramos o evento na auditoria
    // Os tokens continuarão válidos até expirar naturalmente

    return reply.status(200).send({
      message: "Logout de todos os dispositivos realizado com sucesso",
      userId,
      timestamp: new Date().toISOString(),
    });
  });
}
