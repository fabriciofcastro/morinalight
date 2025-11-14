import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DeletarTeamUseCase } from "../application/use-cases/deletar-team.use-case";
import type { TeamRepository } from "../domain/repositories/team-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";
import type {
  TeamMembershipRepository,
} from "../infra/prisma/prisma-team-membership.repository";

type Dependencies = {
  teamRepository: TeamRepository;
  teamMembershipRepository?: TeamMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteTeamRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete(
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
        const useCase = new DeletarTeamUseCase({
          teamRepository: deps.teamRepository,
          teamMembershipRepository: deps.teamMembershipRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { orgId, teamId: request.params.teamId } as unknown;
        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao deletar time");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("Não é possível deletar")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao deletar time" });
      }
    },
  );
}

