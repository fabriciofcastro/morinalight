import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { updateStatusCustomizadoSchema } from "../application/schemas/status-customizado.schema";
import { AtualizarStatusCustomizadoUseCase } from "../application/use-cases/atualizar-status-customizado.use-case";
import type { StatusCustomizadoRepository } from "../domain/repositories/status-customizado.repository";

export async function registerUpdateStatusCustomizadoRoute(
  app: FastifyInstance,
  deps: { statusCustomizadoRepository: StatusCustomizadoRepository },
) {
  app.put(
    "/organizations/:orgId/status-customizados-ficha-custo/:id",
    async (
      request: FastifyRequest<{
        Params: { orgId: string; id: string };
        Body: unknown;
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

        const input = updateStatusCustomizadoSchema.parse(request.body);

        const useCase = new AtualizarStatusCustomizadoUseCase(deps.statusCustomizadoRepository, orgId, actorId);
        const resultado = await useCase.execute(id, input);

        return reply.status(200).send({
          status: {
            ...resultado.status.toJSON(),
            createdAt: resultado.status.toJSON().createdAt.toISOString(),
            updatedAt: resultado.status.toJSON().updatedAt.toISOString(),
            deletedAt: resultado.status.toJSON().deletedAt?.toISOString() ?? null,
          },
        });
      } catch (error) {
        app.log.error(error, "Erro ao atualizar status customizado");

        if (error instanceof Error) {
          if (error.message.includes("não encontrado")) {
            return reply.status(404).send({ message: error.message });
          }
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atualizar status customizado" });
      }
    },
  );
}


