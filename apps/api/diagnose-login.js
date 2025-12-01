const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnose() {
    try {
        console.log('🔍 Checking for admin user...\n');

        const user = await prisma.User.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (!user) {
            console.log('❌ User not found!');
            console.log('\n💡 Creating admin user...\n');

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

            // Create user
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            const newUser = await prisma.User.create({
                data: {
                    email: 'admin@morina.com',
                    displayName: 'Administrador',
                    passwordHash: passwordHash,
                    status: 'active'
                }
            });

            console.log('✅ User created:', newUser.email);

            // Create membership
            await prisma.OrganizationMembership.create({
                data: {
                    userId: newUser.id,
                    organizationId: org.id,
                    role: 'owner'
                }
            });

            console.log('✅ Membership created\n');

        } else {
            console.log('✅ User found!');
            console.log('   Email:', user.email);
            console.log('   Name:', user.displayName);
            console.log('   Status:', user.status);
            console.log('   ID:', user.id);
            console.log('\n🔐 Testing password...\n');

            const testPassword = 'Admin@123';
            const isValid = await bcrypt.compare(testPassword, user.passwordHash);

            if (isValid) {
                console.log('✅ Password "Admin@123" is VALID');
            } else {
                console.log('❌ Password "Admin@123" is INVALID');
                console.log('\n💡 Updating password...\n');

                const newHash = await bcrypt.hash('Admin@123', 10);
                await prisma.User.update({
                    where: { id: user.id },
                    data: { passwordHash: newHash }
                });

                console.log('✅ Password updated!');
            }

            // Check memberships
            const memberships = await prisma.OrganizationMembership.findMany({
                where: { userId: user.id },
                include: { organization: true }
            });

            console.log('\n📋 Organizations:');
            memberships.forEach(m => {
                console.log(`   - ${m.organization.name} (${m.role})`);
            });
        }

        console.log('\n✅ Diagnosis complete!');
        console.log('\n🧪 Now testing login endpoint...\n');

        // Test login endpoint
        const response = await fetch('http://localhost:3333/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@morina.com',
                password: 'Admin@123'
            })
        });

        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
