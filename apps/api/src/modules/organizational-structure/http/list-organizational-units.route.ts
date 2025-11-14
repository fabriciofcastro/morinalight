import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ListarOrganizationalUnitsUseCase } from "../application/use-cases/listar-organizational-units.use-case";
import type { OrganizationalUnitRepository } from "../domain/repositories/organizational-unit-repository";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
};

export async function registerListOrganizationalUnitsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/organizational-units", async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({ message: "x-org-id é obrigatório" });
    }

    try {
      const useCase = new ListarOrganizationalUnitsUseCase({
        organizationalUnitRepository: deps.organizationalUnitRepository,
      });

      const query = request.query as Record<string, unknown>;
      const input = { ...query, orgId } as unknown;
      const resultado = await useCase.execute(input);

      return reply.status(200).send(resultado);
    } catch (error) {
      app.log.error(error, "Erro ao listar unidades organizacionais");

      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }

      return reply.status(500).send({ message: "Erro ao listar unidades organizacionais" });
    }
  });
}

