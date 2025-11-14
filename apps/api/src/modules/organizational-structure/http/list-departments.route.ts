import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarDepartmentsUseCase } from "../application/use-cases/listar-departments.use-case";
import type { DepartmentRepository } from "../domain/repositories/department-repository";

type Dependencies = {
  departmentRepository: DepartmentRepository;
};

export async function registerListDepartmentsRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/departments", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarDepartmentsUseCase({
        departmentRepository: deps.departmentRepository,
      });

      const query = request.query as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar departamentos");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar departamentos" });
    }
  });
}
