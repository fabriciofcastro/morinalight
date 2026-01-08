import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerMarkAllReadRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/notifications/mark-all-read", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = (request.headers["x-org-id"] as string) || request.auth.defaultOrgId;
    if (!orgId) {
      return reply.status(400).send({
        message: "x-org-id é obrigatório",
        code: "ORG_ID_REQUIRED",
      });
    }

    const count = await deps.notificationRepository.markAllAsRead(orgId, request.auth.userId);

    return reply.send({ count });
  });
}
