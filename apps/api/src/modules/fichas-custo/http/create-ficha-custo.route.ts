import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarFichaCustoUseCase } from "../application/use-cases/criar-ficha-custo.use-case";
import type { FichaCustoRepository } from "../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreateFichaCustoRoute(app: FastifyInstance, deps: Dependencies) {
  app.post(
    "/organizations/:orgId/fichas-custo",
    async (request: FastifyRequest<{ Params: { orgId: string } }>, reply: FastifyReply) => {
      const orgId = request.params.orgId;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new CriarFichaCustoUseCase({
          fichaCustoRepository: deps.fichaCustoRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const body = (request.body ?? {}) as Record<string, unknown>;
        const input = { ...body } as unknown;
        const ficha = await useCase.execute(input);

        return reply.status(201).send(ficha);
      } catch (error) {
        app.log.error(error, "Erro ao criar ficha de custo");

        if (error instanceof Error) {
          if (error.message.includes("obrigatória") || error.message.includes("deve ser")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao criar ficha de custo" });
      }
    },
  );
}
