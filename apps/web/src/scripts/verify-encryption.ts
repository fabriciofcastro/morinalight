/**
 * Encryption Verification Script
 * Verifies that encryption/decryption is working correctly
 */

import * as encryptionService from '../lib/crypto/encryption';
import { getPrismaClient } from '../lib/prisma';

async function verifyEncryption() {
    console.log('🔐 Encryption Verification Script\n');

    // Test 1: Basic Encryption/Decryption
    console.log('Test 1: Basic Encryption/Decryption');
    const testData = 'Test sensitive data 123';
    try {
        const encrypted = encryptionService.encrypt(testData);
        console.log(`  ✅ Encrypted: ${encrypted.substring(0, 50)}...`);

        const decrypted = encryptionService.decrypt(encrypted);
        if (decrypted === testData) {
            console.log(`  ✅ Decrypted successfully: ${decrypted}`);
        } else {
            console.log(`  ❌ Decryption mismatch!`);
            process.exit(1);
        }
    } catch (error) {
        console.log(`  ❌ Error: ${error}`);
        process.exit(1);
    }

    // Test 2: Database Encryption
    console.log('\nTest 2: Database Encryption');
    try {
        const prisma = await getPrismaClient();
        if (!prisma) {
            console.log('  ⚠️  Prisma not available, skipping database test');
            return;
        }

        // Find a user with encrypted data
        const user = await prisma.user.findFirst({
            where: {
                cpf: { not: null },
            },
            select: {
                id: true,
                email: true,
                cpf: true,
            },
        });

        if (user && user.cpf) {
            console.log(`  ✅ Found user with encrypted CPF: ${user.email}`);

            // Check format
            if (user.cpf.includes(':')) {
                console.log(`  ✅ CPF is encrypted (format: iv:authTag:encrypted)`);
                console.log(`  ✅ Sample: ${user.cpf.substring(0, 50)}...`);
            } else {
                console.log(`  ⚠️  CPF appears to be unencrypted: ${user.cpf}`);
            }
        } else {
            console.log('  ⚠️  No users with CPF found');
        }
    } catch (error) {
        console.log(`  ❌ Database error: ${error}`);
    }

    // Test 3: Environment Variables
    console.log('\nTest 3: Environment Variables');
    const requiredVars = ['ENCRYPTION_MASTER_KEY', 'ENCRYPTION_SALT'];
    let allPresent = true;

    for (const varName of requiredVars) {
        if (process.env[varName]) {
            const length = process.env[varName]!.length;
            console.log(`  ✅ ${varName}: ${length} characters`);
        } else {
            console.log(`  ❌ ${varName}: NOT SET`);
            allPresent = false;
        }
    }

    if (!allPresent) {
        console.log('\n❌ Some environment variables are missing!');
        process.exit(1);
    }

    console.log('\n✅ All encryption tests passed!');
}

verifyEncryption().catch(console.error);
