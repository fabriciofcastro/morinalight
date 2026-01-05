import { randomBytes } from "crypto";
import { signToken } from "../../../core/auth/jwt-rs256.service";
import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type MagicLinkToken = {
    token: string;
    expiresAt: Date;
    email: string;
};

export class MagicLinkService {
    private readonly TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos
    private readonly MAX_REQUESTS_PER_HOUR = 3;

    async generateMagicLink(email: string, baseUrl: string): Promise<MagicLinkToken> {
        // 1. Verificar rate limiting
        const recentRequests = await prisma.magicLinkToken.count({
            where: {
                email: email.toLowerCase(),
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000), // última hora
                },
            },
        });

        if (recentRequests >= this.MAX_REQUESTS_PER_HOUR) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }

        // 2. Verificar se usuário existe
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }

        // 3. Gerar token único
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + this.TOKEN_TTL_MS);

        // 4. Salvar no banco
        await prisma.magicLinkToken.create({
            data: {
                token,
                email: email.toLowerCase(),
                userId: user.id,
                expiresAt,
                used: false,
            },
        });

        // 5. Retornar link completo
        const magicLink = `${baseUrl}/auth/magic-link/verify?token=${token}`;

        console.log(`✨ [MAGIC_LINK] Token gerado para ${email}, expira em 15 minutos`);

        return {
            token: magicLink,
            expiresAt,
            email: email.toLowerCase(),
        };
    }

    async validateMagicLink(token: string): Promise<{ userId: string; email: string }> {
        // 1. Buscar token no banco
        const magicLinkToken = await prisma.magicLinkToken.findUnique({
            where: { token },
        });

        if (!magicLinkToken) {
            throw new Error("INVALID_TOKEN");
        }

        // 2. Verificar se já foi usado
        if (magicLinkToken.used) {
            throw new Error("TOKEN_ALREADY_USED");
        }

        // 3. Verificar expiração
        if (new Date() > magicLinkToken.expiresAt) {
            throw new Error("TOKEN_EXPIRED");
        }

        // 4. Marcar como usado (single-use)
        await prisma.magicLinkToken.update({
            where: { token },
            data: { used: true, usedAt: new Date() },
        });

        console.log(`✅ [MAGIC_LINK] Token validado para ${magicLinkToken.email}`);

        return {
            userId: magicLinkToken.userId,
            email: magicLinkToken.email,
        };
    }

    async sendMagicLinkEmail(email: string, magicLink: string): Promise<void> {
        try {
            const nodemailer = await import("nodemailer");

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587", 10),
                secure: process.env.SMTP_PORT === "465",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            const htmlContent = this.generateMagicLinkEmailHTML(magicLink);

            await transporter.sendMail({
                from: process.env.ALERT_EMAIL_FROM || "noreply@morina.ai",
                to: email,
                subject: "🔐 Seu link de acesso ao Morina",
                html: htmlContent,
            });

            console.log(`📧 [MAGIC_LINK] Email enviado para ${email}`);
        } catch (error) {
            console.error("Error sending magic link email:", error);
            throw new Error("EMAIL_SEND_FAILED");
        }
    }

    private generateMagicLinkEmailHTML(magicLink: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #0ea5e9;
    }
    .header h1 {
      margin: 0;
      color: #0ea5e9;
      font-size: 28px;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
    }
    .button:hover {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Acesso Rápido ao Morina</h1>
    </div>

    <div class="content">
      <p>Olá!</p>
      <p>Você solicitou um link de acesso rápido ao <strong>Morina</strong>.</p>
      <p>Clique no botão abaixo para fazer login automaticamente:</p>

      <div style="text-align: center;">
        <a href="${magicLink}" class="button">🔓 Acessar Morina</a>
      </div>

      <div class="warning">
        <strong>⚠️ Importante:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Este link expira em <strong>15 minutos</strong></li>
          <li>Pode ser usado apenas <strong>uma vez</strong></li>
          <li>Não compartilhe este link com ninguém</li>
        </ul>
      </div>

      <p style="font-size: 14px; color: #666;">
        Se você não solicitou este link, ignore este email. Sua conta permanece segura.
      </p>
    </div>

    <div class="footer">
      <p>Este é um email automático do <strong>Morina Security System</strong></p>
      <p>Por favor, não responda a este email.</p>
    </div>
  </div>
</body>
</html>
    `;
    }

    async cleanupExpiredTokens(): Promise<void> {
        try {
            const deleted = await prisma.magicLinkToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });

            console.log(`🧹 [MAGIC_LINK] ${deleted.count} tokens expirados removidos`);
        } catch (error) {
            console.error("Error cleaning up expired tokens:", error);
        }
    }
}

// Singleton instance
let magicLinkServiceInstance: MagicLinkService | null = null;

export function getMagicLinkService(): MagicLinkService {
    if (!magicLinkServiceInstance) {
        magicLinkServiceInstance = new MagicLinkService();
    }
    return magicLinkServiceInstance;
}
