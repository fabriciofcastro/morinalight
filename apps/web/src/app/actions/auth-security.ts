'use server'

import { passwordResetService } from "@/lib/auth/password-reset";

/**
 * Server Action: Request password reset link
 */
export async function requestPasswordResetAction(email: string) {
    try {
        await passwordResetService.requestReset(email);
        // We always return success to UI to prevent enumeration
        return { success: true, message: "Se o email existir, enviamos um link de recuperação." };
    } catch (error) {
        console.error("Reset Request Error:", error);
        return { success: false, error: "Erro ao processar solicitação." };
    }
}

/**
 * Server Action: Complete password reset using token
 */
export async function completePasswordResetAction(token: string, password: string) {
    try {
        const result = await passwordResetService.completeReset(token, password);
        return result;
    } catch (error) {
        console.error("Reset Complete Error:", error);
        return { success: false, error: "Erro interno ao redefinir senha." };
    }
}

/**
 * Server Action: Update password for authenticated user (Force Change or regular change)
 */
export async function updatePasswordAction(userId: string, newPassword: string) {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = await getPrismaClient();
    const bcrypt = await import("bcryptjs");

    if (!prisma) return { success: false, error: "System unavailable" };

    try {
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
                mustChangePassword: false
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Update Password Error:", error);
        return { success: false, error: "Erro ao atualizar senha." };
    }
}
