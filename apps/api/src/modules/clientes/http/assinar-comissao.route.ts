import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AssinarComissaoUseCase } from "../application/use-cases/assinar-comissao.use-case";
import type { ComissaoRepository } from "../domain/repositories/comissao-repository";

type Dependencies = {
  comissaoRepository: ComissaoRepository;
};

export async function registerAssinarComissaoRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/comissoes/:comissaoId/assinar", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;
    const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
    const { comissaoId } = request.params as { comissaoId: string };

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    if (!userId) {
      return reply.status(400).send({ message: "Usuário não identificado" });
    }

    try {
      const useCase = new AssinarComissaoUseCase({
        comissaoRepository: deps.comissaoRepository,
      });

      const input = { orgId, comissaoId, assinadoPor: userId };
      const comissao = await useCase.execute(input);

      return reply.send(comissao);
    } catch (error) {
      app.log.error(error, "Erro ao assinar comissão");

      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao assinar comissão" });
    }
  });
}

