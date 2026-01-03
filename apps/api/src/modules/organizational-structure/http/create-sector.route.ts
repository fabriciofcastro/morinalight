import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarSectorUseCase } from "../application/use-cases/criar-sector.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";

type Dependencies = {
  sectorRepository: SectorRepository;
  departmentRepository: DepartmentRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateSectorRoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/sectors", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarSectorUseCase({
        ...deps,
        actorId: userId,
      });

      const body = request.body as Record<string, unknown>;
      const input = { ...body, orgId };
      const sector = await useCase.execute(input);

      return reply.status(201).send(sector);
    } catch (error) {
      app.log.error(error, "Erro ao criar setor");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar setor" });
    }
  });
}
