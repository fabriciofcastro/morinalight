import { randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireAuth } from "../../../core/auth/jwt.middleware";
import { getPrisma } from "../../../infra/database/prisma.service";
import type { UserRepository } from "../repositories/user.repository";

const prisma = getPrisma();

// Função simples para gerar secret TOTP (base32)
function generateTOTPSecret(): string {
  const bytes = randomBytes(20);
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += base32Chars[bytes[i] % base32Chars.length];
  }
  return secret;
}

// Função para gerar códigos de backup
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes.push(code);
  }
  return codes;
}

type Dependencies = {
  userRepository: UserRepository;
};

export async function registerEnable2FARoute(app: FastifyInstance, deps: Dependencies) {
  app.post("/users/:userId/enable-2fa", async (request: FastifyRequest, reply: FastifyReply) => {
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

    // Gerar secret e códigos de backup
    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes();

    // Atualizar usuário no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        twoFactorEnabledAt: new Date(),
      },
    });

    // Gerar URL para QR code (formato otpauth://)
    const otpAuthUrl = `otpauth://totp/MORINA:${encodeURIComponent(user.email)}?secret=${secret}&issuer=MORINA`;

    return reply.send({
      message: "2FA ativado com sucesso",
      userId,
      secret, // Para configuração manual
      otpAuthUrl, // URL para gerar QR code no frontend
      backupCodes, // Códigos de backup (mostrar apenas uma vez)
    });
  });
}
