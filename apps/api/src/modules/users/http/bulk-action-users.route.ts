import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const bulkActionSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
  action: z.enum(["activate", "suspend", "delete", "resend_invite"]),
});

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerBulkActionUsersRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.post("/users/bulk-action", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const body = bulkActionSchema.parse(request.body ?? {});

    const results = await Promise.allSettled(
      body.userIds.map(async (userId) => {
        try {
          const user = await deps.userRepository.findById(userId);
          if (!user) {
            return { userId, success: false, error: "Usuário não encontrado" };
          }

          switch (body.action) {
            case "activate":
              if (deps.userRepository.update) {
                await deps.userRepository.update({ userId, status: "active" });
              }
              return { userId, success: true };
            case "suspend":
              if (deps.userRepository.update) {
                await deps.userRepository.update({ userId, status: "suspended" });
              }
              return { userId, success: true };
            case "delete":
              if (deps.userRepository.delete) {
                await deps.userRepository.delete(userId);
              }
              return { userId, success: true };
            case "resend_invite":
              // TODO: Implementar reenvio de convite
              return { userId, success: false, error: "Reenvio de convite não implementado" };
            default:
              return { userId, success: false, error: "Ação inválida" };
          }
        } catch (error) {
          return {
            userId,
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          };
        }
      }),
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success,
    ).length;
    const failureCount = results.length - successCount;

    return reply.send({
      results: results.map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: "Erro ao processar" })),
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount,
      },
    });
  });
}

