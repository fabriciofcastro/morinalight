import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
    // Criar org
    const org = await prisma.organization.create({
        data: {
            id: 'org-' + Date.now(),
            name: 'Morina Demo',
            slug: 'morina-demo-' + Date.now(),
        },
    });

    console.log('Org criada:', org.id);

    // Hash
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('Hash:', hash.substring(0, 30) + '...');

    // Criar user (SEM termsAcceptedAt - campo não existe no schema)
    const user = await prisma.user.create({
        data: {
            email: 'admin@morina.com',
            displayName: 'Administrador',
            passwordHash: hash,
            status: 'active',
        },
    });

    console.log('User criado:', user.email);

    // Criar membership
    await prisma.organizationMembership.create({
        data: {
            userId: user.id,
            organizationId: org.id,
            role: 'owner',
        },
    });

    console.log('Membership criado');
    console.log('\n✅ CONCLUÍDO!');
    console.log('Email: admin@morina.com');
    console.log('Senha: Admin@123');

    await prisma.$disconnect();
}

createUser().catch(console.error);
