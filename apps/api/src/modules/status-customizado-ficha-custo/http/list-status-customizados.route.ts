import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { listarStatusCustomizadosQuerySchema } from "../application/schemas/status-customizado.schema";
import { ListarStatusCustomizadosUseCase } from "../application/use-cases/listar-status-customizados.use-case";
import type { StatusCustomizadoRepository } from "../domain/repositories/status-customizado.repository";

export async function registerListStatusCustomizadosRoute(
  app: FastifyInstance,
  deps: { statusCustomizadoRepository: StatusCustomizadoRepository },
) {
  app.get(
    "/organizations/:orgId/status-customizados-ficha-custo",
    async (
      request: FastifyRequest<{
        Params: { orgId: string };
        Querystring: unknown;
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

      try {
        const orgId = request.params.orgId;
        const query = listarStatusCustomizadosQuerySchema.parse(request.query);

        const useCase = new ListarStatusCustomizadosUseCase(deps.statusCustomizadoRepository, orgId);
        const resultado = await useCase.execute(query);

        return reply.status(200).send({
          status: resultado.status.map((s) => ({
            ...s,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
            deletedAt: s.deletedAt?.toISOString() ?? null,
          })),
          paginacao: {
            total: resultado.total,
            pagina: resultado.pagina,
            tamanhoPagina: resultado.tamanhoPagina,
            totalPaginas: resultado.totalPaginas,
          },
        });
      } catch (error) {
        app.log.error(error, "Erro ao listar status customizados");
        return reply.status(500).send({ message: "Erro ao listar status customizados" });
      }
    },
  );
}


