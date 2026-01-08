import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { ListarFichasCustoUseCase } from "../application/use-cases/listar-fichas-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
};

export async function registerListFichasCustoRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/organizations/:orgId/fichas-custo",
    async (
      request: FastifyRequest<{ Params: { orgId: string }; Querystring: any }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      try {
        const useCase = new ListarFichasCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          orgId,
        });

        const query = request.query as Record<string, unknown>;
        const input = { ...query } as unknown;
        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao listar fichas de custo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar fichas de custo" });
      }
    },
  );
}
