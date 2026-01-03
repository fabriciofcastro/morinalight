#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnoseAndFix() {
    console.log('🔍 DIAGNÓSTICO E CORREÇÃO DO LOGIN\n');
    console.log('='.repeat(50));

    try {
        // 1. Testar conexão com banco
        console.log('\n1️⃣ Testando conexão com banco de dados...');
        await prisma.$connect();
        console.log('   ✅ Conectado ao banco de dados');

        // 2. Verificar se usuário existe
        console.log('\n2️⃣ Procurando usuário admin@morina.com...');
        let user = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' },
            include: {
                memberships: {
                    include: {
                        organization: true
                    }
                }
            }
        });

        if (!user) {
            console.log('   ❌ Usuário NÃO encontrado');
            console.log('\n🔧 Criando usuário admin...');

            // Criar organização
            const org = await prisma.organization.upsert({
                where: { id: 'org-demo' },
                update: {},
                create: {
                    id: 'org-demo',
                    name: 'Morina Demo',
                    slug: 'morina-demo',
                },
            });
            console.log('   ✅ Organização criada/atualizada');

            // Criar usuário
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            user = await prisma.user.create({
                data: {
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
                include: {
                    memberships: {
                        include: {
                            organization: true
                        }
                    }
                }
            });
            console.log('   ✅ Usuário criado com sucesso!');
        } else {
            console.log('   ✅ Usuário encontrado');
        }

        // 3. Mostrar informações do usuário
        console.log('\n3️⃣ Informações do usuário:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.displayName);
        console.log('   Status:', user.status);
        console.log('   Organizações:', user.memberships.length);
        console.log('   Hash da senha:', user.passwordHash.substring(0, 30) + '...');

        // 4. Testar senha
        console.log('\n4️⃣ Testando senha "Admin@123"...');
        const isValid = await bcrypt.compare('Admin@123', user.passwordHash);

        if (isValid) {
            console.log('   ✅ SENHA CORRETA!');
        } else {
            console.log('   ❌ SENHA INCORRETA!');
            console.log('\n🔧 Atualizando senha...');

            const newPasswordHash = await bcrypt.hash('Admin@123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newPasswordHash }
            });

            console.log('   ✅ Senha atualizada!');
        }

        // 5. Resultado final
        console.log('\n' + '='.repeat(50));
        console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO!\n');
        console.log('📝 Credenciais de login:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');
        console.log('\n💡 Tente fazer login no navegador agora!');
        console.log('   URL: http://localhost:3000/login\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        console.error('\nDetalhes:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseAndFix();
