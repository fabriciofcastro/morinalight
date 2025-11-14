import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarOrganizationalUnitUseCase } from "../application/use-cases/atualizar-organizational-unit.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdateOrganizationalUnitRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.put(
    "/organizational-units/:unitId",
    async (request: FastifyRequest<{ Params: { unitId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new AtualizarOrganizationalUnitUseCase({
          organizationalUnitRepository: deps.organizationalUnitRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { ...request.body, orgId, unitId: request.params.unitId } as unknown;
        const unit = await useCase.execute(input);

        return reply.status(200).send(unit);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar unidade organizacional");

        if (error instanceof Error) {
          if (
            error.message.includes("não encontrada") ||
            error.message.includes("não encontrado")
          ) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar unidade organizacional" });
      }
    },
  );
}
