import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const querySchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.enum(["system", "security", "approval", "activity", "message", "other"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerGetNotificationHistoryRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/notifications/history", async (request: FastifyRequest, reply: FastifyReply) => {
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

    const query = querySchema.parse(request.query ?? {});

    const result = await deps.notificationRepository.list({
      orgId,
      userId: query.userId ?? request.auth.userId,
      type: query.type,
      archived: true, // Histórico = notificações arquivadas
      limit: query.limit,
      offset: query.offset,
    });

    return reply.send(result);
  });
}
