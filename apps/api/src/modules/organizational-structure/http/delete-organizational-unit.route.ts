import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarOrganizationalUnitUseCase } from "../application/use-cases/deletar-organizational-unit.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";
import type { UnitMembershipRepository } from "../infra/prisma/prisma-unit-membership.repository";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  departmentRepository: DepartmentRepository;
  unitMembershipRepository?: UnitMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteOrganizationalUnitRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.delete(
    "/organizational-units/:unitId",
    async (request: FastifyRequest<{ Params: { unitId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new DeletarOrganizationalUnitUseCase({
          organizationalUnitRepository: deps.organizationalUnitRepository,
          departmentRepository: deps.departmentRepository,
          unitMembershipRepository: deps.unitMembershipRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { orgId, unitId: request.params.unitId } as unknown;
        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao deletar unidade organizacional");

        if (error instanceof Error) {
          if (
            error.message.includes("não encontrada") ||
            error.message.includes("não encontrado")
          ) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("Não é possível deletar")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao deletar unidade organizacional" });
      }
    },
  );
}
