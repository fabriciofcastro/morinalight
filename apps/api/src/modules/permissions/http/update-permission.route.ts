import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  atualizarPermissionInputSchema,
  permissionViewSchema,
} from "../application/schemas/permission.schema";
import { AtualizarPermissionUseCase } from "../application/use-cases/atualizar-permission.use-case";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

export async function registerUpdatePermissionRoute(
  app: FastifyInstance,
  deps: { permissionRepository: PermissionRepository; eventBus?: DomainEventBus },
) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/permissions/:id",
    {
      schema: {
        summary: "Atualizar permissão",
        tags: ["Permissions"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: atualizarPermissionInputSchema.omit({ id: true }),
        response: {
          200: permissionViewSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const useCase = new AtualizarPermissionUseCase({
        permissionRepository: deps.permissionRepository,
        actorId: (request.headers["x-user-id"] as string) || "system",
        eventBus: deps.eventBus,
      });

      const result = await useCase.execute({
        id,
        ...request.body,
      });

      return reply.status(200).send(result);
    },
  );
}
