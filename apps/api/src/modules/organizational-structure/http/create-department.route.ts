import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarDepartmentUseCase } from "../application/use-cases/criar-department.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";

type Dependencies = {
  departmentRepository: DepartmentRepository;
  organizationalUnitRepository?: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateDepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/departments", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarDepartmentUseCase({
        departmentRepository: deps.departmentRepository,
        organizationalUnitRepository: deps.organizationalUnitRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const department = await useCase.execute(input);

      return reply.status(201).send(department);
    } catch (error) {
      app.log.error(error, "Erro ao criar departamento");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar departamento" });
    }
  });
}
