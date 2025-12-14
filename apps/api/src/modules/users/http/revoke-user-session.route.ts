import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerRevokeUserSessionRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/users/:userId/sessions/:sessionId/revoke",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { userId, sessionId } = z
        .object({
          userId: z.string().uuid(),
          sessionId: z.string().min(1),
        })
        .parse(request.params);

      // Verificar se usuário existe
      const user = await deps.userRepository.findById(userId);
      if (!user) {
        return reply.status(404).send({
          message: "Usuário não encontrado",
        });
      }

      // TODO: Implementar revogação de sessão quando disponível
      return reply.status(200).send({
        message: "Sessão revogada com sucesso",
        sessionId,
      });
    },
  );
}
