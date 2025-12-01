const bcrypt = require('bcryptjs');

// Test 1: Verify bcrypt is working
console.log('TEST 1: Verificando bcrypt...');
const testHash = bcrypt.hashSync('Admin@123', 10);
const testVerify = bcrypt.compareSync('Admin@123', testHash);
console.log('  Hash gerado:', testHash.substring(0, 30) + '...');
console.log('  Verificação:', testVerify ? '✅ OK' : '❌ FALHOU');

// Test 2: Generate correct hash for Admin@123
console.log('\nTEST 2: Gerando hash correto para Admin@123...');
const correctHash = bcrypt.hashSync('Admin@123', 10);
console.log('  Hash:', correctHash);
console.log('\n  Use este hash no banco de dados!');

// Test 3: Test with Prisma
console.log('\nTEST 3: Testando com Prisma...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findUnique({
    where: { email: 'admin@morina.com' }
})
    .then(user => {
        if (user) {
            console.log('  ✅ Usuário encontrado');
            console.log('  Email:', user.email);
            console.log('  Hash atual:', user.passwordHash.substring(0, 30) + '...');

            // Test password
            const isValid = bcrypt.compareSync('Admin@123', user.passwordHash);
            console.log('  Senha válida:', isValid ? '✅ SIM' : '❌ NÃO');

            if (!isValid) {
                console.log('\n  🔧 Atualizando senha...');
                return prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: correctHash }
                }).then(() => {
                    console.log('  ✅ Senha atualizada!');
                });
            }
        } else {
            console.log('  ❌ Usuário NÃO encontrado');
            console.log('\n  🔧 Criando usuário...');

            // Create org first
            return prisma.organization.upsert({
                where: { id: 'org-demo' },
                update: {},
                create: {
                    id: 'org-demo',
                    name: 'Morina Demo',
                    slug: 'morina-demo',
                },
            }).then(org => {
                console.log('  ✅ Organização OK');

                // Create user
                return prisma.user.create({
                    data: {
                        email: 'admin@morina.com',
                        displayName: 'Administrador',
                        passwordHash: correctHash,
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
            }).then(() => {
                console.log('  ✅ Usuário criado!');
            });
        }
    })
    .then(() => {
        console.log('\n✅ CONCLUÍDO!');
        console.log('\nCredenciais:');
        console.log('  Email: admin@morina.com');
        console.log('  Senha: Admin@123');
    })
    .catch(err => {
        console.error('\n❌ ERRO:', err.message);
        console.error(err);
    })
    .finally(() => {
        prisma.$disconnect();
    });
