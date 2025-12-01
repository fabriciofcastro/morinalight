const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPassword() {
    try {
        console.log('Generating password hash for Admin@123...');
        const hash = await bcrypt.hash('Admin@123', 10);
        console.log('Hash generated:', hash.substring(0, 30) + '...');

        console.log('\nUpdating user password...');
        const user = await prisma.User.update({
            where: { email: 'admin@morina.com' },
            data: { passwordHash: hash }
        });

        console.log('✅ Password updated for:', user.email);

        console.log('\nTesting password...');
        const isValid = await bcrypt.compare('Admin@123', hash);
        console.log('Password test:', isValid ? '✅ VALID' : '❌ INVALID');

        if (isValid) {
            console.log('\n🎉 SUCCESS! You can now login with:');
            console.log('   Email: admin@morina.com');
            console.log('   Password: Admin@123');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixPassword();
