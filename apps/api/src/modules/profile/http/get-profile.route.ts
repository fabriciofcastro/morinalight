import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

type GetProfileDeps = {
  userRepository: UserRepository;
};

export async function registerGetProfileRoute(app: FastifyInstance, deps: GetProfileDeps) {
  app.get("/profile", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    return reply.send({
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });
}












