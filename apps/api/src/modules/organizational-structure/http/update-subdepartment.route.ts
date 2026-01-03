import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarSubdepartmentUseCase } from "../application/use-cases/atualizar-subdepartment.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { SubdepartmentRepository } from "../domain/repositories/subdepartment-repository";
import type { BranchRepository } from "../domain/repositories/branch-repository";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
  branchRepository?: BranchRepository;
  auditLogRepository?: OrganizationalStructureAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdateSubdepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.put(
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
        const useCase = new AtualizarSubdepartmentUseCase({
          subdepartmentRepository: deps.subdepartmentRepository,
          branchRepository: deps.branchRepository,
          auditLogRepository: deps.auditLogRepository,
          eventBus: deps.eventBus,
          actorId: userId,
        });

        const body = request.body as Record<string, unknown>;
        const input = {
          ...body,
          orgId,
          subdepartmentId: request.params.subdepartmentId,
        };
        const subdepartment = await useCase.execute(input);

        return reply.status(200).send(subdepartment);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar subdepartamento");

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

        return reply.status(500).send({ message: "Erro ao atualizar subdepartamento" });
      }
    },
  );
}

