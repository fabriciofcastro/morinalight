import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CriarOrganizationalUnitUseCase } from "../application/use-cases/criar-organizational-unit.use-case";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateOrganizationalUnitRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/organizational-units", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new CriarOrganizationalUnitUseCase({
        organizationalUnitRepository: deps.organizationalUnitRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      const input = { ...request.body, orgId } as unknown;
      const unit = await useCase.execute(input);

      return reply.status(201).send(unit);
    } catch (error) {
      app.log.error(error, "Erro ao criar unidade organizacional");

      if (error instanceof Error) {
        if (error.message.includes("já existe")) {
          return reply.status(409).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao criar unidade organizacional" });
    }
  });
}

