import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerChangeUserPasswordRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post(
    "/users/:userId/change-password",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
      const body = changePasswordSchema.parse(request.body ?? {});

      // Verificar se usuário existe
      const user = await deps.userRepository.findById(userId);
      if (!user) {
        return reply.status(404).send({
          message: "Usuário não encontrado",
        });
      }

      // Verificar senha atual (se não for o próprio usuário alterando, pode precisar de permissão especial)
      if (userId === request.auth.userId) {
        const isValidPassword = await bcrypt.compare(body.currentPassword, user.passwordHash);
        if (!isValidPassword) {
          return reply.status(401).send({
            message: "Senha atual incorreta",
            code: "INVALID_PASSWORD",
          });
        }
      } else {
        // Admin alterando senha de outro usuário - pode não precisar de senha atual
        // Mas ainda deve verificar permissões (TODO: implementar verificação de permissões)
      }

      // Atualizar senha
      const newPasswordHash = await bcrypt.hash(body.newPassword, 10);

      if (!deps.userRepository.update) {
        return reply.status(500).send({
          message: "Repositório de usuários não suporta atualização",
        });
      }

      await deps.userRepository.update({
        userId,
        passwordHash: newPasswordHash,
      });

      return reply.status(200).send({
        message: "Senha alterada com sucesso",
      });
    },
  );
}
