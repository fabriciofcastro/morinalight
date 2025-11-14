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

    const user = await deps.userRepository.create({
      userId,
      email: body.email,
      passwordHash,
      displayName: body.displayName ?? null,
      status: body.status,
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
