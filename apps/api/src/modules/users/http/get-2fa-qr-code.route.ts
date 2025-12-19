import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getPrisma } from "../../../infra/database/prisma.service";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import type { UserRepository } from "../repositories/user.repository";

const prisma = getPrisma();

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerGet2FAQRCodeRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  app.get("/users/:userId/2fa/qr-code", async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth()(request, reply);
    if (reply.sent) return;

    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

    const user = await deps.userRepository.findById(userId);
    if (!user) {
      return reply.status(404).send({
        message: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    // Buscar dados de 2FA do banco
    const userWith2FA = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!userWith2FA || !userWith2FA.twoFactorEnabled || !userWith2FA.twoFactorSecret) {
      return reply.status(400).send({
        message: "2FA não está ativado para este usuário",
        code: "2FA_NOT_ENABLED",
      });
    }

    // Gerar URL para QR code (formato otpauth://)
    const otpAuthUrl = `otpauth://totp/MORINA:${encodeURIComponent(userWith2FA.email)}?secret=${userWith2FA.twoFactorSecret}&issuer=MORINA`;

    // Parse backup codes
    let backupCodes: string[] = [];
    try {
      if (userWith2FA.twoFactorBackupCodes) {
        backupCodes = JSON.parse(userWith2FA.twoFactorBackupCodes) as string[];
      }
    } catch {
      // Ignorar erro de parse
    }

    return reply.send({
      otpAuthUrl, // URL para gerar QR code no frontend
      secret: userWith2FA.twoFactorSecret, // Secret para configuração manual
      backupCodes, // Códigos de backup
    });
  });
}












