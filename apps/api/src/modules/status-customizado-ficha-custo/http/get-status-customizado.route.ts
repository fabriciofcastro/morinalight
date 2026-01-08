import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { BuscarStatusCustomizadoUseCase } from "../application/use-cases/buscar-status-customizado.use-case";
import type { StatusCustomizadoRepository } from "../domain/repositories/status-customizado.repository";

export async function registerGetStatusCustomizadoRoute(
  app: FastifyInstance,
  deps: { statusCustomizadoRepository: StatusCustomizadoRepository },
) {
  app.get(
    "/organizations/:orgId/status-customizados-ficha-custo/:id",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
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
        const id = request.params.id;

        const useCase = new BuscarStatusCustomizadoUseCase(deps.statusCustomizadoRepository, orgId);
        const resultado = await useCase.execute(id);

        return reply.status(200).send({
          status: {
            ...resultado.status.toJSON(),
            createdAt: resultado.status.toJSON().createdAt.toISOString(),
            updatedAt: resultado.status.toJSON().updatedAt.toISOString(),
            deletedAt: resultado.status.toJSON().deletedAt?.toISOString() ?? null,
          },
        });
      } catch (error) {
        app.log.error(error, "Erro ao buscar status customizado");

        if (error instanceof Error && error.message.includes("não encontrado")) {
          return reply.status(404).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao buscar status customizado" });
      }
    },
  );
}
