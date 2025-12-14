import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DeletarBranchUseCase } from "../application/use-cases/deletar-branch.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { BranchRepository } from "../domain/repositories/branch-repository";

type Dependencies = {
  branchRepository: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDeleteBranchRoute(app: FastifyInstance, deps: Dependencies) {
  app.delete("/branches/:branchId", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
    const { branchId } = request.params as { branchId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new DeletarBranchUseCase({
        branchRepository: deps.branchRepository,
        auditLogRepository: deps.auditLogRepository,
        eventBus: deps.eventBus,
        actorId: userId,
      });

      await useCase.execute({ orgId, branchId });

      return reply.status(204).send();
    } catch (error) {
      app.log.error(error, "Erro ao deletar filial");

      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao deletar filial" });
    }
  });
}
