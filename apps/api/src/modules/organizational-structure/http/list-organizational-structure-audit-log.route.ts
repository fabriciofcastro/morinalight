import type { FastifyInstance } from "fastify";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import { ListarOrganizationalStructureAuditLogUseCase } from "../application/use-cases/listar-organizational-structure-audit-log.use-case";
import { extractOrgIdFromParamsOrHeaders } from "../../../core/tenant/tenant.utils";

type Dependencies = {
  auditLogRepository: OrganizationalStructureAuditLogRepository;
};

export async function registerListOrganizationalStructureAuditLogRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  const useCase = new ListarOrganizationalStructureAuditLogUseCase({
    auditLogRepository: deps.auditLogRepository,
  });

  app.get("/organizational-structure/audit-log", async (request, reply) => {
    const orgId = extractOrgIdFromParamsOrHeaders(request);

    if (!orgId) {
      return reply.status(400).send({ error: "orgId é obrigatório" });
    }

    const query = request.query as Record<string, unknown>;

    const resultado = await useCase.execute({
      orgId,
      entityType: query.entityType as string | undefined,
      entityId: query.entityId as string | undefined,
      action: query.action as string | undefined,
      cursor: query.cursor as string | undefined,
      limite: query.limite ? Number(query.limite) : undefined,
      dataInicio: query.dataInicio as string | undefined,
      dataFim: query.dataFim as string | undefined,
      search: query.search as string | undefined,
    });

    return reply.send(resultado);
  });
}




