import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

type ChangeProfilePasswordDeps = {
  userRepository: UserRepository;
};

export async function registerChangeProfilePasswordRoute(
  app: FastifyInstance,
  deps: ChangeProfilePasswordDeps,
) {
  app.post("/profile/change-password", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;
    const body = changePasswordSchema.parse(request.body ?? {});

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return reply.status(400).send({
        message: "Senha atual incorreta",
        code: "INVALID_CURRENT_PASSWORD",
      });
    }

    // Validar que nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(body.newPassword, user.passwordHash);
    if (isSamePassword) {
      return reply.status(400).send({
        message: "Nova senha deve ser diferente da senha atual",
        code: "SAME_PASSWORD",
      });
    }

    if (!deps.userRepository.update) {
      return reply.status(500).send({
        message: "Repositório de usuários não suporta atualização",
      });
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    const updated = await deps.userRepository.update({
      userId,
      passwordHash,
    });

    if (!updated) {
      return reply.status(500).send({
        message: "Falha ao alterar senha",
      });
    }

    return reply.send({
      message: "Senha alterada com sucesso",
    });
  });
}
