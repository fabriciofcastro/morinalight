/**
 * Prisma Encryption Middleware
 * 
 * Middleware automático para criptografar/descriptografar campos sensíveis
 */

import { Prisma } from '@prisma/client';
import { encrypt, decrypt } from './encryption';

// Definir quais campos devem ser criptografados por modelo
const ENCRYPTED_FIELDS: Record<string, string[]> = {
    User: ['cpf', 'phone'],
    Organization: ['cnpj', 'phone'],
    Supplier: ['document', 'email', 'phone', 'address'],
    Cliente: ['documento', 'rg', 'telefone', 'celular'],
};

/**
 * Middleware para criptografar campos antes de salvar
 */
export function encryptionMiddleware(): Prisma.Middleware {
    return async (params, next) => {
        const model = params.model;

        if (!model || !ENCRYPTED_FIELDS[model]) {
            return next(params);
        }

        const fieldsToEncrypt = ENCRYPTED_FIELDS[model];

        // Criptografar antes de criar
        if (params.action === 'create' || params.action === 'createMany') {
            if (params.args.data) {
                params.args.data = encryptFields(params.args.data, fieldsToEncrypt);
            }
        }

        // Criptografar antes de atualizar
        if (params.action === 'update' || params.action === 'updateMany') {
            if (params.args.data) {
                params.args.data = encryptFields(params.args.data, fieldsToEncrypt);
            }
        }

        // Criptografar antes de upsert
        if (params.action === 'upsert') {
            if (params.args.create) {
                params.args.create = encryptFields(params.args.create, fieldsToEncrypt);
            }
            if (params.args.update) {
                params.args.update = encryptFields(params.args.update, fieldsToEncrypt);
            }
        }

        // Executar query
        const result = await next(params);

        // Descriptografar após buscar
        if (
            params.action === 'findUnique' ||
            params.action === 'findFirst' ||
            params.action === 'findMany'
        ) {
            if (result) {
                if (Array.isArray(result)) {
                    return result.map((item) => decryptFields(item, fieldsToEncrypt));
                } else {
                    return decryptFields(result, fieldsToEncrypt);
                }
            }
        }

        return result;
    };
}

/**
 * Criptografa campos específicos de um objeto
 */
function encryptFields(data: any, fields: string[]): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const encrypted = { ...data };

    for (const field of fields) {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            try {
                // Só criptografa se ainda não estiver criptografado
                // (formato criptografado: "iv:authTag:encrypted")
                if (!encrypted[field].includes(':')) {
                    encrypted[field] = encrypt(encrypted[field]);
                }
            } catch (error) {
                console.error(`Failed to encrypt field ${field}:`, error);
            }
        }
    }

    return encrypted;
}

/**
 * Descriptografa campos específicos de um objeto
 */
function decryptFields(data: any, fields: string[]): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const decrypted = { ...data };

    for (const field of fields) {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                // Só descriptografa se estiver no formato criptografado
                if (decrypted[field].includes(':')) {
                    decrypted[field] = decrypt(decrypted[field]);
                }
            } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                // Manter valor criptografado em caso de erro
            }
        }
    }

    return decrypted;
}

/**
 * Helper para adicionar campos criptografados a um modelo
 */
export function addEncryptedFields(model: string, fields: string[]): void {
    if (!ENCRYPTED_FIELDS[model]) {
        ENCRYPTED_FIELDS[model] = [];
    }
    ENCRYPTED_FIELDS[model].push(...fields);
}

/**
 * Helper para remover campos criptografados de um modelo
 */
export function removeEncryptedFields(model: string, fields: string[]): void {
    if (ENCRYPTED_FIELDS[model]) {
        ENCRYPTED_FIELDS[model] = ENCRYPTED_FIELDS[model].filter(
            (f) => !fields.includes(f)
        );
    }
}

/**
 * Obter lista de campos criptografados para um modelo
 */
export function getEncryptedFields(model: string): string[] {
    return ENCRYPTED_FIELDS[model] || [];
}

/**
 * EXEMPLO DE USO:
 * 
 * // lib/prisma.ts
 * import { PrismaClient } from '@prisma/client';
 * import { encryptionMiddleware } from './crypto/prisma-encryption';
 * 
 * const prisma = new PrismaClient();
 * 
 * // Adicionar middleware
 * prisma.$use(encryptionMiddleware());
 * 
 * export { prisma };
 * 
 * // Agora todos os campos definidos em ENCRYPTED_FIELDS serão
 * // automaticamente criptografados ao salvar e descriptografados ao buscar
 * 
 * // Criar usuário (CPF será criptografado automaticamente)
 * const user = await prisma.user.create({
 *   data: {
 *     email: 'user@example.com',
 *     cpf: '123.456.789-00', // Será criptografado
 *     phone: '11999999999',  // Será criptografado
 *   },
 * });
 * 
 * // Buscar usuário (CPF será descriptografado automaticamente)
 * const foundUser = await prisma.user.findUnique({
 *   where: { id: user.id },
 * });
 * 
 * console.log(foundUser.cpf); // '123.456.789-00' (descriptografado)
 */
