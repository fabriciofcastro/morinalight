import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerGetUserRoute(app: FastifyInstance, deps: Dependencies) {
  app.get("/users/:userId", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().min(1) }).parse(request.params);

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    return reply.send({
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });
}

