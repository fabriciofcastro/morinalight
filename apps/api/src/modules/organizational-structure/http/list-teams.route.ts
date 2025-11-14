import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarTeamsUseCase } from "../application/use-cases/listar-teams.use-case";
import type { TeamRepository } from "../domain/repositories/team-repository";

type Dependencies = {
  teamRepository: TeamRepository;
};

export async function registerListTeamsRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/teams", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarTeamsUseCase({
        teamRepository: deps.teamRepository,
      });

      const query = request.query as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar times");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar times" });
    }
  });
}
