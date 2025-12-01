import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { listarPermissionsInputSchema, listarPermissionsResultadoSchema } from "../application/schemas/permission.schema";
import { ListarPermissionsUseCase } from "../application/use-cases/listar-permissions.use-case";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

export async function registerListPermissionsRoute(
    app: FastifyInstance,
    deps: { permissionRepository: PermissionRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/permissions",
        {
            schema: {
                summary: "Listar permissões",
                tags: ["Permissions"],
                querystring: listarPermissionsInputSchema,
                response: {
                    200: listarPermissionsResultadoSchema,
                },
            },
        },
        async (request, reply) => {
            const useCase = new ListarPermissionsUseCase({
                permissionRepository: deps.permissionRepository,
            });

            const result = await useCase.execute(request.query);

            return reply.status(200).send(result);
        },
    );
}
