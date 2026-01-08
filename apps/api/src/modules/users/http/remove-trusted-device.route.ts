import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export async function registerRemoveTrustedDeviceRoute(app: FastifyInstance) {
  app.delete(
    "/users/:userId/trusted-devices/:deviceId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth()(request, reply);
      if (reply.sent) return;

      if (!request.auth) {
        return reply.status(401).send({
          message: "Autenticação necessária",
          code: "UNAUTHORIZED",
        });
      }

      const { userId, deviceId } = z
        .object({
          userId: z.string().uuid(),
          deviceId: z.string().min(1),
        })
        .parse(request.params);

      // Verificar se o dispositivo existe e pertence ao usuário
      const device = await prisma.trustedDevice.findUnique({
        where: { deviceId },
      });

      if (!device || device.userId !== userId) {
        return reply.status(404).send({
          message: "Dispositivo confiável não encontrado",
          code: "DEVICE_NOT_FOUND",
        });
      }

      await prisma.trustedDevice.delete({
        where: { id: device.id },
      });

      return reply.status(204).send();
    },
  );
}
