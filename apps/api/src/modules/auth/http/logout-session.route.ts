import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { OrganizationAuditLogRepository } from "../../organizations/repositories/organization-audit-log.repository";
import type { UserRepository } from "../../users/repositories/user.repository";

type LogoutSessionDeps = {
  userRepository: UserRepository;
  auditRepository?: OrganizationAuditLogRepository;
};

export async function registerLogoutSessionRoute(app: FastifyInstance, deps: LogoutSessionDeps) {
  app.post("/auth/logout/:sessionId", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { sessionId } = z
      .object({
        sessionId: z.string().min(1),
      })
      .parse(request.params);

    const userId = request.auth.userId;
    const orgId = request.headers["x-org-id"] as string | undefined;

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // Registrar evento de logout de sessão específica na auditoria
    try {
      if (deps.auditRepository) {
        await deps.auditRepository.registrar({
          orgId: orgId ?? "system",
          action: "auth.logout.session",
          actorId: userId,
          targetId: userId,
          payload: {
            sessionId,
            email: user.email,
            displayName: user.displayName,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (auditError) {
      app.log.error(
        { error: auditError },
        "Erro ao registrar auditoria de logout de sessão (ignorado)",
      );
    }

    // TODO: Implementar invalidar token JWT específico quando necessário
    // Por enquanto, apenas registramos o evento na auditoria

    return reply.status(200).send({
      message: "Sessão encerrada com sucesso",
      sessionId,
      timestamp: new Date().toISOString(),
    });
  });
}
