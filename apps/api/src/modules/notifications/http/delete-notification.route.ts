import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerDeleteNotificationRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.delete("/notifications/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const existing = await deps.notificationRepository.findById(id);
    if (!existing) {
      return reply.status(404).send({
        message: "Notificação não encontrada",
        code: "NOTIFICATION_NOT_FOUND",
      });
    }

    const orgId = (request.headers["x-org-id"] as string) || request.auth.defaultOrgId;
    if (existing.orgId !== orgId) {
      return reply.status(403).send({
        message: "Acesso negado",
        code: "FORBIDDEN",
      });
    }

    const deleted = await deps.notificationRepository.delete(id);
    if (!deleted) {
      return reply.status(500).send({
        message: "Erro ao excluir notificação",
        code: "DELETE_ERROR",
      });
    }

    return reply.status(204).send();
  });
}



