import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarBranchUseCase } from "../application/use-cases/atualizar-branch.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { BranchRepository } from "../domain/repositories/branch-repository";

type Dependencies = {
    branchRepository: BranchRepository;
    auditLogRepository?: OrganizationalStructureAuditLogRepository;
    eventBus?: DomainEventBus;
};

export async function registerUpdateBranchRoute(app: FastifyInstance, deps: Dependencies) {
    app.put("/branches/:branchId", async (request: FastifyRequest, reply: FastifyReply) => {
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
            const useCase = new AtualizarBranchUseCase({
                branchRepository: deps.branchRepository,
                auditLogRepository: deps.auditLogRepository,
                eventBus: deps.eventBus,
                actorId: userId,
            });

            const input = { ...(request.body as object), orgId, branchId } as unknown;
            const branch = await useCase.execute(input);

            return reply.status(200).send(branch);
        } catch (error) {
            app.log.error(error, "Erro ao atualizar filial");

            if (error instanceof Error) {
                if (error.message.includes("não encontrada")) {
                    return reply.status(404).send({ message: error.message });
                }
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Erro ao atualizar filial" });
        }
    });
}
