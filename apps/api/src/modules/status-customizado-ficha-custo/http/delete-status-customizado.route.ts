import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { DeletarStatusCustomizadoUseCase } from "../application/use-cases/deletar-status-customizado.use-case";
import type { StatusCustomizadoRepository } from "../domain/repositories/status-customizado.repository";

export async function registerDeleteStatusCustomizadoRoute(
  app: FastifyInstance,
  deps: { statusCustomizadoRepository: StatusCustomizadoRepository },
) {
  app.delete(
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
        const actorId = request.auth.userId;

        const useCase = new DeletarStatusCustomizadoUseCase(deps.statusCustomizadoRepository, orgId, actorId);
        await useCase.execute(id);

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao deletar status customizado");

        if (error instanceof Error && error.message.includes("não encontrado")) {
          return reply.status(404).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao deletar status customizado" });
      }
    },
  );
}


