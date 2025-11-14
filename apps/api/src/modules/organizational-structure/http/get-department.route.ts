import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { DepartmentRepository } from "../domain/repositories/department-repository";
import { departmentViewSchema } from "../application/schemas/department.schema";

type Dependencies = {
  departmentRepository: DepartmentRepository;
};

export async function registerGetDepartmentRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/departments/:departmentId",
    async (request: FastifyRequest<{ Params: { departmentId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      try {
        const department = await deps.departmentRepository.encontrarPorId(
          orgId,
          request.params.departmentId,
        );

        if (!department) {
          return reply.status(404).send({ message: "Departamento não encontrado" });
        }

        const view = departmentViewSchema.parse({
          departmentId: department.dados.id,
          orgId: department.dados.orgId,
          unitId: department.dados.unitId,
          name: department.dados.name,
          code: department.dados.code,
          description: department.dados.description,
          parentId: department.dados.parentId,
          status: department.dados.status,
          ordem: department.dados.ordem,
          metadata: department.dados.metadata,
          createdBy: department.dados.createdBy,
          updatedBy: department.dados.updatedBy,
          createdAt: department.dados.createdAt,
          updatedAt: department.dados.updatedAt,
        });

        return reply.status(200).send(view);
      } catch (error) {
        app.log.error(error, "Erro ao buscar departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar departamento" });
      }
    },
  );
}

