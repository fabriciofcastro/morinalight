import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export async function registerListApiTokensRoute(app: FastifyInstance) {
  app.get("/users/:userId/api-tokens", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    const tokens = await prisma.apiToken.findMany({
      where: {
        userId,
        revokedAt: null, // Apenas tokens ativos
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return reply.send({ tokens });
  });
}
