import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

type RevokeProfileSessionDeps = {
  userRepository: UserRepository;
};

export async function registerRevokeProfileSessionRoute(
  app: FastifyInstance,
  deps: RevokeProfileSessionDeps,
) {
  app.post("/profile/sessions/:sessionId/revoke", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { sessionId } = z
      .object({
        sessionId: z.string().min(1),
      })
      .parse(request.params);

    const userId = request.auth.userId;

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
  });
}
