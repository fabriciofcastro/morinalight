import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().optional().nullable(),
  status: z.enum(["active", "pending", "suspended"]).optional(),
  password: z.string().min(6).optional(),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  admissionDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  observations: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

type UpdateUserDeps = {
  userRepository: UserRepository;
};

export async function registerUpdateUserRoute(app: FastifyInstance, deps: UpdateUserDeps) {
  app.put("/users/:userId", async (request, reply) => {
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
    const body = updateUserSchema.parse(request.body ?? {});

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

    // Parse dates from strings
    const birthDate = body.birthDate ? new Date(body.birthDate) : undefined;
    const admissionDate = body.admissionDate ? new Date(body.admissionDate) : undefined;

    const updateData: {
      userId: string;
      email?: string;
      displayName?: string | null;
      status?: string;
      passwordHash?: string;
      cpf?: string | null;
      phone?: string | null;
      birthDate?: Date | null;
      admissionDate?: Date | null;
      observations?: string | null;
      avatarUrl?: string | null;
    } = {
      userId,
    };

    if (body.email !== undefined) updateData.email = body.email;
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }
    if (body.cpf !== undefined) updateData.cpf = body.cpf;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (admissionDate !== undefined) updateData.admissionDate = admissionDate;
    if (body.observations !== undefined) updateData.observations = body.observations;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;

    const updated = await deps.userRepository.update(updateData);

    if (!updated) {
      return reply.status(500).send({
        message: "Falha ao atualizar usuário",
      });
    }

    return reply.send({
      user: {
        userId: updated.userId,
        email: updated.email,
        displayName: updated.displayName,
        status: updated.status,
        cpf: updated.cpf,
        phone: updated.phone,
        birthDate: updated.birthDate,
        admissionDate: updated.admissionDate,
        observations: updated.observations,
        avatarUrl: updated.avatarUrl,
      },
    });
  });
}
