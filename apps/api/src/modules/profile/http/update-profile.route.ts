import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

type UpdateProfileDeps = {
  userRepository: UserRepository;
};

export async function registerUpdateProfileRoute(app: FastifyInstance, deps: UpdateProfileDeps) {
  app.put("/profile", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;
    const body = updateProfileSchema.parse(request.body ?? {});

    const existingUser = await deps.userRepository.findById(userId);
    if (!existingUser) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // Verificar se email está sendo alterado e se já existe
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await deps.userRepository.findByEmail(body.email);
      if (emailExists) {
        return reply.status(409).send({
          message: "E-mail já está em uso",
          code: "EMAIL_ALREADY_EXISTS",
        });
      }
    }

    if (!deps.userRepository.update) {
      return reply.status(500).send({
        message: "Repositório de usuários não suporta atualização",
      });
    }

    const updateData: {
      userId: string;
      email?: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    } = {
      userId,
    };

    if (body.email !== undefined) updateData.email = body.email;
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;

    const updated = await deps.userRepository.update(updateData);

    if (!updated) {
      return reply.status(500).send({
        message: "Falha ao atualizar perfil",
      });
    }

    return reply.send({
      user: {
        userId: updated.userId,
        email: updated.email,
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        status: updated.status,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  });
}
