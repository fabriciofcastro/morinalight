import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const testNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.enum(["system", "security", "approval", "activity", "message", "other"]).optional(),
  channels: z.array(z.enum(["email", "push", "inApp"])).optional(),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerTestNotificationRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/notifications/test", async (request: FastifyRequest, reply: FastifyReply) => {
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

    const body = testNotificationSchema.parse(request.body ?? {});

    const notification = await deps.notificationRepository.create({
      orgId,
      userId: body.userId ?? request.auth.userId,
      type: body.type ?? "system",
      category: "Teste",
      title: "Notificação de Teste",
      message: "Esta é uma notificação de teste enviada pelo sistema.",
      channels: body.channels ?? ["inApp"],
    });

    return reply.status(201).send({
      notification,
      message: "Notificação de teste criada com sucesso",
    });
  });
}



