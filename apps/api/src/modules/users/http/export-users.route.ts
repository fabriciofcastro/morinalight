import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const querySchema = z.object({
  format: z.enum(["csv", "json", "xlsx"]).default("csv"),
  status: z.enum(["pending", "active", "suspended"]).optional(),
});

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerExportUsersRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/users/export", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const query = querySchema.parse(request.query ?? {});

    // Por enquanto, retornar estrutura básica
    // Em produção, buscar usuários e formatar conforme o formato solicitado
    return reply.send({
      message: "Exportação de usuários será implementada em breve",
      format: query.format,
      downloadUrl: null, // URL temporária para download do arquivo
    });
  });
}

