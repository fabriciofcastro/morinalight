import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarPositionUseCase } from "../application/use-cases/atualizar-position.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { PositionRepository } from "../domain/repositories/position-repository";

type Dependencies = {
  positionRepository: PositionRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdatePositionRoute(app: FastifyInstance, deps: Dependencies) {
  app.put("/positions/:positionId", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const useCase = new AtualizarPositionUseCase({
        ...deps,
        actorId: userId,
      });

      const input = { ...request.body, orgId, positionId: params.positionId } as unknown;
      const position = await useCase.execute(input);

      return reply.status(200).send(position);
    } catch (error) {
      app.log.error(error, "Erro ao atualizar cargo");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao atualizar cargo" });
    }
  });
}
