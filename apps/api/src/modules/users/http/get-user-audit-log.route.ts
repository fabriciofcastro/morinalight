import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  field: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerGetUserAuditLogRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/users/:userId/audit", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = (request.headers["x-org-id"] as string) || "";
    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const query = querySchema.parse(request.query ?? {});

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // TODO: Implementar repositório de auditoria quando disponível
    // Por enquanto, retornar estrutura básica
    return reply.send({
      itens: [],
      total: 0,
      cursor: null,
      message: "Auditoria do usuário - em desenvolvimento",
    });
  });
}
