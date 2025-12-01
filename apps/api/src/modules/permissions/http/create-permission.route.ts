import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { criarPermissionInputSchema, permissionViewSchema } from "../application/schemas/permission.schema";
import { CriarPermissionUseCase } from "../application/use-cases/criar-permission.use-case";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

export async function registerCreatePermissionRoute(
    app: FastifyInstance,
    deps: { permissionRepository: PermissionRepository },
) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/permissions",
        {
            schema: {
                summary: "Criar nova permissão",
                tags: ["Permissions"],
                body: criarPermissionInputSchema,
                response: {
                    201: permissionViewSchema,
                },
            },
        },
        async (request, reply) => {
            const useCase = new CriarPermissionUseCase({
                permissionRepository: deps.permissionRepository,
                actorId: request.headers["x-user-id"] as string || "system",
                eventBus: app.diContainer?.resolve("domainEventBus"),
            });

            const result = await useCase.execute(request.body);

            return reply.status(201).send(result);
        },
    );
}
