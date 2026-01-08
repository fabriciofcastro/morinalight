import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { ExportarPdfPreFichaTecnicaUseCase } from "../application/use-cases/exportar-pdf-pre-ficha-tecnica.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
};

export async function registerExportarPdfPreFichaTecnicaRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/exportar-pdf",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
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
        const useCase = new ExportarPdfPreFichaTecnicaUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          orgId,
        });

        const resultado = await useCase.execute(id);

        // Retornar HTML que pode ser convertido para PDF no frontend
        return reply
          .status(200)
          .header("Content-Type", "text/html; charset=utf-8")
          .send(resultado.html);
      } catch (error) {
        app.log.error(error, "Erro ao exportar PDF da pré-ficha técnica");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao exportar PDF" });
      }
    },
  );
}
