import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";
import type { DomainEventBus } from "@morina/shared-kernel";
import { AtualizarPreFichaTecnicaUseCase } from "../application/use-cases/atualizar-pre-ficha-tecnica.use-case";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerUpdatePreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.put(
    "/organizations/:orgId/pre-fichas-tecnicas/:id",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Body: unknown;
      }>,
      reply: FastifyReply,
    ) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { orgId, id } = z
        .object({
          orgId: z.string().uuid(),
          id: z.string().uuid(),
        })
        .parse(request.params);

      try {
        const useCase = new AtualizarPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          eventBus: deps.eventBus,
          orgId,
          userId: request.auth.userId,
        });

        const resultado = await useCase.execute({
          id,
          ...request.body,
        });

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar pré-ficha técnica");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("não pode ser editada")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar pré-ficha técnica" });
      }
    },
  );
}












