import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarComissoesUseCase } from "../application/use-cases/listar-comissoes.use-case";
import type { ComissaoRepository } from "../domain/repositories/comissao-repository";

type Dependencies = {
  comissaoRepository: ComissaoRepository;
};

export async function registerListComissoesRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/comissoes", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarComissoesUseCase({
        comissaoRepository: deps.comissaoRepository,
      });

      const query = (request.query ?? {}) as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar comissões");
      return reply.status(500).send({ message: "Erro ao listar comissões" });
    }
  });
}
