import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

type GetProfileStatsDeps = {
  userRepository: UserRepository;
};

export async function registerGetProfileStatsRoute(
  app: FastifyInstance,
  deps: GetProfileStatsDeps,
) {
  app.get("/profile/stats", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;

    // Verificar se usuário existe
    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    // TODO: Implementar estatísticas reais quando disponível
    // Por enquanto, retornar estrutura básica
    return reply.send({
      totalActions: 0,
      modulesUsed: [],
      productivityHours: [],
      achievements: [],
      message: "Estatísticas do perfil - em desenvolvimento",
    });
  });
}
