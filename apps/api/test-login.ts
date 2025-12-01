import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    console.log('🔍 Testando credenciais de login...\n');

    const email = 'admin@morina.com';
    const password = 'Admin@123';

    // Buscar usuário
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: {
                    organization: true
                }
            }
        }
    });

    if (!user) {
        console.log('❌ Usuário não encontrado!');
        console.log('Execute: pnpm prisma db seed');
        process.exit(1);
    }

    console.log('✅ Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.displayName);
    console.log('   Status:', user.status);
    console.log('   Organizações:', user.memberships.length);
    console.log('');

    // Testar senha
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (isValid) {
        console.log('✅ Senha correta!');
        console.log('');
        console.log('📋 Credenciais válidas:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');
    } else {
        console.log('❌ Senha incorreta!');
        console.log('   Hash no banco:', user.passwordHash.substring(0, 20) + '...');
        console.log('');
        console.log('Execute o seed novamente:');
        console.log('   cd apps/api && pnpm prisma db seed');
    }
}

testLogin()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
