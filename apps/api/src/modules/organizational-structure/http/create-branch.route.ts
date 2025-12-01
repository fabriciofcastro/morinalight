import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarBranchUseCase } from "../application/use-cases/criar-branch.use-case";
import type { OrganizationalStructureAuditLogRepository } from "../domain/repositories";
import type { BranchRepository } from "../domain/repositories/branch-repository";

type Dependencies = {
    branchRepository: BranchRepository;
    auditLogRepository?: OrganizationalStructureAuditLogRepository;
    eventBus?: DomainEventBus;
};

export async function registerCreateBranchRoute(app: FastifyInstance, deps: Dependencies) {
    app.post("/branches", async (request: FastifyRequest, reply: FastifyReply) => {
        const orgId = request.headers["x-org-id"] as string;
        const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

        if (!orgId) {
            return reply.status(400).send({ message: "x-org-id é obrigatório" });
        }

        if (!userId) {
            return reply.status(400).send({ message: "Usuário não identificado" });
        }

        try {
            const useCase = new CriarBranchUseCase({
                branchRepository: deps.branchRepository,
                auditLogRepository: deps.auditLogRepository,
                eventBus: deps.eventBus,
                actorId: userId,
            });

            const input = { ...(request.body as object), orgId } as unknown;
            const branch = await useCase.execute(input);

            return reply.status(201).send(branch);
        } catch (error) {
            app.log.error(error, "Erro ao criar filial");

            if (error instanceof Error) {
                if (error.message.includes("já existe")) {
                    return reply.status(409).send({ message: error.message });
                }
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Erro ao criar filial" });
        }
    });
}
