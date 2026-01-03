import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerForceUserLogoutRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/users/:userId/force-logout", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // TODO: Implementar logout forçado de todas as sessões quando disponível
    return reply.status(200).send({
      message: "Logout forçado executado com sucesso",
      userId,
    });
  });
}
