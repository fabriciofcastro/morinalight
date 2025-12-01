const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    console.log('Criando usuário admin...\n');

    try {
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
        console.log('✅ Organização:', org.name);

        // Hash da senha
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        console.log('✅ Hash gerado');

        // Criar usuário
        const user = await prisma.user.create({
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

        console.log('✅ Usuário criado:', user.email);
        console.log('\n📝 Credenciais:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');
        console.log('\n🎉 CONCLUÍDO!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
