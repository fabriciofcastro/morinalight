const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔍 Checking for admin user...\n');

        // Check if user exists
        let user = await prisma.User.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (user) {
            console.log('✅ User already exists:', user.email);
            console.log('   Status:', user.status);

            // Update password to ensure it's correct
            console.log('\n🔐 Updating password to Admin@123...');
            const passwordHash = await bcrypt.hash('Admin@123', 10);

            user = await prisma.User.update({
                where: { id: user.id },
                data: {
                    passwordHash: passwordHash,
                    status: 'active'
                }
            });

            console.log('✅ Password updated!');
        } else {
            console.log('❌ User not found. Creating...\n');

            // Create organization first
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

            // Create user with password
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            user = await prisma.User.create({
                data: {
                    email: 'admin@morina.com',
                    displayName: 'Administrador',
                    passwordHash: passwordHash,
                    status: 'active'
                }
            });

            console.log('✅ User created:', user.email);

            // Create membership
            await prisma.OrganizationMembership.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: 'owner'
                }
            });

            console.log('✅ Membership created');
        }

        // Verify password works
        console.log('\n🧪 Testing password...');
        const isValid = await bcrypt.compare('Admin@123', user.passwordHash);

        if (isValid) {
            console.log('✅ Password verification: SUCCESS');
        } else {
            console.log('❌ Password verification: FAILED');
        }

        // Show memberships
        const memberships = await prisma.OrganizationMembership.findMany({
            where: { userId: user.id },
            include: { organization: true }
        });

        console.log('\n📋 Organizations:');
        memberships.forEach(m => {
            console.log(`   - ${m.organization.name} (${m.role})`);
        });

        console.log('\n✅ Done! You can now login with:');
        console.log('   Email: admin@morina.com');
        console.log('   Password: Admin@123');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code) {
            console.error('   Code:', error.code);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
