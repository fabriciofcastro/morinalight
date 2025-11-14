import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarPermissionAuditLogUseCase } from "../application/use-cases/listar-permission-audit-log.use-case";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";

type Dependencies = {
  auditLogRepository: PermissionAuditLogRepository;
};

export async function registerPermissionAuditLogRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar histórico de mudanças de permissões
  app.get("/permissions/audit-log", async (request: FastifyRequest, reply: FastifyReply) => {
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
      const input = {
        orgId,
        entityType: searchParams.get("entityType") as
          | "position"
          | "sector"
          | "department"
          | "user"
          | undefined,
        entityId: searchParams.get("entityId") || undefined,
        permissionId: searchParams.get("permissionId") || undefined,
        action: searchParams.get("action") as "granted" | "denied" | "removed" | undefined,
        actorId: searchParams.get("actorId") || undefined,
        dataInicio: searchParams.get("dataInicio") || undefined,
        dataFim: searchParams.get("dataFim") || undefined,
        cursor: searchParams.get("cursor") || undefined,
        limite: searchParams.get("limite") ? parseInt(searchParams.get("limite")!, 10) : undefined,
      };

      const useCase = new ListarPermissionAuditLogUseCase({
        auditLogRepository: deps.auditLogRepository,
      });

      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar histórico de permissões");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar histórico de permissões" });
    }
  });
}
