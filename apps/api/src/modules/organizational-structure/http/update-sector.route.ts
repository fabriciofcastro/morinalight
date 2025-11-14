import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AtualizarSectorUseCase } from "../application/use-cases/atualizar-sector.use-case";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdateSectorRoute(app: FastifyInstance, deps: Dependencies) {
  app.put("/sectors/:sectorId", async (request: FastifyRequest, reply: FastifyReply) => {
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

      const useCase = new AtualizarSectorUseCase({
        ...deps,
        actorId: userId,
      });

      const input = { ...request.body, orgId, sectorId: params.sectorId } as unknown;
      const sector = await useCase.execute(input);

      return reply.status(200).send(sector);
    } catch (error) {
      app.log.error(error, "Erro ao atualizar setor");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao atualizar setor" });
    }
  });
}

