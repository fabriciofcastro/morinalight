import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ListarSectorsUseCase } from "../application/use-cases/listar-sectors.use-case";
import type { SectorRepository } from "../domain/repositories/sector-repository";

type Dependencies = {
  sectorRepository: SectorRepository;
};

export async function registerListSectorsRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/sectors", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarSectorsUseCase(deps);

      const query = request.query as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar setores");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar setores" });
    }
  });
}
