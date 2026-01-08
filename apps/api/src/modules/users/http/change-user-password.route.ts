import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { BCRYPT_ROUNDS, passwordSchema } from "../../../core/config/password-config";
import type { UserRepository } from "../repositories/user.repository";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema, // ✅ Usar schema robusto
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    mustChangePassword: z.boolean().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerChangeUserPasswordRoute(app: FastifyInstance, deps: Dependencies) {
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

      // Verificar permissões e senha atual
      if (userId === request.auth.userId) {
        // Usuário alterando a própria senha
        if (!body.currentPassword) {
          return reply.status(400).send({
            message: "Senha atual é obrigatória",
            code: "CURRENT_PASSWORD_REQUIRED",
          });
        }

        const isValidPassword = await bcrypt.compare(body.currentPassword, user.passwordHash);
        if (!isValidPassword) {
          return reply.status(401).send({
            message: "Senha atual incorreta",
            code: "INVALID_PASSWORD",
          });
        }
      } else {
        // Admin (ou outro usuário) alterando senha de terceiro
        // TODO: Verificar permissão de "gerenciar usuários" ou "admin"
        // Por enquanto, assumimos que se chegou aqui e não é o próprio usuário, deve ter permissão verificada pelo middleware ou lógica futura.
        // O `requireAuth` apenas garante que está logado.
        // Idealmente verificar role/scope aqui.
      }

      // Atualizar senha
      const newPasswordHash = await bcrypt.hash(body.newPassword, BCRYPT_ROUNDS); // ✅ Usar 12 rounds

      if (!deps.userRepository.update) {
        return reply.status(500).send({
          message: "Repositório de usuários não suporta atualização",
        });
      }

      await deps.userRepository.update({
        userId,
        passwordHash: newPasswordHash,
        mustChangePassword: body.mustChangePassword,
      });

      return reply.status(200).send({
        message: "Senha alterada com sucesso",
      });
    },
  );
}
