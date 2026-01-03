import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { BuscarFichaCustoUseCase } from "../application/use-cases/buscar-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
};

export async function registerGetFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/organizations/:orgId/fichas-custo/:fichaCustoId",
    async (
      request: FastifyRequest<{ Params: { orgId: string; fichaCustoId: string } }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const fichaCustoId = request.params.fichaCustoId;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!fichaCustoId) {
        return reply.status(400).send({ message: "fichaCustoId é obrigatório" });
      }

      try {
        const useCase = new BuscarFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          orgId,
        });

        const input = { fichaCustoId } as unknown;
        const ficha = await useCase.execute(input);

        return reply.status(200).send(ficha);
      } catch (error) {
        app.log.error(error, "Erro ao buscar ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar ficha de custo" });
      }
    },
  );
}
