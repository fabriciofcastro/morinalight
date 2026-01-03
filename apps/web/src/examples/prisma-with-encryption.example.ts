/**
 * Prisma Client with Encryption Middleware Example
 * 
 * This shows how to enable automatic encryption/decryption
 */

import { PrismaClient } from '@prisma/client';
import { createEncryptionMiddleware } from '@/lib/crypto/prisma-encryption-middleware';

// Create Prisma client
const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });

    // Enable automatic encryption/decryption
    client.$use(createEncryptionMiddleware());

    return client;
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Create user with encrypted fields:
 * 
 * const user = await prisma.user.create({
 *   data: {
 *     email: 'user@example.com',
 *     cpf: '123.456.789-00',        // Will be encrypted automatically
 *     phone: '+55 11 99999-9999',   // Will be encrypted automatically
 *     twoFactorSecret: 'SECRET123', // Will be encrypted automatically
 *   },
 * });
 * 
 * 2. Query user - fields are automatically decrypted:
 * 
 * const foundUser = await prisma.user.findUnique({
 *   where: { id: user.id },
 * });
 * 
 * console.log(foundUser.cpf); // '123.456.789-00' (decrypted)
 * 
 * 3. Update user - new values are automatically encrypted:
 * 
 * await prisma.user.update({
 *   where: { id: user.id },
 *   data: {
 *     phone: '+55 11 88888-8888', // Will be encrypted
 *   },
 * });
 * 
 * 4. Check database directly - values are encrypted:
 * 
 * -- In database, you'll see something like:
 * -- cpf: "a1b2c3d4:e5f6g7h8:i9j0k1l2m3n4o5p6"
 * -- This is the encrypted format: iv:authTag:encrypted
 * 
 * ENCRYPTED FIELDS:
 * - User.cpf
 * - User.phone
 * - User.twoFactorSecret
 * - User.twoFactorBackupCodes (JSON)
 * 
 * To add more encrypted fields, update the configuration in:
 * /lib/crypto/prisma-encryption-middleware.ts
 */
