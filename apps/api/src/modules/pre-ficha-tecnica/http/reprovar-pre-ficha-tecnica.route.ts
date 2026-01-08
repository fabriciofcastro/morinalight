import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ReprovarPreFichaTecnicaUseCase } from "../application/use-cases/reprovar-pre-ficha-tecnica.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerReprovarPreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/reprovar",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Body: { justificativa: string; reprovadorNome?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const id = request.params.id;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      const body = (request.body ?? {}) as { justificativa: string; reprovadorNome?: string };

      if (!orgId || !id) {
        return reply.status(400).send({ message: "orgId e id são obrigatórios" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      if (!body.justificativa) {
        return reply.status(400).send({ message: "Justificativa é obrigatória" });
      }

      try {
        const useCase = new ReprovarPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const resultado = await useCase.execute({
          preFichaTecnicaId: id,
          reprovadorId: userId,
          reprovadorNome: body.reprovadorNome || "Reprovador",
          justificativa: body.justificativa,
        });

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao reprovar pré-ficha técnica");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao reprovar pré-ficha técnica" });
      }
    },
  );
}
