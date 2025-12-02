const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function forceFixPassword() {
    try {
        console.log('🔧 FORÇANDO ATUALIZAÇÃO DE SENHA\n');

        // Hash que você gerou
        const targetHash = '$2b$10$hk3j7MXfU.efPhUUJNxl9eSk1Dd/LBRx7KGRgNK5.E8FkZzmI2Ba6';

        // 1. Testar se o hash funciona
        console.log('1️⃣ Testando hash gerado...');
        const isValidHash = await bcrypt.compare('Admin@123', targetHash);
        console.log('   Hash válido:', isValidHash ? '✅ SIM' : '❌ NÃO');

        if (!isValidHash) {
            throw new Error('Hash inválido! Não pode ser usado.');
        }

        // 2. Buscar usuário
        console.log('\n2️⃣ Buscando usuário...');
        const user = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (!user) {
            throw new Error('Usuário não encontrado!');
        }

        console.log('   ✅ Usuário encontrado:', user.email);
        console.log('   Hash atual:', user.passwordHash.substring(0, 30) + '...');

        // 3. Atualizar senha
        console.log('\n3️⃣ Atualizando senha...');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: targetHash,
                status: 'active'
            }
        });
        console.log('   ✅ Senha atualizada!');

        // 4. Verificar atualização
        console.log('\n4️⃣ Verificando atualização...');
        const updatedUser = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' }
        });

        console.log('   Hash novo:', updatedUser.passwordHash.substring(0, 30) + '...');
        console.log('   Hashes iguais:', updatedUser.passwordHash === targetHash ? '✅ SIM' : '❌ NÃO');

        // 5. Testar senha final
        console.log('\n5️⃣ Testando senha final...');
        const finalTest = await bcrypt.compare('Admin@123', updatedUser.passwordHash);
        console.log('   Senha funciona:', finalTest ? '✅ SIM' : '❌ NÃO');

        if (!finalTest) {
            throw new Error('Senha ainda não funciona após atualização!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCESSO! SENHA CORRIGIDA E TESTADA!');
        console.log('='.repeat(60));
        console.log('\n📝 CREDENCIAIS:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');
        console.log('\n🚀 TESTE AGORA NO NAVEGADOR!\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

forceFixPassword();
