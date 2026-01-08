import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { addToBlacklist } from "../../../core/auth/token-blacklist.service";
import {
  type AuditContext,
  UnifiedAuditService,
} from "../../../core/security/unified-audit.service";
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

    const auditContext: AuditContext = {
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
      userId: userId,
      orgId: orgId || "system",
    };

    // 1. Registrar evento de logout na auditoria universal
    await UnifiedAuditService.logSecurity("LOGOUT", auditContext, {
      email: request.auth.email,
    });

    // 2. Adicionar token à blacklist (Revogação Real)
    if (request.auth.jti) {
      // 15 minutos é o tempo padrão de vida do access token
      await addToBlacklist(request.auth.jti, 15 * 60);
    }

    // 3. Limpar Cookies
    reply.clearCookie("access_token", { path: "/" });
    reply.clearCookie("refresh_token", { path: "/" });

    // TODO: Implementar blacklist de tokens JWT quando necessário
    // Por enquanto, o token JWT continuará válido até expirar naturalmente

    return reply.status(200).send({
      message: "Logout realizado com sucesso",
      timestamp: new Date().toISOString(),
    });
  });
}
