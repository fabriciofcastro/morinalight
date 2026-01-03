import { getPrismaClient } from '../prisma';
import { encrypt, decrypt } from './encryption';

async function testEncryption() {
    console.log('--- Testing Manual Encryption ---');
    const sensitiveData = '123.456.789-00';
    const encrypted = encrypt(sensitiveData);
    const decrypted = decrypt(encrypted);

    console.log('Original:', sensitiveData);
    console.log('Encrypted:', encrypted);
    console.log('Decrypted:', decrypted);

    if (sensitiveData === decrypted) {
        console.log('✅ Manual encryption/decryption successful');
    } else {
        console.log('❌ Manual encryption/decryption failed');
    }

    console.log('\n--- Testing Prisma Middleware ---');
    const prisma = await getPrismaClient();
    if (!prisma) {
        console.log('❌ Prisma not available');
        return;
    }

    try {
        const email = `test-security-${Date.now()}@example.com`;
        const testUser = await prisma.user.create({
            data: {
                email,
                passwordHash: 'hashed_password_placeholder',
                cpf: '111.222.333-44',
                phone: '+55 11 99999-8888',
                displayName: 'Security Test User'
            }
        });

        console.log('Created user ID:', testUser.id);
        console.log('CPF (should be decrypted):', testUser.cpf);

        // Raw check (without middleware) would require a raw query
        const raw = await prisma.$queryRaw`SELECT cpf FROM "User" WHERE id = ${testUser.id}`;
        const rawCpf = (raw as any)[0]?.cpf;

        console.log('Raw CPF in DB:', rawCpf);

        if (rawCpf && rawCpf.includes(':')) {
            console.log('✅ Middleware successfully encrypted data in DB');
        } else {
            console.log('❌ Middleware failed to encrypt data in DB');
        }

        // Cleanup
        await prisma.user.delete({ where: { id: testUser.id } });
        console.log('Test user deleted.');
    } catch (error) {
        console.error('❌ Prisma Test Failed:', error);
    }
}

testEncryption().catch(console.error);
