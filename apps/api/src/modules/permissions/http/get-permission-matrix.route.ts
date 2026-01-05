import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GetPermissionMatrixUseCase } from "../application/use-cases/get-permission-matrix.use-case";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

type Dependencies = {
    permissionRepository: PermissionRepository;
};

export async function registerGetPermissionMatrixRoute(
    app: FastifyInstance,
    deps: Dependencies,
) {
    app.get(
        "/permissions/matrix",
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const query = request.query as { page?: string; limit?: string };
                const page = query.page ? parseInt(query.page, 10) : undefined;
                const limit = query.limit ? parseInt(query.limit, 10) : undefined;

                const useCase = new GetPermissionMatrixUseCase({
                    permissionRepository: deps.permissionRepository,
                });

                const resultado = await useCase.execute({ page, limit });
                return reply.status(200).send(resultado);
            } catch (error) {
                app.log.error(error, "Erro ao buscar matriz de permissões");
                return reply.status(500).send({ message: "Erro ao buscar matriz de permissões" });
            }
        },
    );
}
