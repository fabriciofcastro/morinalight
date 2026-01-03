import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarDepartmentUseCase } from "../application/use-cases/deletar-department.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { SubdepartmentRepository } from "../domain/repositories/subdepartment-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { DepartmentMembershipRepository } from "../infra/prisma/prisma-department-membership.repository";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  subdepartmentRepository?: SubdepartmentRepository;
  sectorRepository: SectorRepository;
  departmentMembershipRepository?: DepartmentMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteDepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete(
    "/departments/:departmentId",
    async (request: FastifyRequest<{ Params: { departmentId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new DeletarDepartmentUseCase({
          departmentRepository: deps.departmentRepository,
          subdepartmentRepository: deps.subdepartmentRepository,
          sectorRepository: deps.sectorRepository,
          departmentMembershipRepository: deps.departmentMembershipRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { orgId, departmentId: request.params.departmentId } as unknown;
        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao deletar departamento");

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

        return reply.status(500).send({ message: "Erro ao deletar departamento" });
      }
    },
  );
}
