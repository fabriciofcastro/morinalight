import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { createStatusCustomizadoSchema } from "../application/schemas/status-customizado.schema";
import { CriarStatusCustomizadoUseCase } from "../application/use-cases/criar-status-customizado.use-case";
import type { StatusCustomizadoRepository } from "../domain/repositories/status-customizado.repository";

export async function registerCreateStatusCustomizadoRoute(
  app: FastifyInstance,
  deps: { statusCustomizadoRepository: StatusCustomizadoRepository },
) {
  app.post(
    "/organizations/:orgId/status-customizados-ficha-custo",
    async (
      request: FastifyRequest<{
        Params: { orgId: string };
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
        const actorId = request.auth.userId;

        const input = createStatusCustomizadoSchema.parse(request.body);

        const useCase = new CriarStatusCustomizadoUseCase(deps.statusCustomizadoRepository, orgId, actorId);
        const resultado = await useCase.execute(input);

        return reply.status(201).send({
          status: {
            ...resultado.status.toJSON(),
            createdAt: resultado.status.toJSON().createdAt.toISOString(),
            updatedAt: resultado.status.toJSON().updatedAt.toISOString(),
          },
        });
      } catch (error) {
        app.log.error(error, "Erro ao criar status customizado");

        if (error instanceof Error) {
          if (error.message.includes("já existe")) {
            return reply.status(409).send({ message: error.message });
          }
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao criar status customizado" });
      }
    },
  );
}


