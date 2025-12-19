import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CriarPreFichaTecnicaUseCase } from "../application/use-cases/criar-pre-ficha-tecnica.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerCreatePreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/pre-fichas-tecnicas",
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
        const useCase = new CriarPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const body = (request.body ?? {}) as Record<string, unknown>;
        const input = { ...body } as unknown;
        const preFicha = await useCase.execute(input);

        return reply.status(201).send(preFicha);
      } catch (error) {
        app.log.error(error, "Erro ao criar pré-ficha técnica");

        if (error instanceof Error) {
          if (error.message.includes("obrigatória") || error.message.includes("deve ser")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao criar pré-ficha técnica" });
      }
    },
  );
}












