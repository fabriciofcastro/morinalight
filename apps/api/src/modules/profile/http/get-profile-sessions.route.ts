import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

type GetProfileSessionsDeps = {
  userRepository: UserRepository;
};

export async function registerGetProfileSessionsRoute(
  app: FastifyInstance,
  deps: GetProfileSessionsDeps,
) {
  app.get("/profile/sessions", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // TODO: Implementar gerenciamento de sessões quando disponível
    // Por enquanto, retornar estrutura básica
    return reply.send({
      sessions: [],
      message: "Sessões do perfil - em desenvolvimento",
    });
  });
}
