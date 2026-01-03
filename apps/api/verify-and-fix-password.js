const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyAndFix() {
    try {
        console.log('1. Fetching user from database...');
        const user = await prisma.User.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('✅ User found:', user.email);
        console.log('   Hash preview:', user.passwordHash?.substring(0, 30) + '...');

        console.log('\n2. Testing current password...');
        const testPassword = 'Admin@123';
        const isValid = await bcrypt.compare(testPassword, user.passwordHash || '');
        console.log('   Password test:', isValid ? '✅ VALID' : '❌ INVALID');

        if (!isValid) {
            console.log('\n3. Generating new hash...');
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('   New hash:', newHash.substring(0, 30) + '...');

            console.log('\n4. Updating database...');
            await prisma.User.update({
                where: { id: user.id },
                data: { passwordHash: newHash }
            });
            console.log('   ✅ Database updated');

            console.log('\n5. Verifying new hash...');
            const verifyNew = await bcrypt.compare(testPassword, newHash);
            console.log('   Verification:', verifyNew ? '✅ PASS' : '❌ FAIL');

            if (verifyNew) {
                console.log('\n🎉 SUCCESS! Password fixed!');
                console.log('   Email: admin@morina.com');
                console.log('   Password: Admin@123');
            }
        } else {
            console.log('\n✅ Password is already correct!');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAndFix();
