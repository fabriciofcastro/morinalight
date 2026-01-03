import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const prisma = getPrisma();

export async function registerGetApiTokenHistoryRoute(app: FastifyInstance) {
  app.get("/users/:userId/api-tokens/:tokenId/history", async (request: FastifyRequest, reply: FastifyReply) => {
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
    const query = querySchema.parse(request.query ?? {});

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

    // Buscar histórico de uso
    const [usage, total] = await Promise.all([
      prisma.apiTokenUsage.findMany({
        where: { tokenId },
        orderBy: { timestamp: "desc" },
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      }),
      prisma.apiTokenUsage.count({ where: { tokenId } }),
    ]);

    return reply.send({
      itens: usage,
      total,
    });
  });
}











