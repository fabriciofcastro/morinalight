/**
 * LGPD Delete Route
 * Implementa direito ao esquecimento
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { lgpdDeletionService } from "../application/services/lgpd-deletion.service";

const paramsSchema = z.object({
  userId: z.string().uuid(),
});

const bodySchema = z.object({
  reason: z.string().min(10).max(500).optional(),
  confirm: z.boolean().refine((val) => val === true, {
    message: "Confirmação obrigatória para exclusão de dados",
  }),
});

export async function registerLgpdDeleteRoute(app: FastifyInstance) {
  app.post("/users/:userId/lgpd/delete", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({
        message: "Organização não especificada",
        code: "MISSING_ORG_ID",
      });
    }

    // Verificar se usuário está deletando seus próprios dados ou é admin
    if (request.auth.userId !== userId) {
      // TODO: Verificar se usuário tem permissão de admin
      return reply.status(403).send({
        message: "Apenas o próprio usuário pode solicitar exclusão de seus dados",
        code: "FORBIDDEN",
      });
    }

    if (!body.confirm) {
      return reply.status(400).send({
        message: "Confirmação obrigatória",
        code: "CONFIRMATION_REQUIRED",
      });
    }

    try {
      await lgpdDeletionService.anonymityUser(userId, orgId);

      return reply.send({
        success: true,
        message: "Dados anonimizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar dados LGPD:", error);
      return reply.status(500).send({
        message: "Erro ao deletar dados",
        code: "DELETE_ERROR",
      });
    }
  });
}
