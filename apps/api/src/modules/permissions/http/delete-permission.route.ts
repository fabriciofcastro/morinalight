import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { DeletarPermissionUseCase } from "../application/use-cases/deletar-permission.use-case";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

export async function registerDeletePermissionRoute(
    app: FastifyInstance,
    deps: { permissionRepository: PermissionRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        "/permissions/:id",
        {
            schema: {
                summary: "Deletar permissão",
                tags: ["Permissions"],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                    },
                    required: ["id"],
                },
                response: {
                    204: {
                        type: "null",
                        description: "Permissão deletada com sucesso",
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const useCase = new DeletarPermissionUseCase({
                permissionRepository: deps.permissionRepository,
                actorId: request.headers["x-user-id"] as string || "system",
                eventBus: app.diContainer?.resolve("domainEventBus"),
            });

            await useCase.execute({ permissionId: id });

            return reply.status(204).send();
        },
    );
}
