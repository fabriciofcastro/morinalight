import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarSubdepartmentUseCase } from "../application/use-cases/criar-subdepartment.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { BranchRepository } from "../domain/repositories/branch-repository";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { SubdepartmentRepository } from "../domain/repositories/subdepartment-repository";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  departmentRepository: DepartmentRepository;
  branchRepository?: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateSubdepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/subdepartments", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarSubdepartmentUseCase({
        subdepartmentRepository: deps.subdepartmentRepository,
        departmentRepository: deps.departmentRepository,
        branchRepository: deps.branchRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const body = request.body as Record<string, unknown>;
      const input = { ...body, orgId };
      const subdepartment = await useCase.execute(input);

      return reply.status(201).send(subdepartment);
    } catch (error) {
      app.log.error(error, "Erro ao criar subdepartamento");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar subdepartamento" });
    }
  });
}
