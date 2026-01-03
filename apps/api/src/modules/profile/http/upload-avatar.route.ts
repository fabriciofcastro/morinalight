import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../../users/repositories/user.repository";

const uploadAvatarSchema = z.object({
  avatarUrl: z.string().url(),
});

type UploadAvatarDeps = {
  userRepository: UserRepository;
};

export async function registerUploadAvatarRoute(app: FastifyInstance, deps: UploadAvatarDeps) {
  app.post("/profile/avatar", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const userId = request.auth.userId;
    const body = uploadAvatarSchema.parse(request.body ?? {});

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
      });
    }

    if (!deps.userRepository.update) {
      return reply.status(500).send({
        message: "Repositório de usuários não suporta atualização",
      });
    }

    const updated = await deps.userRepository.update({
      userId,
      avatarUrl: body.avatarUrl,
    });

    if (!updated) {
      return reply.status(500).send({
        message: "Falha ao atualizar avatar",
      });
    }

    return reply.send({
      avatarUrl: updated.avatarUrl,
    });
  });
}
