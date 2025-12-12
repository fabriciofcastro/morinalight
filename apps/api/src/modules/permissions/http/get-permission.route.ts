import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { permissionViewSchema } from "../application/schemas/permission.schema";
import type { PermissionRepository } from "../domain/repositories/permission-repository";

export async function registerGetPermissionRoute(
  app: FastifyInstance,
  deps: { permissionRepository: PermissionRepository },
) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/permissions/:id",
    {
      schema: {
        summary: "Buscar permissão",
        tags: ["Permissions"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: permissionViewSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const permission = await deps.permissionRepository.encontrarPorId(id);

      if (!permission) {
        return reply.status(404).send({ message: "Permissão não encontrada" });
      }

      const [resource, action] = permission.permissionKey.includes(":")
        ? permission.permissionKey.split(":", 2)
        : [permission.permissionKey, permission.dados.level];

      return reply.status(200).send({
        permissionId: permission.permissionId,
        name: permission.dados.name,
        description: permission.dados.description ?? null,
        module: permission.dados.module,
        category: permission.dados.module,
        resource,
        action,
        createdAt: permission.dados.createdAt,
        updatedAt: permission.dados.updatedAt,
      });
    },
  );
}
