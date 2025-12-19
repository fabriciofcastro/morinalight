/**
 * Refresh Token Route
 * Implementa rotação de refresh tokens
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { signToken } from "../../../core/auth/jwt-rs256.service";
import { addToBlacklist } from "../../../core/auth/token-blacklist.service";

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

      // Verificar se token foi revogado
      if (refreshTokenRecord.revoked) {
        return reply.status(401).send({
          message: "Refresh token revogado",
          code: "REVOKED_REFRESH_TOKEN",
        });
      }

      // Verificar se token expirou
      if (refreshTokenRecord.expiresAt && refreshTokenRecord.expiresAt < new Date()) {
        // Deletar token expirado
        await prisma.refreshToken.delete({
          where: { id: refreshTokenRecord.id },
        });

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

      // Gerar novo access token
      const accessToken = signToken(
        {
          sub: refreshTokenRecord.userId,
          email: refreshTokenRecord.user.email,
          defaultOrgId,
        },
        "15m", // Access token expira em 15 minutos
      );

      // Rotação de refresh token (opcional - pode manter o mesmo)
      // Por segurança, vamos gerar um novo e revogar o antigo
      const newRefreshToken = generateRefreshToken();
      const newTokenHash = hashRefreshToken(newRefreshToken);

      // Calcular nova expiração (30 dias)
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      // Criar novo refresh token
      await prisma.refreshToken.create({
        data: {
          userId: refreshTokenRecord.userId,
          token: newTokenHash,
          expiresAt: newExpiresAt,
        },
      });

      // Revogar token antigo
      await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { revoked: true },
      });

      // Se o access token antigo tinha jti, adicionar à blacklist
      // (não temos jti do access token antigo aqui, mas podemos melhorar isso)

      return reply.send({
        token: accessToken,
        refreshToken: newRefreshToken, // Retornar apenas uma vez
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
          errors: error.errors,
        });
      }

      console.error("Erro ao processar refresh token:", error);
      return reply.status(500).send({
        message: "Erro interno do servidor",
      });
    }
  });
}

