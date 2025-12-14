import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";
import { CompararVersoesPreFichaTecnicaUseCase } from "../application/use-cases/comparar-versoes-pre-ficha-tecnica.use-case";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
};

export async function registerCompararVersoesPreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/comparar-versoes",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Querystring: { versao1?: string; versao2?: string };
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

      const query = z
        .object({
          versao1: z.string().optional(),
          versao2: z.string().optional(),
        })
        .parse(request.query);

      try {
        const useCase = new CompararVersoesPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          orgId,
        });

        const versao1 = query.versao1 ? parseInt(query.versao1, 10) : 0; // 0 = versão atual
        const versao2 = query.versao2 ? parseInt(query.versao2, 10) : 0;

        const resultado = await useCase.execute(id, versao1, versao2);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao comparar versões");

        if (error instanceof Error) {
          if (error.message.includes("não foram encontradas")) {
            return reply.status(404).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao comparar versões" });
      }
    },
  );
}

