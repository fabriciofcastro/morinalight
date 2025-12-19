import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PagarBoletoFichaCustoUseCase } from "../application/use-cases/pagar-boleto-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
};

export async function registerPagarBoletoFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/boletos/:boletoId/pagar",
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
        const useCase = new PagarBoletoFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const body = (request.body ?? {}) as Record<string, unknown>;
        const input = { ...body, fichaCustoId, boletoId } as unknown;
        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao pagar boleto da ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("não pode")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao pagar boleto da ficha de custo" });
      }
    },
  );
}












