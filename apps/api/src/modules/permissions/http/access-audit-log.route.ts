/**
 * Rota HTTP: Access Audit Log
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarAccessAuditLogUseCase } from "../application/use-cases/listar-access-audit-log.use-case";
import type { AccessAuditLogRepository } from "../domain/repositories/access-audit-log.repository";

type Dependencies = {
  accessAuditLogRepository: AccessAuditLogRepository;
};

export async function registerAccessAuditLogRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar logs de acesso
  app.get("/permissions/access-audit-log", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const { searchParams } = new URL(request.url);
      const limiteRaw = searchParams.get("limite");
      const input = {
        orgId,
        userId: searchParams.get("userId") || undefined,
        permission: searchParams.get("permission") || undefined,
        granted: searchParams.get("granted") === "true" ? true : searchParams.get("granted") === "false" ? false : undefined,
        ipAddress: searchParams.get("ipAddress") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        cursor: searchParams.get("cursor") || undefined,
        limit: limiteRaw ? parseInt(limiteRaw, 10) : undefined,
      };

      const useCase = new ListarAccessAuditLogUseCase({
        accessAuditLogRepository: deps.accessAuditLogRepository,
      });

      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar logs de acesso");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar logs de acesso" });
    }
  });
}

