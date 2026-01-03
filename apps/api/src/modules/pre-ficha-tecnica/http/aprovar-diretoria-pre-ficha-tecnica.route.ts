import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AprovarDiretoriaPreFichaTecnicaUseCase } from "../application/use-cases/aprovar-diretoria-pre-ficha-tecnica.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";
import type { DomainEventBus } from "@morina/shared-kernel";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerAprovarDiretoriaPreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/aprovar-diretoria",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Body: { aprovadorNome: string };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;
      const id = request.params.id;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      const body = (request.body ?? {}) as { aprovadorNome?: string };

      if (!orgId || !id) {
        return reply.status(400).send({ message: "orgId e id são obrigatórios" });
      }

      if (!userId) {
        return reply.status(401).send({ message: "Usuário não identificado" });
      }

      try {
        const useCase = new AprovarDiretoriaPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          eventBus: deps.eventBus,
          actorId: userId,
          orgId,
        });

        const resultado = await useCase.execute({
          preFichaTecnicaId: id,
          aprovadorId: userId,
          aprovadorNome: body.aprovadorNome || "Diretoria",
        });

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao aprovar pela diretoria pré-ficha técnica");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao aprovar pela diretoria pré-ficha técnica" });
      }
    },
  );
}












