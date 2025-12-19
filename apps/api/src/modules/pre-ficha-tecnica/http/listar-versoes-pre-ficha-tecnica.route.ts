import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { ListarVersoesPreFichaTecnicaUseCase } from "../application/use-cases/listar-versoes-pre-ficha-tecnica.use-case";

export async function registerListarVersoesPreFichaTecnicaRoute(app: FastifyInstance) {
  app.get(
    "/organizations/:orgId/pre-fichas-tecnicas/:id/versoes",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Querystring: { pagina?: string; tamanhoPagina?: string };
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

      const orgId = request.params.orgId;
      const id = request.params.id;
      const query = request.query;

      if (!orgId || !id) {
        return reply.status(400).send({ message: "orgId e id são obrigatórios" });
      }

      try {
        const useCase = new ListarVersoesPreFichaTecnicaUseCase({ orgId });

        const input = {
          preFichaTecnicaId: id,
          pagina: query.pagina ? parseInt(query.pagina, 10) : 1,
          tamanhoPagina: query.tamanhoPagina ? parseInt(query.tamanhoPagina, 10) : 20,
        };

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao listar versões da pré-ficha técnica");

        if (error instanceof Error) {
          if (error.message.includes("não encontrada")) {
            return reply.status(404).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar versões" });
      }
    },
  );
}












