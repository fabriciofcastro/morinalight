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
            backupCodes.map((code) => hashBackupCode(code)),
        );

        // Salvar no banco (temporário até confirmar)
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: {
        //     mfaSecret: secret,
        //     mfaEnabled: false, // Só ativa após confirmar
        //     mfaBackupCodes: hashedBackupCodes,
        //   },
        // });

        return {
            secret,
            qrCodeDataUrl,
            backupCodes, // Mostrar UMA VEZ para o usuário
        };
    }

    /**
     * Confirma e ativa MFA
     */
    async confirmMFA(userId: string, token: string): Promise<boolean> {
        // Buscar usuário
        // const user = await prisma.user.findUnique({ where: { id: userId } });

        // if (!user?.mfaSecret) {
        //   throw new Error('MFA not initialized');
        // }

        // Verificar token
        const mockSecret = "MOCK_SECRET"; // TODO: usar user.mfaSecret
        const isValid = verifyMFAToken(token, mockSecret);

        if (!isValid) {
            return false;
        }

        // Ativar MFA
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: { mfaEnabled: true },
        // });

        return true;
    }

    /**
     * Desabilita MFA
     */
    async disableMFA(userId: string, token: string): Promise<boolean> {
        // Buscar usuário
        // const user = await prisma.user.findUnique({ where: { id: userId } });

        // Verificar token antes de desabilitar
        const mockSecret = "MOCK_SECRET";
        const isValid = verifyMFAToken(token, mockSecret);

        if (!isValid) {
            return false;
        }

        // Desabilitar
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: {
        //     mfaEnabled: false,
        //     mfaSecret: null,
        //     mfaBackupCodes: [],
        //   },
        // });

        return true;
    }

    /**
     * Verifica MFA no login
     */
    async verifyMFALogin(
        userId: string,
        token: string,
    ): Promise<{ valid: boolean; usedBackupCode?: boolean }> {
        // Buscar usuário
        // const user = await prisma.user.findUnique({ where: { id: userId } });

        // if (!user?.mfaEnabled || !user?.mfaSecret) {
        //   return { valid: false };
        // }

        const mockSecret = "MOCK_SECRET";

        // Tentar verificar TOTP
        if (verifyMFAToken(token, mockSecret)) {
            return { valid: true };
        }

        // Tentar backup code
        const mockBackupCodes: string[] = []; // TODO: user.mfaBackupCodes
        for (let i = 0; i < mockBackupCodes.length; i++) {
            const isValid = await verifyBackupCode(token, mockBackupCodes[i]);

            if (isValid) {
                // Remover backup code usado
                // mockBackupCodes.splice(i, 1);
                // await prisma.user.update({
                //   where: { id: userId },
                //   data: { mfaBackupCodes: mockBackupCodes },
                // });

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
