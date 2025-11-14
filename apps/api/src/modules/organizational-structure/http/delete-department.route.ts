import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DeletarDepartmentUseCase } from "../application/use-cases/deletar-department.use-case";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteDepartmentRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
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
          sectorRepository: deps.sectorRepository,
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
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
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

