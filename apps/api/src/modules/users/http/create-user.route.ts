import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const createUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  displayName: z.string().min(1, "Nome é obrigatório").optional().nullable(),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  admissionDate: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  observations: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  departmentId: z.string().optional(),
  sectorId: z.string().optional(),
  positionId: z.string().optional(),
});

type CreateUserDeps = {
  userRepository: UserRepository;
};

export async function registerCreateUserRoute(app: FastifyInstance, deps: CreateUserDeps) {
  app.post("/users", async (request, reply) => {
    // Validar autenticação
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const body = createUserSchema.parse(request.body ?? {});

    // Verificar se email já existe
    const existingUser = await deps.userRepository.findByEmail(body.email);
    if (existingUser) {
      return reply.status(409).send({
        message: "E-mail já está em uso",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const userId = randomUUID();

    // Parse dates from strings
    const birthDate = body.birthDate ? new Date(body.birthDate) : null;
    const admissionDate = body.admissionDate ? new Date(body.admissionDate) : null;

    const user = await deps.userRepository.create({
      userId,
      email: body.email,
      passwordHash,
      displayName: body.displayName ?? null,
      status: body.status,
      cpf: body.cpf ?? null,
      phone: body.phone ?? null,
      birthDate: birthDate,
      admissionDate: admissionDate,
      observations: body.observations ?? null,
      avatarUrl: body.avatarUrl ?? null,
    });

    return reply.status(201).send({
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
      },
    });
  });
}
