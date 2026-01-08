import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const createApiTokenSchema = z.object({
  name: z.string().min(1).max(255),
  expiresInDays: z.number().int().min(1).max(365).optional(), // Dias até expirar
});

const prisma = getPrisma();

// Gerar token seguro
function generateApiToken(): { token: string; tokenHash: string; tokenPrefix: string } {
  const token = `mrn_${randomBytes(32).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const tokenPrefix = token.substring(0, 12) + "...";
  return { token, tokenHash, tokenPrefix };
}

export async function registerCreateApiTokenRoute(app: FastifyInstance) {
  app.post("/users/:userId/api-tokens", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const body = createApiTokenSchema.parse(request.body ?? {});

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // Gerar token
    const { token, tokenHash, tokenPrefix } = generateApiToken();

    // Calcular data de expiração
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Salvar token no banco
    const apiToken = await prisma.apiToken.create({
      data: {
        userId,
        name: body.name,
        token: tokenHash,
        tokenPrefix,
        expiresAt,
      },
    });

    // Retornar token completo apenas uma vez (não será mais exibido)
    return reply.status(201).send({
      token: {
        id: apiToken.id,
        name: apiToken.name,
        tokenPrefix: apiToken.tokenPrefix,
        expiresAt: apiToken.expiresAt,
        createdAt: apiToken.createdAt,
      },
      tokenValue: token, // Token completo (mostrar apenas uma vez)
      message: "Guarde este token em local seguro. Ele não será exibido novamente.",
    });
  });
}
