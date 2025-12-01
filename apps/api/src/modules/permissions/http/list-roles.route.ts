import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarRolesUseCase } from "../application/use-cases/listar-roles.use-case";
import type { RoleRepository } from "../domain/repositories/role-repository";

type Dependencies = {
    roleRepository: RoleRepository;
};

export async function registerListRolesRoute(app: FastifyInstance, deps: Dependencies) {
    app.get("/roles", async (request: FastifyRequest, reply: FastifyReply) => {
        const orgId = request.headers["x-org-id"] as string;

        if (!orgId) {
            return reply.status(400).send({ message: "x-org-id é obrigatório" });
        }

        try {
            const useCase = new ListarRolesUseCase({
                roleRepository: deps.roleRepository,
            });

            const query = request.query as Record<string, unknown>;
            const input = { ...query, orgId } as unknown;

            const resultado = await useCase.execute(input);

            return reply.status(200).send(resultado);
        } catch (error) {
            app.log.error(error, "Erro ao listar perfis");

            if (error instanceof Error) {
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Erro ao listar perfis" });
        }
    });
}
