const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔐 Generating password hash...');
    const hash = bcrypt.hashSync('Admin@123', 10);
    console.log('Hash:', hash);

    console.log('\n📝 Creating organization...');
    const org = await prisma.Organization.upsert({
        where: { id: 'org-demo' },
        update: {},
        create: {
            id: 'org-demo',
            name: 'Morina Demo',
            slug: 'morina-demo'
        }
    });
    console.log('✅ Organization:', org.name);

    console.log('\n👤 Creating/updating admin user...');
    const user = await prisma.User.upsert({
        where: { email: 'admin@morina.com' },
        update: {
            passwordHash: hash,
            status: 'active'
        },
        create: {
            email: 'admin@morina.com',
            displayName: 'Administrador',
            passwordHash: hash,
            status: 'active'
        }
    });
    console.log('✅ User:', user.email, '- Status:', user.status);

    console.log('\n🏢 Creating membership...');
    await prisma.OrganizationMembership.upsert({
        where: {
            organizationId_userId: {
                organizationId: org.id,
                userId: user.id
            }
        },
        update: {
            role: 'owner'
        },
        create: {
            userId: user.id,
            organizationId: org.id,
            role: 'owner'
        }
    });
    console.log('✅ Membership created');

    console.log('\n✅ SUCCESS! Login credentials:');
    console.log('   Email: admin@morina.com');
    console.log('   Password: Admin@123');
}

main()
    .catch(e => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
