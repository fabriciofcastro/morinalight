import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AtualizarDepartmentUseCase } from "../application/use-cases/atualizar-department.use-case";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  organizationalUnitRepository?: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdateDepartmentRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.put(
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
        const useCase = new AtualizarDepartmentUseCase({
          departmentRepository: deps.departmentRepository,
          organizationalUnitRepository: deps.organizationalUnitRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = {
          ...request.body,
          orgId,
          departmentId: request.params.departmentId,
        } as unknown;
        const department = await useCase.execute(input);

        return reply.status(200).send(department);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar departamento");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar departamento" });
      }
    },
  );
}

