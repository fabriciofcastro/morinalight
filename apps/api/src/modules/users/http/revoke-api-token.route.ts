import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const prisma = getPrisma();

export async function registerRevokeApiTokenRoute(app: FastifyInstance) {
  app.delete("/users/:userId/api-tokens/:tokenId", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId, tokenId } = z
      .object({
        userId: z.string().uuid(),
        tokenId: z.string().uuid(),
      })
      .parse(request.params);

    // Verificar se o token existe e pertence ao usuário
    const token = await prisma.apiToken.findUnique({
      where: { id: tokenId },
    });

    if (!token || token.userId !== userId) {
      return reply.status(404).send({
        message: "Token não encontrado",
        code: "TOKEN_NOT_FOUND",
      });
    }

    // Revogar token (soft delete)
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
      },
    });

    return reply.status(204).send();
  });
}











