import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BuscarPreFichaTecnicaUseCase } from "../application/use-cases/buscar-pre-ficha-tecnica.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
};

export async function registerGetPreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/organizations/:orgId/pre-fichas-tecnicas/:id",
    async (
      request: FastifyRequest<{ Params: { orgId: string; id: string } }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const id = request.params.id;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!id) {
        return reply.status(400).send({ message: "ID é obrigatório" });
      }

      try {
        const useCase = new BuscarPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          orgId,
        });

        const preFicha = await useCase.execute({ id });

        return reply.status(200).send(preFicha);
      } catch (error) {
        app.log.error(error, "Erro ao buscar pré-ficha técnica");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar pré-ficha técnica" });
      }
    },
  );
}












