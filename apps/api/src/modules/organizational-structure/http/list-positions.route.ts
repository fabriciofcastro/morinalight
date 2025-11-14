import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ListarPositionsUseCase } from "../application/use-cases/listar-positions.use-case";
import type { PositionRepository } from "../domain/repositories/position-repository";

type Dependencies = {
  positionRepository: PositionRepository;
};

export async function registerListPositionsRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/positions", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarPositionsUseCase(deps);

      const query = request.query as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar cargos");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar cargos" });
    }
  });
}

