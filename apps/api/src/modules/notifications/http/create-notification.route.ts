import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const createNotificationSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  type: z.enum(["system", "security", "approval", "activity", "message", "other"]),
  category: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  actionUrl: z.string().url().optional().nullable(),
  actionLabel: z.string().max(100).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  channels: z.array(z.enum(["email", "push", "inApp"])).optional(),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerCreateNotificationRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/notifications", async (request: FastifyRequest, reply: FastifyReply) => {
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

    const body = createNotificationSchema.parse(request.body ?? {});

    const notification = await deps.notificationRepository.create({
      orgId,
      userId: body.userId ?? null,
      type: body.type,
      category: body.category,
      title: body.title,
      message: body.message,
      actionUrl: body.actionUrl ?? null,
      actionLabel: body.actionLabel ?? null,
      metadata: body.metadata ?? null,
      channels: body.channels,
    });

    return reply.status(201).send({ notification });
  });
}



