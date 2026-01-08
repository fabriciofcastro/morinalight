/**
 * LGPD Export Route
 * Exporta dados do usuário (portabilidade)
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { lgpdExportService } from "../application/services/lgpd-export.service";

const paramsSchema = z.object({
  userId: z.string().uuid(),
});

export async function registerLgpdExportRoute(app: FastifyInstance) {
  app.get("/users/:userId/lgpd/export", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = paramsSchema.parse(request.params);
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({
        message: "Organização não especificada",
        code: "MISSING_ORG_ID",
      });
    }

    // Verificar se usuário está exportando seus próprios dados ou é admin
    if (request.auth.userId !== userId) {
      // TODO: Verificar se usuário tem permissão de admin
      return reply.status(403).send({
        message: "Apenas o próprio usuário pode exportar seus dados",
        code: "FORBIDDEN",
      });
    }

    try {
      const exportData = await lgpdExportService.generateExport(userId, orgId);

      // Retornar como JSON estruturado
      return reply.send(exportData);
    } catch (error) {
      console.error("Erro ao exportar dados LGPD:", error);
      return reply.status(500).send({
        message: "Erro ao exportar dados",
        code: "EXPORT_ERROR",
      });
    }
  });
}
