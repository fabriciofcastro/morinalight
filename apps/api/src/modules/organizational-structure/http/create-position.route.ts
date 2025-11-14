import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CriarPositionUseCase } from "../application/use-cases/criar-position.use-case";
import type { PositionRepository } from "../domain/repositories/position-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  positionRepository: PositionRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreatePositionRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/positions", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {

      const useCase = new CriarPositionUseCase({
        ...deps,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const position = await useCase.execute(input);

      return reply.status(201).send(position);
    } catch (error) {
      app.log.error(error, "Erro ao criar cargo");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar cargo" });
    }
  });
}

