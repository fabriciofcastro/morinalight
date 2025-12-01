const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    try {
        console.log('🔍 Procurando usuário admin@morina.com...\n');

        const user = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' },
            include: {
                memberships: {
                    include: {
                        organization: true
                    }
                }
            }
        });

        if (!user) {
            console.log('❌ USUÁRIO NÃO ENCONTRADO!');
            console.log('\nSolução:');
            console.log('  cd apps/api');
            console.log('  pnpm prisma db seed');
            process.exit(1);
        }

        console.log('✅ Usuário encontrado!');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Nome:', user.displayName);
        console.log('Status:', user.status);
        console.log('Organizações:', user.memberships.length);
        console.log('Hash da senha:', user.passwordHash.substring(0, 30) + '...');
        console.log('');

        // Testar senha
        const testPassword = 'Admin@123';
        console.log('🔐 Testando senha:', testPassword);
        const isValid = await bcrypt.compare(testPassword, user.passwordHash);

        if (isValid) {
            console.log('✅ SENHA CORRETA!');
            console.log('\n📋 Credenciais válidas:');
            console.log('  Email: admin@morina.com');
            console.log('  Senha: Admin@123');
            console.log('\n⚠️  Se o login ainda falha com 401, o problema está na API.');
            console.log('   Verifique se a API está rodando: pnpm dev');
        } else {
            console.log('❌ SENHA INCORRETA!');
            console.log('\nO hash no banco não corresponde à senha Admin@123');
            console.log('Execute o seed novamente:');
            console.log('  cd apps/api');
            console.log('  pnpm prisma db seed');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
