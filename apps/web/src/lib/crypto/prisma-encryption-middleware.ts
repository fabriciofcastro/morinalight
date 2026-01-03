/**
 * Prisma Encryption Middleware
 * 
 * Automatically encrypts/decrypts sensitive fields transparently
 */

import { Prisma } from '@prisma/client';
import { encrypt, decrypt } from './encryption';

/**
 * Configuration for encrypted fields per model
 */
const ENCRYPTED_FIELDS: Record<string, string[]> = {
    User: ['cpf', 'phone', 'twoFactorSecret'],
    Cliente: ['documento', 'rg', 'telefone', 'celular'],
    Supplier: ['document', 'phone'],
};

/**
 * Fields that should be encrypted in JSON format
 */
const JSON_ENCRYPTED_FIELDS: Record<string, string[]> = {
    User: ['twoFactorBackupCodes'],
};

/**
 * Check if a field should be encrypted
 */
function shouldEncrypt(model: string, field: string): boolean {
    return ENCRYPTED_FIELDS[model]?.includes(field) ?? false;
}

/**
 * Check if a field should be encrypted as JSON
 */
function shouldEncryptJSON(model: string, field: string): boolean {
    return JSON_ENCRYPTED_FIELDS[model]?.includes(field) ?? false;
}

/**
 * Encrypt data object fields
 */
function encryptData(model: string, data: any): any {
    if (!data || typeof data !== 'object') return data;

    const encrypted = { ...data };

    // Encrypt regular fields
    const fieldsToEncrypt = ENCRYPTED_FIELDS[model] || [];
    for (const field of fieldsToEncrypt) {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            try {
                encrypted[field] = encrypt(encrypted[field]);
            } catch (error) {
                console.error(`Failed to encrypt ${model}.${field}:`, error);
            }
        }
    }

    // Encrypt JSON fields
    const jsonFieldsToEncrypt = JSON_ENCRYPTED_FIELDS[model] || [];
    for (const field of jsonFieldsToEncrypt) {
        if (encrypted[field]) {
            try {
                const jsonString = typeof encrypted[field] === 'string'
                    ? encrypted[field]
                    : JSON.stringify(encrypted[field]);
                encrypted[field] = encrypt(jsonString);
            } catch (error) {
                console.error(`Failed to encrypt JSON ${model}.${field}:`, error);
            }
        }
    }

    return encrypted;
}

/**
 * Decrypt data object fields
 */
function decryptData(model: string, data: any): any {
    if (!data || typeof data !== 'object') return data;

    const decrypted = { ...data };

    // Decrypt regular fields
    const fieldsToDecrypt = ENCRYPTED_FIELDS[model] || [];
    for (const field of fieldsToDecrypt) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                // Check if already decrypted (doesn't have encryption format)
                if (!decrypted[field].includes(':')) {
                    continue;
                }
                decrypted[field] = decrypt(decrypted[field]);
            } catch (error) {
                console.error(`Failed to decrypt ${model}.${field}:`, error);
            }
        }
    }

    // Decrypt JSON fields
    const jsonFieldsToDecrypt = JSON_ENCRYPTED_FIELDS[model] || [];
    for (const field of jsonFieldsToDecrypt) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                // Check if already decrypted
                if (!decrypted[field].includes(':')) {
                    continue;
                }
                const decryptedString = decrypt(decrypted[field]);
                decrypted[field] = decryptedString;
            } catch (error) {
                console.error(`Failed to decrypt JSON ${model}.${field}:`, error);
            }
        }
    }

    return decrypted;
}

/**
 * Decrypt array of results
 */
function decryptResults(model: string, results: any): any {
    if (Array.isArray(results)) {
        return results.map(item => decryptData(model, item));
    }
    return decryptData(model, results);
}

/**
 * Create Prisma encryption middleware
 */
export function createEncryptionMiddleware(): Prisma.Middleware {
    return async (params, next) => {
        const model = params.model;

        if (!model) {
            return next(params);
        }

        // Encrypt on write operations
        if (params.action === 'create' || params.action === 'createMany') {
            if (params.args.data) {
                if (Array.isArray(params.args.data)) {
                    params.args.data = params.args.data.map((item: any) =>
                        encryptData(model, item)
                    );
                } else {
                    params.args.data = encryptData(model, params.args.data);
                }
            }
        }

        if (params.action === 'update' || params.action === 'updateMany') {
            if (params.args.data) {
                params.args.data = encryptData(model, params.args.data);
            }
        }

        if (params.action === 'upsert') {
            if (params.args.create) {
                params.args.create = encryptData(model, params.args.create);
            }
            if (params.args.update) {
                params.args.update = encryptData(model, params.args.update);
            }
        }

        // Execute query
        const result = await next(params);

        // Decrypt on read operations
        if (
            params.action === 'findUnique' ||
            params.action === 'findFirst' ||
            params.action === 'findMany' ||
            params.action === 'findUniqueOrThrow' ||
            params.action === 'findFirstOrThrow'
        ) {
            return decryptResults(model, result);
        }

        // Decrypt on write operations that return data
        if (
            params.action === 'create' ||
            params.action === 'update' ||
            params.action === 'upsert'
        ) {
            return decryptData(model, result);
        }

        return result;
    };
}

/**
 * USAGE:
 * 
 * In lib/prisma.ts:
 * 
 * import { createEncryptionMiddleware } from './crypto/prisma-encryption-middleware';
 * 
 * const prisma = new PrismaClient();
 * prisma.$use(createEncryptionMiddleware());
 * 
 * export default prisma;
 * 
 * Now all User.cpf, User.phone, User.twoFactorSecret fields will be
 * automatically encrypted on write and decrypted on read!
 */
