import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AtualizarTeamUseCase } from "../application/use-cases/atualizar-team.use-case";
import type { TeamRepository } from "../domain/repositories/team-repository";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  teamRepository: TeamRepository;
  departmentRepository?: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdateTeamRoute(app: FastifyInstance, deps: Dependencies) {
  app.put(
    "/teams/:teamId",
    async (request: FastifyRequest<{ Params: { teamId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new AtualizarTeamUseCase({
          teamRepository: deps.teamRepository,
          departmentRepository: deps.departmentRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { ...request.body, orgId, teamId: request.params.teamId } as unknown;
        const team = await useCase.execute(input);

        return reply.status(200).send(team);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar time");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar time" });
      }
    },
  );
}

