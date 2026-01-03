/**
 * Security Integration Tests
 * 
 * Testes abrangentes para funcionalidades de segurança:
 * - Middleware de segurança
 * - Criptografia de dados
 * - MFA (Multi-Factor Authentication)
 * - IDS (Intrusion Detection System)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encrypt, decrypt } from '@/lib/crypto/encryption';
import { verifyMFAToken, generateMFASecret, generateBackupCodes, verifyBackupCode, hashBackupCode } from '@/lib/auth/mfa';
import { intrusionDetector } from '@/lib/security/intrusion-detection';

describe('Security Tests', () => {
    describe('Data Encryption', () => {
        it('deve criptografar e descriptografar dados corretamente', () => {
            const originalData = '123.456.789-00';
            const encrypted = encrypt(originalData);
            const decrypted = decrypt(encrypted);

            expect(encrypted).not.toBe(originalData);
            expect(encrypted).toContain(':'); // Formato: iv:authTag:encrypted
            expect(decrypted).toBe(originalData);
        });

        it('deve gerar IVs únicos para cada criptografia', () => {
            const data = 'test-data';
            const encrypted1 = encrypt(data);
            const encrypted2 = encrypt(data);

            expect(encrypted1).not.toBe(encrypted2);
            expect(decrypt(encrypted1)).toBe(data);
            expect(decrypt(encrypted2)).toBe(data);
        });

        it('deve falhar ao descriptografar dados inválidos', () => {
            expect(() => decrypt('invalid-data')).toThrow();
            expect(() => decrypt('iv:tag:data')).toThrow();
        });

        it('deve lidar com strings vazias', () => {
            const result = encrypt('');
            expect(result).toBe(''); // Empty string returns empty string
        });

        it('deve lidar com caracteres especiais', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            const encrypted = encrypt(specialChars);
            const decrypted = decrypt(encrypted);
            expect(decrypted).toBe(specialChars);
        });
    });

    describe('MFA (Multi-Factor Authentication)', () => {
        it('deve gerar secret e QR code URL', () => {
            const email = 'test@example.com';
            const { secret, qrCodeUrl } = generateMFASecret(email);

            expect(secret).toBeDefined();
            expect(secret.length).toBeGreaterThan(0);
            expect(qrCodeUrl).toContain('otpauth://totp/');
            expect(qrCodeUrl).toContain('test%40example.com'); // URL-encoded email
        });

        it('deve gerar códigos de backup únicos', () => {
            const codes = generateBackupCodes(10);

            expect(codes).toHaveLength(10);
            expect(new Set(codes).size).toBe(10); // Todos únicos
            codes.forEach(code => {
                expect(code).toMatch(/^[0-9A-F]{8}$/); // 8 caracteres hex
            });
        });

        it('deve hashear e verificar backup codes', async () => {
            const code = 'ABCD1234';
            const hashed = await hashBackupCode(code);

            expect(hashed).not.toBe(code);
            expect(await verifyBackupCode(code, hashed)).toBe(true);
            expect(await verifyBackupCode('WRONG123', hashed)).toBe(false);
        });

        it('deve validar tokens TOTP válidos', () => {
            const { secret } = generateMFASecret('test@example.com');

            // Gerar token válido usando a mesma biblioteca
            const authenticator = require('otplib').authenticator;
            const validToken = authenticator.generate(secret);

            expect(verifyMFAToken(validToken, secret)).toBe(true);
        });

        it('deve rejeitar tokens TOTP inválidos', () => {
            const { secret } = generateMFASecret('test@example.com');

            expect(verifyMFAToken('000000', secret)).toBe(false);
            expect(verifyMFAToken('123456', secret)).toBe(false);
            expect(verifyMFAToken('invalid', secret)).toBe(false);
        });
    });

    describe('Intrusion Detection System', () => {
        it('deve ter método para detectar falhas de login', () => {
            expect(intrusionDetector.detectFailedLogins).toBeDefined();
            expect(typeof intrusionDetector.detectFailedLogins).toBe('function');
        });

        it('deve ter método para detectar IPs suspeitos', () => {
            expect(intrusionDetector.detectSuspiciousIPs).toBeDefined();
            expect(typeof intrusionDetector.detectSuspiciousIPs).toBe('function');
        });

        it('deve ter método para detectar acesso fora de horário', () => {
            expect(intrusionDetector.detectAfterHoursAccess).toBeDefined();
            expect(typeof intrusionDetector.detectAfterHoursAccess).toBe('function');
        });

        it('deve ter método para detectar volume anormal', () => {
            expect(intrusionDetector.detectAbnormalVolume).toBeDefined();
            expect(typeof intrusionDetector.detectAbnormalVolume).toBe('function');
        });

        it('deve ter método para análise completa', () => {
            expect(intrusionDetector.analyzeUserSecurity).toBeDefined();
            expect(typeof intrusionDetector.analyzeUserSecurity).toBe('function');
        });
    });

    describe('Security Middleware', () => {
        it('deve exportar middleware de autenticação', async () => {
            const { authMiddleware } = await import('@/lib/middleware/security-middleware');
            expect(authMiddleware).toBeDefined();
            expect(typeof authMiddleware).toBe('function');
        });

        it('deve exportar middleware de rate limiting', async () => {
            const { rateLimitMiddleware } = await import('@/lib/middleware/security-middleware');
            expect(rateLimitMiddleware).toBeDefined();
            expect(typeof rateLimitMiddleware).toBe('function');
        });

        it('deve exportar middleware de IDS', async () => {
            const { idsMiddleware } = await import('@/lib/middleware/security-middleware');
            expect(idsMiddleware).toBeDefined();
            expect(typeof idsMiddleware).toBe('function');
        });

        it('deve exportar middleware pré-configurados', async () => {
            const {
                publicRouteMiddleware,
                protectedRouteMiddleware,
                adminRouteMiddleware
            } = await import('@/lib/middleware/security-middleware');

            expect(publicRouteMiddleware).toBeDefined();
            expect(protectedRouteMiddleware).toBeDefined();
            expect(adminRouteMiddleware).toBeDefined();
        });
    });

    describe('JWT Token Management', () => {
        it('deve exportar funções de geração de tokens', async () => {
            const { generateAccessToken, generateRefreshToken } = await import('@/lib/auth/jwt');
            expect(generateAccessToken).toBeDefined();
            expect(generateRefreshToken).toBeDefined();
        });

        it('deve exportar funções de verificação de tokens', async () => {
            const { verifyAccessToken, verifyRefreshToken } = await import('@/lib/auth/jwt');
            expect(verifyAccessToken).toBeDefined();
            expect(verifyRefreshToken).toBeDefined();
        });

        it('deve gerar tokens válidos', async () => {
            const { generateAccessToken } = await import('@/lib/auth/jwt');
            const user = {
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'user' as any,
            };

            const token = generateAccessToken(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT format
        });
    });

    describe('Security Monitor', () => {
        it('deve exportar função de monitoramento', async () => {
            const { runSecurityMonitor } = await import('@/lib/cron/security-monitor');
            expect(runSecurityMonitor).toBeDefined();
            expect(typeof runSecurityMonitor).toBe('function');
        });

        it('deve exportar funções de análise', async () => {
            const {
                runSecurityAnalysis,
                cleanupExpiredBlocks,
                cleanupOldAlerts,
                generateSecurityStats
            } = await import('@/lib/cron/security-monitor');

            expect(runSecurityAnalysis).toBeDefined();
            expect(cleanupExpiredBlocks).toBeDefined();
            expect(cleanupOldAlerts).toBeDefined();
            expect(generateSecurityStats).toBeDefined();
        });
    });
});
