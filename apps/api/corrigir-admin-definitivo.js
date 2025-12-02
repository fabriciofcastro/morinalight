#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function corrigirAdmin() {
    console.log('🔧 CORREÇÃO DEFINITIVA DO ADMIN\n');
    console.log('='.repeat(60));

    try {
        // 1. Verificar se usuário existe
        console.log('\n1️⃣ Verificando usuário...');
        let user = await prisma.user.findUnique({
            where: { email: 'admin@morina.com' }
        });

        if (!user) {
            console.log('   ❌ Usuário não encontrado');
            console.log('\n2️⃣ Criando usuário admin...');

            // Criar organização se não existir
            const org = await prisma.organization.upsert({
                where: { id: 'org-demo' },
                update: {},
                create: {
                    id: 'org-demo',
                    name: 'Morina Demo',
                    slug: 'morina-demo',
                }
            });
            console.log('   ✅ Organização:', org.name);

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
                        }
                    }
                }
            });
            console.log('   ✅ Usuário criado!');
        } else {
            console.log('   ✅ Usuário encontrado');

            // 2. Atualizar senha
            console.log('\n2️⃣ Atualizando senha...');
            const passwordHash = await bcrypt.hash('Admin@123', 10);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: passwordHash,
                    status: 'active'
                }
            });
            console.log('   ✅ Senha atualizada!');
        }

        // 3. Verificar organizações
        console.log('\n3️⃣ Verificando organizações...');
        const memberships = await prisma.organizationMembership.findMany({
            where: { userId: user.id },
            include: { organization: true }
        });

        if (memberships.length === 0) {
            console.log('   ⚠️ Usuário sem organizações');
            console.log('   Criando membership...');

            const org = await prisma.organization.upsert({
                where: { id: 'org-demo' },
                update: {},
                create: {
                    id: 'org-demo',
                    name: 'Morina Demo',
                    slug: 'morina-demo',
                }
            });

            await prisma.organizationMembership.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: 'owner'
                }
            });
            console.log('   ✅ Membership criado!');
        } else {
            console.log(`   ✅ ${memberships.length} organização(ões) encontrada(s)`);
            memberships.forEach(m => {
                console.log(`      - ${m.organization.name} (${m.role})`);
            });
        }

        // 4. Testar senha
        console.log('\n4️⃣ Testando senha...');
        const isValid = await bcrypt.compare('Admin@123', user.passwordHash);
        console.log('   Resultado:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');

        if (!isValid) {
            throw new Error('Senha inválida após atualização!');
        }

        // 5. Mostrar informações finais
        console.log('\n' + '='.repeat(60));
        console.log('\n🎉 SUCESSO! ADMIN CONFIGURADO CORRETAMENTE\n');
        console.log('📋 Informações do usuário:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Nome:', user.displayName);
        console.log('   Status:', user.status);
        console.log('   Organizações:', memberships.length);

        console.log('\n🔑 CREDENCIAIS DE LOGIN:');
        console.log('   Email: admin@morina.com');
        console.log('   Senha: Admin@123');

        console.log('\n💡 TESTE AGORA:');
        console.log('   1. Acesse: http://localhost:3000/login');
        console.log('   2. Use as credenciais acima');
        console.log('   3. Aceite os termos');
        console.log('   4. Clique em "INICIAR SISTEMA"');

        console.log('\n' + '='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
        console.error('\nStack:', error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

corrigirAdmin();
