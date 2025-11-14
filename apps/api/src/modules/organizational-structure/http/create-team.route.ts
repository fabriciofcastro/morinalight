import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarTeamUseCase } from "../application/use-cases/criar-team.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { TeamRepository } from "../domain/repositories/team-repository";

type Dependencies = {
  teamRepository: TeamRepository;
  departmentRepository?: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateTeamRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/teams", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarTeamUseCase({
        teamRepository: deps.teamRepository,
        departmentRepository: deps.departmentRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const team = await useCase.execute(input);

      return reply.status(201).send(team);
    } catch (error) {
      app.log.error(error, "Erro ao criar time");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar time" });
    }
  });
}
