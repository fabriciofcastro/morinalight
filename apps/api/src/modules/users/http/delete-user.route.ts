import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type DeleteUserDeps = {
  userRepository: UserRepository;
};

export async function registerDeleteUserRoute(app: FastifyInstance, deps: DeleteUserDeps) {
  app.delete("/users/:userId", async (request, reply) => {
    // Validar autenticação
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().min(1) }).parse(request.params);

    // Não permitir deletar a si mesmo
    if (userId === request.auth.userId) {
      return reply.status(400).send({
        message: "Não é possível deletar seu próprio usuário",
        code: "CANNOT_DELETE_SELF",
      });
    }

    const existingUser = await deps.userRepository.findById(userId);
    if (!existingUser) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    if (!deps.userRepository.delete) {
      return reply.status(500).send({
        message: "Repositório de usuários não suporta exclusão",
      });
    }

    await deps.userRepository.delete(userId);

    return reply.status(204).send();
  });
}


