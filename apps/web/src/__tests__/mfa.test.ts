import { describe, expect, it } from 'vitest';
import { mfaService } from '../lib/auth/mfa';

describe('MFA Service', () => {
    describe('generateSecret', () => {
        it('should generate a valid secret', () => {
            const secret = mfaService.generateSecret();
            expect(secret).toBeTruthy();
            expect(secret.length).toBeGreaterThan(0);
        });

        it('should generate different secrets', () => {
            const secret1 = mfaService.generateSecret();
            const secret2 = mfaService.generateSecret();
            expect(secret1).not.toBe(secret2);
        });
    });

    describe('generateQRCode', () => {
        it('should generate QR code data URL', async () => {
            const secret = mfaService.generateSecret();
            const qrCode = await mfaService.generateQRCode(secret, 'test@example.com');

            expect(qrCode).toContain('data:image/png;base64');
        });
    });

    describe('verifyToken', () => {
        it('should verify valid token', () => {
            const secret = mfaService.generateSecret();
            const token = mfaService.generateToken(secret);

            const isValid = mfaService.verifyToken(secret, token);
            expect(isValid).toBe(true);
        });

        it('should reject invalid token', () => {
            const secret = mfaService.generateSecret();
            const isValid = mfaService.verifyToken(secret, '000000');
            expect(isValid).toBe(false);
        });

        it('should reject token with wrong secret', () => {
            const secret1 = mfaService.generateSecret();
            const secret2 = mfaService.generateSecret();
            const token = mfaService.generateToken(secret1);

            const isValid = mfaService.verifyToken(secret2, token);
            expect(isValid).toBe(false);
        });
    });

    describe('generateBackupCodes', () => {
        it('should generate 10 backup codes', () => {
            const codes = mfaService.generateBackupCodes();
            expect(codes).toHaveLength(10);
        });

        it('should generate unique codes', () => {
            const codes = mfaService.generateBackupCodes();
            const uniqueCodes = new Set(codes);
            expect(uniqueCodes.size).toBe(10);
        });

        it('should generate codes with correct format', () => {
            const codes = mfaService.generateBackupCodes();
            codes.forEach(code => {
                expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
            });
        });
    });

    describe('verifyBackupCode', () => {
        it('should verify valid backup code', () => {
            const codes = mfaService.generateBackupCodes();
            const hashedCodes = codes.map(code => mfaService.hashBackupCode(code));

            const isValid = mfaService.verifyBackupCode(codes[0]!, hashedCodes);
            expect(isValid).toBe(true);
        });

        it('should reject invalid backup code', () => {
            const codes = mfaService.generateBackupCodes();
            const hashedCodes = codes.map(code => mfaService.hashBackupCode(code));

            const isValid = mfaService.verifyBackupCode('XXXX-XXXX', hashedCodes);
            expect(isValid).toBe(false);
        });
    });
});
