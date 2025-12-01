import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarBranchesUseCase } from "../application/use-cases/listar-branches.use-case";
import type { BranchRepository } from "../domain/repositories/branch-repository";

type Dependencies = {
    branchRepository: BranchRepository;
};

export async function registerListBranchesRoute(app: FastifyInstance, deps: Dependencies) {
    app.get("/branches", async (request: FastifyRequest, reply: FastifyReply) => {
        const orgId = request.headers["x-org-id"] as string;

        if (!orgId) {
            return reply.status(400).send({ message: "x-org-id é obrigatório" });
        }

        try {
            const useCase = new ListarBranchesUseCase({
                branchRepository: deps.branchRepository,
            });

            const query = request.query as Record<string, unknown>;
            const input = { ...query, orgId } as unknown;

            // Convert active string to boolean if present
            if (typeof (input as any).active === 'string') {
                (input as any).active = (input as any).active === 'true';
            }

            const resultado = await useCase.execute(input);

            return reply.status(200).send(resultado);
        } catch (error) {
            app.log.error(error, "Erro ao listar filiais");

            if (error instanceof Error) {
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Erro ao listar filiais" });
        }
    });
}
