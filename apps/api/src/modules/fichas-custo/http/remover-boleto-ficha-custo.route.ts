import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { RemoverBoletoFichaCustoUseCase } from "../application/use-cases/remover-boleto-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
};

export async function registerRemoverBoletoFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.delete(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/boletos/:boletoId",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; fichaCustoId: string; boletoId: string };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const fichaCustoId = request.params.fichaCustoId;
      const boletoId = request.params.boletoId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!fichaCustoId) {
        return reply.status(400).send({ message: "fichaCustoId é obrigatório" });
      }

      if (!boletoId) {
        return reply.status(400).send({ message: "boletoId é obrigatório" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new RemoverBoletoFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          actorId: userId,
          orgId,
        });

        const resultado = await useCase.execute(fichaCustoId, boletoId);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao remover boleto da ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("não pode") || error.message.includes("apenas")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover boleto da ficha de custo" });
      }
    },
  );
}












