import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerEnable2FARoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/users/:userId/enable-2fa", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // TODO: Implementar ativação de 2FA
    // Por enquanto, retornar estrutura básica
    return reply.send({
      message: "2FA será ativado em breve",
      userId,
      qrCodeUrl: null, // URL para QR code
      secret: null, // Secret para configuração manual
    });
  });
}

