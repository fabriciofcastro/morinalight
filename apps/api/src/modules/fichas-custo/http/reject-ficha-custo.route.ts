import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { ReprovarFichaCustoUseCase } from "../application/use-cases/reprovar-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
};

export async function registerRejectFichaCustoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/fichas-custo/:fichaCustoId/reject",
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
        const useCase = new ReprovarFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const body = (request.body ?? {}) as { justificativa?: string };
        const input = {
          fichaCustoId,
          reprovadorId: userId,
          justificativa: body.justificativa || "",
        } as unknown;

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao reprovar ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("obrigatória")) {
            return reply.status(400).send({ message: error.message });
          }
          if (error.message.includes("não pode ser reprovada") || error.message.includes("Status atual")) {
            return reply.status(403).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao reprovar ficha de custo" });
      }
    },
  );
}
