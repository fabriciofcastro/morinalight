import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { subdepartmentViewSchema } from "../application/schemas/subdepartment.schema";
import type { SubdepartmentRepository } from "../domain/repositories/subdepartment-repository";

type Dependencies = {
  subdepartmentRepository: SubdepartmentRepository;
};

export async function registerGetSubdepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/subdepartments/:subdepartmentId",
    async (
      request: FastifyRequest<{ Params: { subdepartmentId: string } }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.headers["x-org-id"] as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      try {
        const subdepartment = await deps.subdepartmentRepository.encontrarPorId(
          orgId,
          request.params.subdepartmentId,
        );

        if (!subdepartment) {
          return reply.status(404).send({ message: "Subdepartamento não encontrado" });
        }

        const view = subdepartmentViewSchema.parse({
          subdepartmentId: subdepartment.subdepartmentId,
          orgId: subdepartment.dados.orgId,
          branchId: subdepartment.dados.branchId ?? null,
          departmentId: subdepartment.dados.departmentId,
          name: subdepartment.dados.name,
          code: subdepartment.dados.code,
          description: subdepartment.dados.description ?? null,
          parentId: subdepartment.dados.parentId ?? null,
          status: subdepartment.dados.status,
          ordem: subdepartment.dados.ordem,
          metadata: subdepartment.dados.metadata ?? null,
          createdBy: subdepartment.dados.createdBy,
          updatedBy: subdepartment.dados.updatedBy,
          createdAt: subdepartment.dados.createdAt,
          updatedAt: subdepartment.dados.updatedAt,
        });

        return reply.status(200).send(view);
      } catch (error) {
        app.log.error(error, "Erro ao buscar subdepartamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar subdepartamento" });
      }
    },
  );
}
