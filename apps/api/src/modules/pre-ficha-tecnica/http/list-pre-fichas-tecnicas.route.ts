import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarPreFichasTecnicasUseCase } from "../application/use-cases/listar-pre-fichas-tecnicas.use-case";
import type { PreFichaTecnicaRepository } from "../domain/repositories/pre-ficha-tecnica.repository";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
};

export async function registerListPreFichasTecnicasRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/organizations/:orgId/pre-fichas-tecnicas",
    async (
      request: FastifyRequest<{
        Params: { orgId: string };
        Querystring: {
          pagina?: string;
          tamanhoPagina?: string;
          status?: string;
          categoria?: string;
          codigoPeca?: string;
          busca?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const orgId = request.params.orgId;

      if (!orgId) {
        return reply.status(400).send({ message: "orgId é obrigatório" });
      }

      try {
        const useCase = new ListarPreFichasTecnicasUseCase({
          preFichaTecnicaRepository: deps.preFichaTecnicaRepository,
          orgId,
        });

        const query = request.query;
        const input = {
          pagina: query.pagina ? parseInt(query.pagina, 10) : 1,
          tamanhoPagina: query.tamanhoPagina ? parseInt(query.tamanhoPagina, 10) : 20,
          status: query.status ? query.status.split(",") : undefined,
          categoria: query.categoria,
          codigoPeca: query.codigoPeca,
          busca: query.busca,
        };

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao listar pré-fichas técnicas");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar pré-fichas técnicas" });
      }
    },
  );
}
