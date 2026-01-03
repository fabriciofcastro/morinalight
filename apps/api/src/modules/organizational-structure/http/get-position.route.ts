import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { positionViewSchema } from "../application/schemas/position.schema";
import type { PositionRepository } from "../domain/repositories/position-repository";

type Dependencies = {
  positionRepository: PositionRepository;
};

export async function registerGetPositionRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/positions/:positionId",
    async (request: FastifyRequest<{ Params: { positionId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      try {
        const position = await deps.positionRepository.encontrarPorId(
          orgId,
          request.params.positionId,
        );

        if (!position) {
          return reply.status(404).send({ message: "Cargo não encontrado" });
        }

        const view = positionViewSchema.parse({
          id: position.positionId,
          orgId: position.dados.orgId,
          sectorId: position.dados.sectorId,
          name: position.dados.name,
          code: position.dados.code,
          description: position.dados.description,
          responsabilidades: position.dados.responsabilidades,
          requisitos: position.dados.requisitos,
          salarioMin: position.dados.salarioMin,
          salarioMax: position.dados.salarioMax,
          status: position.dados.status,
          ordem: position.dados.ordem,
          metadata: position.dados.metadata,
          createdBy: position.dados.createdBy,
          updatedBy: position.dados.updatedBy,
          createdAt: position.dados.createdAt,
          updatedAt: position.dados.updatedAt,
        });

        return reply.status(200).send(view);
      } catch (error) {
        app.log.error(error, "Erro ao buscar cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar cargo" });
      }
    },
  );
}
