const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔧 CRIANDO USUÁRIO ADMIN\n');
        console.log('='.repeat(60));

        // 1. Criar organização
        console.log('\n1️⃣ Criando organização...');
        const org = await prisma.organization.upsert({
            where: { id: 'org-demo' },
            update: {},
            create: {
                id: 'org-demo',
                name: 'Morina Demo',
                slug: 'morina-demo',
                description: 'Organização de demonstração',
            }
        });
        console.log('   ✅ Organização criada:', org.name);

        // 2. Gerar hash da senha
        console.log('\n2️⃣ Gerando hash da senha...');
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        console.log('   ✅ Hash gerado:', passwordHash.substring(0, 30) + '...');

        // 3. Criar usuário
        console.log('\n3️⃣ Criando usuário admin...');
        const user = await prisma.user.create({
            data: {
                email: 'admin@morina.com',
                displayName: 'Administrador',
                passwordHash: passwordHash,
                status: 'active',
                termsAcceptedAt: new Date(),
            }
        });
        console.log('   ✅ Usuário criado!');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.displayName);

        // 4. Criar membership (vínculo com organização)
        console.log('\n4️⃣ Vinculando usuário à organização...');
        const membership = await prisma.organizationMembership.create({
            data: {
                userId: user.id,
                organizationId: org.id,
                role: 'owner',
            }
        });
        console.log('   ✅ Membership criado!');
        console.log('   Role:', membership.role);

        // 5. Testar senha
        console.log('\n5️⃣ Testando senha...');
        const isValid = await bcrypt.compare('Admin@123', passwordHash);
        console.log('   Senha válida:', isValid ? '✅ SIM' : '❌ NÃO');

        // 6. Resultado final
        console.log('\n' + '='.repeat(60));
        console.log('🎉 USUÁRIO ADMIN CRIADO COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('\n📋 INFORMAÇÕES:');
        console.log('   Usuário ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.displayName);
        console.log('   Status:', user.status);
        console.log('   Organização:', org.name);
        console.log('   Role:', membership.role);

        console.log('\n🔑 CREDENCIAIS DE LOGIN:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');

        console.log('\n🚀 ACESSE AGORA:');
        console.log('   http://localhost:3000/login');
        console.log('\n' + '='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);

        if (error.code === 'P2002') {
            console.error('\n⚠️ Usuário já existe!');
            console.error('Se quiser recriar, delete primeiro:');
            console.error('   DELETE FROM "User" WHERE email = \'admin@morina.com\';');
        } else {
            console.error('\nDetalhes:', error);
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
