/**
 * Refresh Token Route
 * Implementa rotação de refresh tokens com detecção de reuso
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { signToken } from "../../../core/auth/jwt-rs256.service";
import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * Gera hash do refresh token para armazenamento seguro
 */
function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Gera novo refresh token
 */
function generateRefreshToken(): string {
  return `mrn_refresh_${randomBytes(32).toString("base64url")}`;
}

export async function registerRefreshTokenRoute(app: FastifyInstance) {
  app.post("/auth/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = refreshTokenSchema.parse(request.body ?? {});

      // Buscar refresh token no banco
      const tokenHash = hashRefreshToken(body.refreshToken);
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { token: tokenHash },
        include: { user: true },
      });

      if (!refreshTokenRecord) {
        return reply.status(401).send({
          message: "Refresh token inválido",
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      // 🛡️ REUSE DETECTION: Se tentar usar um token já revogado,
      // pode ser um ataque de repetição (token roubado).
      // AÇÃO: Revogar TODAS as sessões do usuário por segurança.
      if (refreshTokenRecord.revoked) {
        console.warn(
          `⚠️ [SECURITY] Refresh Token REUSE detectado para usuário ${refreshTokenRecord.userId}. Revogando tudo.`,
        );

        await prisma.refreshToken.updateMany({
          where: { userId: refreshTokenRecord.userId },
          data: {
            revoked: true,
            revokedAt: new Date(),
          },
        });

        // Revogar também as sessões web baseadas em Prisma
        await prisma.userSession.updateMany({
          where: { userId: refreshTokenRecord.userId },
          data: {
            isActive: false,
            revokedAt: new Date(),
            revokedBy: "reuse_detection_emergency",
          },
        });

        return reply.status(401).send({
          message: "Brecha de segurança detectada. Por favor, faça login novamente.",
          code: "SECURITY_BREACH_REUSE",
        });
      }

      // Verificar se token expirou
      if (refreshTokenRecord.expiresAt && refreshTokenRecord.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
        return reply.status(401).send({
          message: "Refresh token expirado",
          code: "EXPIRED_REFRESH_TOKEN",
        });
      }

      // Verificar se usuário está ativo
      if (refreshTokenRecord.user.status !== "active") {
        return reply.status(403).send({
          message: "Usuário inativo",
          code: "USER_INACTIVE",
        });
      }

      // Obter organizações do usuário
      const memberships = await prisma.organizationMembership.findMany({
        where: { userId: refreshTokenRecord.userId },
        include: { organization: true },
      });

      const organizations = memberships.map((m) => ({
        organizationId: m.organizationId,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      }));

      const defaultOrgId = organizations[0]?.organizationId ?? null;

      // Gerar novo access token (RS256)
      const accessToken = signToken(
        {
          sub: refreshTokenRecord.userId,
          email: refreshTokenRecord.user.email,
          defaultOrgId,
        },
        "15m",
      );

      // 🔄 ROTAÇÃO: Gerar novo e vincular ao antigo
      const newRefreshToken = generateRefreshToken();
      const newTokenHash = hashRefreshToken(newRefreshToken);
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      // Criar novo vinculando ao antigo
      const newRecord = await prisma.refreshToken.create({
        data: {
          userId: refreshTokenRecord.userId,
          token: newTokenHash,
          expiresAt: newExpiresAt,
        },
      });

      // Revogar token antigo vinculando ao novo
      await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
          replacedBy: newRecord.id,
        },
      });

      return reply.send({
        token: accessToken,
        refreshToken: newRefreshToken,
        user: {
          userId: refreshTokenRecord.userId,
          email: refreshTokenRecord.user.email,
          displayName: refreshTokenRecord.user.displayName,
        },
        organizations,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          message: "Dados inválidos",
          errors: error.issues, // ✅ Use issues instead of errors for better type compatibility
        });
      }

      console.error("Erro ao processar refresh token:", error);
      return reply.status(500).send({
        message: "Erro interno do servidor",
      });
    }
  });
}
