import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const querySchema = z.object({
  status: z.enum(["pending", "active", "suspended"]).optional(),
});

type UsersHttpDeps = {
  userRepository: UserRepository;
};

export async function registerListUsersRoute(app: FastifyInstance, _deps: UsersHttpDeps) {
  app.get("/users", async (request, reply) => {
    // Validar autenticação
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const _query = querySchema.parse(request.query ?? {});

    // Por enquanto, retornar todos os usuários (em produção, adicionar paginação e filtros)
    // Nota: Esta é uma implementação simplificada. Em produção, você precisaria de um método
    // específico no repositório para listar usuários com filtros e paginação.

    return reply.send({
      itens: [],
      message:
        "Listagem de usuários não implementada completamente. Use a rota de membros da organização.",
    });
  });
}
