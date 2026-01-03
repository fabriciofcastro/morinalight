import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";

const addTrustedDeviceSchema = z.object({
  deviceId: z.string().min(1),
  name: z.string().min(1).max(255),
  browser: z.string().max(100).optional().nullable(),
  os: z.string().max(100).optional().nullable(),
  ip: z.string().max(45).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
});

const prisma = getPrisma();

export async function registerAddTrustedDeviceRoute(app: FastifyInstance) {
  app.post("/users/:userId/trusted-devices", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
    const body = addTrustedDeviceSchema.parse(request.body ?? {});

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // Verificar se já existe dispositivo com esse deviceId
    const existing = await prisma.trustedDevice.findUnique({
      where: { deviceId: body.deviceId },
    });

    if (existing) {
      // Atualizar lastUsed
      const device = await prisma.trustedDevice.update({
        where: { id: existing.id },
        data: {
          lastUsed: new Date(),
          name: body.name,
          browser: body.browser,
          os: body.os,
          ip: body.ip,
          location: body.location,
        },
      });
      return reply.send({ device });
    }

    // Criar novo dispositivo confiável
    const device = await prisma.trustedDevice.create({
      data: {
        userId,
        deviceId: body.deviceId,
        name: body.name,
        browser: body.browser,
        os: body.os,
        ip: body.ip,
        location: body.location,
      },
    });

    return reply.status(201).send({ device });
  });
}











