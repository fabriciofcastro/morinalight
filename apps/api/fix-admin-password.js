const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdminPassword() {
    console.log('🔧 Corrigindo senha do admin...\n');

    try {
        // 1. Gerar hash da senha
        console.log('1️⃣ Gerando hash para "Admin@123"...');
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        console.log('   ✅ Hash gerado:', passwordHash.substring(0, 30) + '...');

        // 2. Atualizar usuário
        console.log('\n2️⃣ Atualizando usuário admin@morina.com...');
        const user = await prisma.user.update({
            where: { email: 'admin@morina.com' },
            data: {
                passwordHash: passwordHash,
                status: 'active'
            }
        });
        console.log('   ✅ Usuário atualizado!');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Status:', user.status);

        // 3. Verificar senha
        console.log('\n3️⃣ Verificando senha...');
        const isValid = await bcrypt.compare('Admin@123', passwordHash);
        console.log('   Resultado:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');

        // 4. Resultado
        console.log('\n' + '='.repeat(50));
        console.log('🎉 SENHA CORRIGIDA COM SUCESSO!\n');
        console.log('📝 Use estas credenciais:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');
        console.log('\n💡 Tente fazer login agora!');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);

        if (error.code === 'P2025') {
            console.error('\n⚠️ Usuário admin@morina.com não encontrado!');
            console.error('Execute o script de criação de usuário primeiro.');
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminPassword();
