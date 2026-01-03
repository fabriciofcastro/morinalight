import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarRepresentantesUseCase } from "../application/use-cases/listar-representantes.use-case";
import type { RepresentanteRepository } from "../domain/repositories/representante-repository";

type Dependencies = {
  representanteRepository: RepresentanteRepository;
};

export async function registerListRepresentantesRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/representantes", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarRepresentantesUseCase({
        representanteRepository: deps.representanteRepository,
      });

      const query = (request.query ?? {}) as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar representantes");
      return reply.status(500).send({ message: "Erro ao listar representantes" });
    }
  });
}
