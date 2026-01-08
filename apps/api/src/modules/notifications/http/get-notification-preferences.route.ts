import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const querySchema = z.object({
  userId: z.string().uuid().optional(),
});

const prisma = getPrisma();

export async function registerGetNotificationPreferencesRoute(app: FastifyInstance) {
  app.get("/notifications/preferences", async (request: FastifyRequest, reply: FastifyReply) => {
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
    const userId = query.userId ?? request.auth.userId;

    const preferences = await prisma.notificationPreference.findMany({
      where: {
        orgId,
        userId,
      },
    });

    return reply.send({ preferences });
  });
}
