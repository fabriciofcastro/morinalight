import { createHash, randomBytes } from 'crypto';
import { emailService } from '@/lib/email/resend';
import { auditService } from '@/lib/audit/audit-service';

/**
 * Service to handle secure password reset flows
 */
export class PasswordResetService {

    /**
     * Request a password reset for a given email
     * Returns true if email exists and email was sent (or simulated)
     */
    async requestReset(email: string): Promise<boolean> {
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            console.warn("[PasswordReset] Prisma not available.");
            return false;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Enumeration protection
            return true;
        }

        // --- ENTERPRISE SECURITY: RATE LIMITING ---
        // Max 3 requests per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentRequests = await prisma.passwordResetToken.count({
            where: {
                userId: user.id,
                createdAt: { gte: oneHourAgo }
            }
        });

        if (recentRequests >= 3) {
            await auditService.logFailure(
                "PASSWORD_RESET_REQUEST_BLOCKED",
                user.id,
                "user_account",
                new Error("Rate limit exceeded"),
                { metadata: { email } }
            );
            console.warn(`[Security] Rate limit exceeded for ${email}`);
            return true; // Fake success to hide rate limit state
        }

        // --- ENTERPRISE SECURITY: AUDIT ---
        await auditService.log({
            action: "PASSWORD_RESET_REQUESTED",
            userId: user.id,
            userEmail: user.email,
            resource: "user_account",
            timestamp: new Date(),
            success: true,
            metadata: { ipFn: "server-side" } // Metadata placeholder
        });

        // 1. Generate Secure Token
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        // 2. Save Hash to DB (Expires in 1 hour)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            }
        });

        // 3. Send Email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${rawToken}`;

        await emailService.send({
            to: user.email,
            subject: 'Recuperação de Senha - MorinaLight',
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
        <h2>Redefinição de Senha</h2>
        <p>Você solicitou a redefinição de senha para sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Redefinir Minha Senha
        </a>
        <p style="color: #666; font-size: 14px;">Este link é válido por 1 hora.</p>
        <p style="color: #666; font-size: 14px;">Se você não solicitou isso, ignore este email.</p>
        </div>
      `,
            text: `Acesse para redefinir sua senha: ${resetLink}`
        });

        return true;
    }

    /**
     * Validate token and set new password
     */
    async completeReset(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();
        const bcrypt = await import("bcryptjs");

        if (!prisma) return { success: false, error: "System unavailable" };

        // 1. Hash incoming token to match DB
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // 2. Find valid token
        const dbToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });

        if (!dbToken) {
            return { success: false, error: "Token inválido ou expirado." };
        }

        if (dbToken.used) {
            await auditService.logFailure("PASSWORD_RESET_ATTEMPT", dbToken.userId, "password_reset_token", new Error("Token already used"));
            return { success: false, error: "Este link já foi utilizado." };
        }

        if (dbToken.expiresAt < new Date()) {
            return { success: false, error: "O link expirou." };
        }

        // 3. Update User Password & Revoke Sessions (increment tokenVersion)
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: dbToken.userId },
                data: {
                    passwordHash,
                    mustChangePassword: false,
                    status: 'active',
                    tokenVersion: { increment: 1 } // --- ENTERPRISE SECURITY: REVOKE SESSIONS ---
                }
            }),
            prisma.passwordResetToken.update({
                where: { id: dbToken.id },
                data: { used: true }
            })
        ]);

        // --- ENTERPRISE SECURITY: AUDIT & ALERT ---
        await auditService.logSuccess(
            "PASSWORD_CHANGED_VIA_RESET",
            dbToken.userId,
            "user_account",
            { metadata: { tokenUsed: dbToken.id } }
        );

        // Alert Email (Security Notice)
        await emailService.send({
            to: dbToken.user.email,
            subject: 'Alerta de Segurança: Senha Alterada',
            html: `
        <div style="font-family: sans-serif; padding: 20px; border-left: 5px solid #ffa500; background-color: #fffaf0;">
        <h2 style="color: #d97706;">Sua senha foi alterada</h2>
        <p>A senha da sua conta MorinaLight acaba de ser alterada.</p>
        <p><strong>Se foi você:</strong> Ignore este aviso.</p>
        <p><strong>Se NÃO foi você:</strong> Contate o suporte imediatamente para bloquear sua conta.</p>
        <br/>
        <p style="font-size: 12px; color: #666;">Data: ${new Date().toLocaleString()}</p>
        </div>
        `
        });

        return { success: true };
    }
}

export const passwordResetService = new PasswordResetService();
