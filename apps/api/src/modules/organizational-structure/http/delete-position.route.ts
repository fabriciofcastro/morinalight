import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarPositionUseCase } from "../application/use-cases/deletar-position.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { PositionRepository } from "../domain/repositories/position-repository";
import type { PositionMembershipRepository } from "../infra/prisma/prisma-position-membership.repository";

type Dependencies = {
  positionRepository: PositionRepository;
  positionMembershipRepository?: PositionMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeletePositionRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete("/positions/:positionId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const params = request.params as { positionId: string };

      const useCase = new DeletarPositionUseCase({
        positionRepository: deps.positionRepository,
        positionMembershipRepository: deps.positionMembershipRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      await useCase.execute({
        orgId,
        positionId: params.positionId,
      });

      return reply.status(204).send();
    } catch (error) {
      app.log.error(error, "Erro ao deletar cargo");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao deletar cargo" });
    }
  });
}
