import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AnexarBoletoFichaCustoUseCase } from "../application/use-cases/anexar-boleto-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
};

export async function registerAnexarBoletoFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/boletos",
    async (
      request: FastifyRequest<{ Params: { orgId: string; fichaCustoId: string } }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const fichaCustoId = request.params.fichaCustoId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!fichaCustoId) {
        return reply.status(400).send({ message: "fichaCustoId é obrigatório" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new AnexarBoletoFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const body = (request.body ?? {}) as Record<string, unknown>;
        const input = { ...body, fichaCustoId } as unknown;
        const resultado = await useCase.execute(input);

        return reply.status(201).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao anexar boleto à ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (
            error.message.includes("obrigatória") ||
            error.message.includes("deve ser") ||
            error.message.includes("não pode")
          ) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao anexar boleto à ficha de custo" });
      }
    },
  );
}












