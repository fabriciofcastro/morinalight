import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarSubdepartmentUseCase } from "../application/use-cases/deletar-subdepartment.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { SubdepartmentRepository } from "../domain/repositories/subdepartment-repository";
import type { SectorRepository } from "../domain/repositories/sector-repository";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  sectorRepository: SectorRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteSubdepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete(
    "/subdepartments/:subdepartmentId",
    async (request: FastifyRequest<{ Params: { subdepartmentId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new DeletarSubdepartmentUseCase({
          subdepartmentRepository: deps.subdepartmentRepository,
          sectorRepository: deps.sectorRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const input = { orgId, subdepartmentId: request.params.subdepartmentId } as unknown;
        await useCase.execute(input);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao deletar subdepartamento");

        if (error instanceof Error) {
          if (
            error.message.includes("não encontrada") ||
            error.message.includes("não encontrado")
          ) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("Não é possível deletar")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao deletar subdepartamento" });
      }
    },
  );
}

