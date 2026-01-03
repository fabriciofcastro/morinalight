import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixPassword() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@morina.com' }
    });

    if (!user) {
        console.log('❌ Usuário não encontrado');
        process.exit(1);
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('Status:', user.status);
    console.log('PasswordHash exists:', !!user.passwordHash);

    if (!user.passwordHash) {
        console.log('\n❌ PasswordHash está vazio!');
        console.log('Gerando novo hash...');

        const newHash = await bcrypt.hash('Admin@123', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash }
        });

        console.log('✅ Hash atualizado!');
    } else {
        console.log('\nTestando senha Admin@123...');
        const isValid = await bcrypt.compare('Admin@123', user.passwordHash);

        if (isValid) {
            console.log('✅ SENHA CORRETA!');
            console.log('\n🎉 Login deve funcionar agora!');
        } else {
            console.log('❌ SENHA INCORRETA!');
            console.log('Atualizando hash...');

            const newHash = await bcrypt.hash('Admin@123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash }
            });

            console.log('✅ Hash atualizado!');
        }
    }

    console.log('\n📝 Credenciais:');
    console.log('Email: admin@morina.com');
    console.log('Senha: Admin@123');

    await prisma.$disconnect();
}

fixPassword();
