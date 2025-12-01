import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Criar organização padrão
    const org = await prisma.organization.upsert({
        where: { id: 'org-demo' },
        update: {},
        create: {
            id: 'org-demo',
            name: 'Morina Demo',
            slug: 'morina-demo',
        },
    });

    console.log('✅ Organização criada:', org.name);

    // Hash da senha: Admin@123
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Criar usuário admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@morina.com' },
        update: {},
        create: {
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

    console.log('✅ Usuário admin criado:', admin.email);
    console.log('');
    console.log('📋 Credenciais de login:');
    console.log('   Email: admin@morina.com');
    console.log('   Senha: Admin@123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao fazer seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
