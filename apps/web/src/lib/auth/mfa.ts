/**
 * Multi-Factor Authentication (MFA/2FA)
 * 
 * Sistema completo de autenticação de dois fatores com TOTP
 */

import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

const APP_NAME = "MorinaLight";

/**
 * Gera secret para 2FA
 */
export function generateMFASecret(userEmail: string): {
    secret: string;
    qrCodeUrl: string;
} {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, APP_NAME, secret);

    return {
        secret,
        qrCodeUrl: otpauth,
    };
}

/**
 * Gera QR Code para configuração
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
    try {
        return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
        throw new Error("Failed to generate QR code");
    }
}

/**
 * Verifica código TOTP
 */
export function verifyMFAToken(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        return false;
    }
}

/**
 * Gera backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();
        codes.push(code);
    }

    return codes;
}

/**
 * Hash backup code para armazenamento
 */
export async function hashBackupCode(code: string): Promise<string> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(code, 10);
}

/**
 * Verifica backup code
 */
export async function verifyBackupCode(
    code: string,
    hashedCode: string,
): Promise<boolean> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(code, hashedCode);
}

/**
 * Service para gerenciar MFA
 */
export class MFAService {
    /**
     * Habilita MFA para usuário
     */
    async enableMFA(userId: string, userEmail: string) {
        // Gerar secret
        const { secret, qrCodeUrl } = generateMFASecret(userEmail);

        // Gerar QR code
        const qrCodeDataUrl = await generateQRCode(qrCodeUrl);

        // Gerar backup codes
        const backupCodes = generateBackupCodes(10);
        const hashedBackupCodes = await Promise.all(
            backupCodes.map((code) => hashBackupCode(code))
        );

        // Salvar temporariamente (não ativar ainda)
        // O usuário precisa verificar o código primeiro
        // TODO: Salvar em sessão temporária ou cache

        return {
            secret,
            qrCodeDataUrl,
            backupCodes, // Retornar códigos em texto plano UMA VEZ
            hashedBackupCodes, // Para salvar no banco após confirmação
        };
    }

    /**
     * Confirma e ativa MFA após verificação do código
     */
    async confirmMFA(userId: string, token: string): Promise<boolean> {
        // TODO: Buscar secret temporário da sessão/cache
        // Por enquanto, buscar do banco se já existir
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            throw new Error("Database unavailable");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true },
        });

        if (!user?.twoFactorSecret) {
            return false;
        }

        // Verificar token
        const isValid = verifyMFAToken(token, user.twoFactorSecret);

        if (!isValid) {
            return false;
        }

        // Ativar MFA
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorEnabledAt: new Date(),
            },
        });

        return true;
    }

    /**
     * Desabilita MFA
     */
    async disableMFA(userId: string, token: string): Promise<boolean> {
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            throw new Error("Database unavailable");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                twoFactorEnabled: true,
                twoFactorSecret: true,
            },
        });

        if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
            return false;
        }

        // Verificar token antes de desabilitar
        const isValid = verifyMFAToken(token, user.twoFactorSecret);

        if (!isValid) {
            return false;
        }

        // Desabilitar MFA
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorBackupCodes: null,
                twoFactorEnabledAt: null,
            },
        });

        return true;
    }

    /**
     * Verifica se usuário tem MFA habilitado
     */
    async isMFAEnabled(userId: string): Promise<boolean> {
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            return false;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true },
        });

        return user?.twoFactorEnabled ?? false;
    }

    /**
     * Verifica código MFA durante login
     */
    async verifyMFAForLogin(
        userId: string,
        token: string
    ): Promise<{ valid: boolean; usedBackupCode?: boolean }> {
        const { getPrismaClient } = await import("@/lib/prisma");
        const prisma = await getPrismaClient();

        if (!prisma) {
            return { valid: false };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                twoFactorSecret: true,
                twoFactorBackupCodes: true
            },
        });

        if (!user || !user.twoFactorSecret) {
            return { valid: false };
        }

        // 1. Verify TOTP
        if (verifyMFAToken(token, user.twoFactorSecret)) {
            return { valid: true };
        }

        // 2. Verify Backup Codes
        // twoFactorBackupCodes is likely a string or string[] in DB depending on provider (Postgres vs others).
        // Assuming it is storing hashed codes as string[] or JSON.

        // Safe cast if needed, or handle if it's null
        let backupCodes: string[] = [];
        try {
            backupCodes = user.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes) : [];
        } catch {
            backupCodes = [];
        }

        for (let i = 0; i < backupCodes.length; i++) {
            const isValid = await verifyBackupCode(token, backupCodes[i]);

            if (isValid) {
                // Remove used backup code
                const newBackupCodes = [...backupCodes];
                newBackupCodes.splice(i, 1);

                await prisma.user.update({
                    where: { id: userId },
                    data: { twoFactorBackupCodes: JSON.stringify(newBackupCodes) },
                });

                return { valid: true, usedBackupCode: true };
            }
        }

        return { valid: false };
    }
}

export const mfaService = new MFAService();

/**
 * EXEMPLO DE USO:
 * 
 * // Habilitar MFA
 * const { qrCodeDataUrl, backupCodes } = await mfaService.enableMFA(
 *   userId,
 *   'user@example.com'
 * );
 * 
 * // Mostrar QR code para usuário escanear no Google Authenticator
 * <img src={qrCodeDataUrl} />
 * 
 * // Mostrar backup codes UMA VEZ
 * backupCodes.forEach(code => console.log(code));
 * 
 * // Confirmar MFA com código do app
 * const confirmed = await mfaService.confirmMFA(userId, '123456');
 * 
 * // Login com MFA
 * const { valid, usedBackupCode } = await mfaService.verifyMFALogin(
 *   userId,
 *   '123456'
 * );
 * 
 * if (usedBackupCode) {
 *   alert('Backup code usado! Gere novos códigos.');
 * }
 */

/**
 * Dependências necessárias:
 * npm install otplib qrcode
 * npm install -D @types/qrcode
 */
