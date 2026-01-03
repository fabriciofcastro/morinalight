import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { NotificationRepository } from "../domain/repositories/notification-repository";

const querySchema = z.object({
  userId: z.string().uuid().optional().nullable(),
});

type Dependencies = {
  notificationRepository: NotificationRepository;
};

export async function registerGetNotificationStatsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/notifications/stats", async (request: FastifyRequest, reply: FastifyReply) => {
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
    const stats = await deps.notificationRepository.getStats(
      orgId,
      query.userId ?? request.auth.userId,
    );

    return reply.send(stats);
  });
}



