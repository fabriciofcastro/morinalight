import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

type Dependencies = {
  userRepository: UserRepository;
};

const importUsersSchema = z.object({
  users: z.array(
    z.object({
      email: z.string().email(),
      displayName: z.string().optional().nullable(),
      password: z.string().min(6).optional(),
      status: z.enum(["active", "pending", "suspended"]).optional(),
    }),
  ),
});

export async function registerImportUsersRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/users/import", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const body = importUsersSchema.parse(request.body ?? {});

    const results = await Promise.allSettled(
      body.users.map(async (userData) => {
        try {
          // Verificar se email já existe
          const existing = await deps.userRepository.findByEmail(userData.email);
          if (existing) {
            return {
              email: userData.email,
              success: false,
              error: "E-mail já está em uso",
            };
          }

          const passwordHash = userData.password
            ? await bcrypt.hash(userData.password, 10)
            : await bcrypt.hash(randomUUID(), 10); // Senha aleatória se não fornecida

          const userId = randomUUID();
          await deps.userRepository.create({
            userId,
            email: userData.email,
            passwordHash,
            displayName: userData.displayName ?? null,
            status: userData.status ?? "active",
          });

          return {
            email: userData.email,
            success: true,
            userId,
          };
        } catch (error) {
          return {
            email: userData.email,
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          };
        }
      }),
    );

    const imported = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const errors = results
      .map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: "Erro ao processar" }))
      .filter((r) => !r.success);

    return reply.send({
      imported,
      total: body.users.length,
      errors,
    });
  });
}



