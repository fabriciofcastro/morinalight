import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { sectorViewSchema } from "../application/schemas/sector.schema";
import type { SectorRepository } from "../domain/repositories/sector-repository";

type Dependencies = {
  sectorRepository: SectorRepository;
};

export async function registerGetSectorRoute(app: FastifyInstance, deps: Dependencies) {
  app.get(
    "/sectors/:sectorId",
    async (request: FastifyRequest<{ Params: { sectorId: string } }>, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      try {
        const sector = await deps.sectorRepository.encontrarPorId(orgId, request.params.sectorId);

        if (!sector) {
          return reply.status(404).send({ message: "Setor não encontrado" });
        }

        const view = sectorViewSchema.parse({
          id: sector.sectorId,
          orgId: sector.dados.orgId,
          departmentId: sector.dados.departmentId,
          name: sector.dados.name,
          code: sector.dados.code,
          description: sector.dados.description,
          parentId: sector.dados.parentId,
          status: sector.dados.status,
          ordem: sector.dados.ordem,
          metadata: sector.dados.metadata,
          createdBy: sector.dados.createdBy,
          updatedBy: sector.dados.updatedBy,
          createdAt: sector.dados.createdAt,
          updatedAt: sector.dados.updatedAt,
        });

        return reply.status(200).send(view);
      } catch (error) {
        app.log.error(error, "Erro ao buscar setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar setor" });
      }
    },
  );
}
