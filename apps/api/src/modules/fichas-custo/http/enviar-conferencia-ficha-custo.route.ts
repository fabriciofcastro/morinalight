import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { EnviarConferenciaFichaCustoUseCase } from "../application/use-cases/enviar-conferencia-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
};

export async function registerEnviarConferenciaFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/enviar-conferencia",
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

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new EnviarConferenciaFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const input = { fichaCustoId } as unknown;
        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao enviar ficha para conferência");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("não pode ser enviada") || error.message.includes("Status atual")) {
            return reply.status(403).send({ message: error.message });
          }
          if (error.message.includes("não pode ser enviada")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao enviar ficha para conferência" });
      }
    },
  );
}
