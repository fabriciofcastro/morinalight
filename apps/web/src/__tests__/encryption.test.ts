import { describe, it, expect, beforeEach } from 'vitest';
import { encryptionService } from '../lib/crypto/encryption';

describe('Encryption Service', () => {
    const testData = 'Sensitive data 123';

    describe('encrypt/decrypt', () => {
        it('should encrypt and decrypt data correctly', () => {
            const encrypted = encryptionService.encrypt(testData);
            expect(encrypted).not.toBe(testData);
            expect(encrypted).toContain(':'); // Format: iv:authTag:encrypted

            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(testData);
        });

        it('should produce different ciphertexts for same plaintext', () => {
            const encrypted1 = encryptionService.encrypt(testData);
            const encrypted2 = encryptionService.encrypt(testData);

            expect(encrypted1).not.toBe(encrypted2);

            // But both should decrypt to same value
            expect(encryptionService.decrypt(encrypted1)).toBe(testData);
            expect(encryptionService.decrypt(encrypted2)).toBe(testData);
        });

        it('should handle empty strings', () => {
            const encrypted = encryptionService.encrypt('');
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe('');
        });

        it('should handle special characters', () => {
            const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            const encrypted = encryptionService.encrypt(specialData);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(specialData);
        });

        it('should handle unicode characters', () => {
            const unicodeData = '你好世界 🌍 مرحبا';
            const encrypted = encryptionService.encrypt(unicodeData);
            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(unicodeData);
        });

        it('should throw on invalid encrypted data', () => {
            expect(() => encryptionService.decrypt('invalid')).toThrow();
            expect(() => encryptionService.decrypt('not:enough:parts')).toThrow();
        });
    });

    describe('hash', () => {
        it('should create consistent hashes', () => {
            const hash1 = encryptionService.hash(testData);
            const hash2 = encryptionService.hash(testData);
            expect(hash1).toBe(hash2);
        });

        it('should create different hashes for different data', () => {
            const hash1 = encryptionService.hash('data1');
            const hash2 = encryptionService.hash('data2');
            expect(hash1).not.toBe(hash2);
        });

        it('should create fixed-length hashes', () => {
            const hash = encryptionService.hash(testData);
            expect(hash.length).toBe(64); // SHA-256 hex = 64 chars
        });
    });
});
