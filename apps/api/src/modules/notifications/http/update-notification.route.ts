import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerUpdateNotificationRoute(app: FastifyInstance, deps: Dependencies) {
  app.put("/notifications/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = updateNotificationSchema.parse(request.body ?? {});

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

    const updateData: {
      read?: boolean;
      archived?: boolean;
      readAt?: Date | null;
      archivedAt?: Date | null;
    } = {};

    if (body.read !== undefined) {
      updateData.read = body.read;
      updateData.readAt = body.read ? new Date() : null;
    }

    if (body.archived !== undefined) {
      updateData.archived = body.archived;
      updateData.archivedAt = body.archived ? new Date() : null;
    }

    const notification = await deps.notificationRepository.update(id, updateData);
    if (!notification) {
      return reply.status(500).send({
        message: "Erro ao atualizar notificação",
        code: "UPDATE_ERROR",
      });
    }

    return reply.send({ notification });
  });
}
