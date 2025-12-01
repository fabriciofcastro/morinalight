import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AtualizarRoleUseCase } from "../application/use-cases/atualizar-role.use-case";
import type { RoleRepository } from "../domain/repositories/role-repository";

type Dependencies = {
    roleRepository: RoleRepository;
    eventBus?: DomainEventBus;
};

export async function registerUpdateRoleRoute(app: FastifyInstance, deps: Dependencies) {
    app.put("/roles/:roleId", async (request: FastifyRequest, reply: FastifyReply) => {
        const orgId = request.headers["x-org-id"] as string;
        const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
        const { roleId } = request.params as { roleId: string };

        if (!orgId) {
            return reply.status(400).send({ message: "x-org-id é obrigatório" });
        }

        if (!userId) {
            return reply.status(400).send({ message: "Usuário não identificado" });
        }

        try {
            const useCase = new AtualizarRoleUseCase({
                roleRepository: deps.roleRepository,
                eventBus: deps.eventBus,
                actorId: userId,
            });

            const input = { ...(request.body as object), orgId, roleId } as unknown;
            const role = await useCase.execute(input);

            return reply.status(200).send(role);
        } catch (error) {
            app.log.error(error, "Erro ao atualizar perfil");

            if (error instanceof Error) {
                if (error.message.includes("não encontrado")) {
                    return reply.status(404).send({ message: error.message });
                }
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Erro ao atualizar perfil" });
        }
    });
}
