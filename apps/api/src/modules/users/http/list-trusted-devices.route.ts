import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const querySchema = z.object({
  userId: z.string().uuid().optional(),
});

const prisma = getPrisma();

export async function registerListTrustedDevicesRoute(app: FastifyInstance) {
  app.get("/users/:userId/trusted-devices", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const query = querySchema.parse(request.query ?? {});

    // Verificar se o usuário existe e se o usuário logado tem permissão
    const targetUserId = query.userId ?? userId;
    if (targetUserId !== request.auth.userId) {
      // TODO: Verificar permissões de admin
    }

    const devices = await prisma.trustedDevice.findMany({
      where: { userId: targetUserId },
      orderBy: { lastUsed: "desc" },
    });

    return reply.send({ devices });
  });
}











