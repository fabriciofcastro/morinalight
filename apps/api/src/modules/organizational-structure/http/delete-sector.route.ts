import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarSectorUseCase } from "../application/use-cases/deletar-sector.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { PositionRepository } from "../domain/repositories/position-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { SectorMembershipRepository } from "../infra/prisma/prisma-sector-membership.repository";

type Dependencies = {
  sectorRepository: SectorRepository;
  positionRepository?: PositionRepository;
  sectorMembershipRepository?: SectorMembershipRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteSectorRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete("/sectors/:sectorId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const params = request.params as { sectorId: string };

      const useCase = new DeletarSectorUseCase({
        sectorRepository: deps.sectorRepository,
        positionRepository: deps.positionRepository,
        sectorMembershipRepository: deps.sectorMembershipRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      await useCase.execute({
        orgId,
        sectorId: params.sectorId,
      });

      return reply.status(204).send();
    } catch (error) {
      app.log.error(error, "Erro ao deletar setor");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao deletar setor" });
    }
  });
}
