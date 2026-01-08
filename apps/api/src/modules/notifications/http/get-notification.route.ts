import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerGetNotificationRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/notifications/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const notification = await deps.notificationRepository.findById(id);
    if (!notification) {
      return reply.status(404).send({
        message: "Notificação não encontrada",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    const orgId = (request.headers["x-org-id"] as string) || request.auth.defaultOrgId;
    if (notification.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado",
        code: "FORBIDDEN",
      });
    }

    return reply.send({ notification });
  });
}
