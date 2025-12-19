import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const bulkActionSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
  action: z.enum(["mark_read", "mark_unread", "archive", "unarchive", "delete"]),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerBulkActionNotificationsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/notifications/bulk-action", async (request: FastifyRequest, reply: FastifyReply) => {
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

    const body = bulkActionSchema.parse(request.body ?? {});

    const results = await Promise.all(
      body.notificationIds.map(async (id) => {
        const existing = await deps.notificationRepository.findById(id);
        if (!existing || existing.orgId !== orgId) {
          return { id, success: false, error: "Notificação não encontrada ou acesso negado" };
        }

        try {
          switch (body.action) {
            case "mark_read":
              await deps.notificationRepository.markAsRead(id, request.auth?.userId ?? "");
              return { id, success: true };
            case "mark_unread":
              await deps.notificationRepository.markAsUnread(id);
              return { id, success: true };
            case "archive":
              await deps.notificationRepository.archive(id);
              return { id, success: true };
            case "unarchive":
              await deps.notificationRepository.unarchive(id);
              return { id, success: true };
            case "delete":
              await deps.notificationRepository.delete(id);
              return { id, success: true };
            default:
              return { id, success: false, error: "Ação inválida" };
          }
        } catch (error) {
          return { id, success: false, error: String(error) };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return reply.send({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount,
      },
    });
  });
}











