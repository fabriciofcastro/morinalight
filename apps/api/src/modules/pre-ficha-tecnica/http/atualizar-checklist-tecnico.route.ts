import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { AtualizarChecklistTecnicoUseCase } from "../application/use-cases/atualizar-checklist-tecnico.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  eventBus?: DomainEventBus;
};

export async function registerAtualizarChecklistTecnicoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.put(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/checklist-tecnico",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Body: {
          checklist: {
            moldeVesteCorretamente?: boolean;
            costuraViavel?: boolean;
            insumosCompatíveis?: boolean;
            pecaPilotoAprovadaVisualmente?: boolean;
          };
        };
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
        const useCase = new AtualizarChecklistTecnicoUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          eventBus: deps.eventBus,
          orgId,
          userId: request.auth.userId,
        });

        const resultado = await useCase.execute({
          preFichaTecnicaId: id,
          checklist: request.body.checklist,
        });

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao atualizar checklist técnico");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("só pode ser atualizado")) {
            return reply.status(400).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar checklist técnico" });
      }
    },
  );
}
