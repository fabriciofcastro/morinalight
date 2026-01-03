const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndFixUser() {
    try {
        console.log('🔍 Verificando usuário admin@morina.com...\n');

        // Buscar usuário
        let user = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (!user) {
            console.log('❌ Usuário NÃO encontrado!');
            console.log('🔧 Criando usuário admin...\n');

            // Criar organização
            const org = await prisma.organization.upsert({
                where: { id: 'org-demo' },
                update: {},
                create: {
                    id: 'org-demo',
                    name: 'Morina Demo',
                    slug: 'morina-demo',
                },
            });

            // Hash da senha
            const passwordHash = await bcrypt.hash('Admin@123', 10);

            // Criar usuário
            user = await prisma.user.create({
                data: {
                    email: 'admin@morina.com',
                    displayName: 'Administrador',
                    passwordHash: passwordHash,
                    status: 'active',
                    termsAcceptedAt: new Date(),
                    memberships: {
                        create: {
                            organizationId: org.id,
                            role: 'owner',
                        },
                    },
                },
            });

            console.log('✅ Usuário criado com sucesso!');
        } else {
            console.log('✅ Usuário encontrado!');
        }

        console.log('\n📋 Dados do usuário:');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Nome:', user.displayName);
        console.log('Status:', user.status);

        // Testar senha
        console.log('\n🔐 Testando senha "Admin@123"...');
        const isValid = await bcrypt.compare('Admin@123', user.passwordHash);

        if (isValid) {
            console.log('✅ SENHA CORRETA!');
            console.log('\n🎉 Tudo está configurado corretamente!');
            console.log('\n📝 Credenciais:');
            console.log('   Email: admin@morina.com');
            console.log('   Senha: Admin@123');
            console.log('\n💡 Tente fazer login novamente no navegador.');
        } else {
            console.log('❌ SENHA INCORRETA!');
            console.log('\n🔧 Atualizando senha...');

            const newPasswordHash = await bcrypt.hash('Admin@123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newPasswordHash }
            });

            console.log('✅ Senha atualizada com sucesso!');
            console.log('\n📝 Credenciais:');
            console.log('   Email: admin@morina.com');
            console.log('   Senha: Admin@123');
        }

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndFixUser();
