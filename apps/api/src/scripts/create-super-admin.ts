import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createSuperAdmin() {
    const email = "fabricio@morina.com";
    const password = "67318696Il!@#";
    const displayName = "Fabricio Castro";

    try {
        console.log(`🔐 Criando super administrador ${email}...`);

        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        let user: { id: string };
        const passwordHash = await bcrypt.hash(password, 10);

        if (existingUser) {
            console.log(`⚠️  Usuário ${email} já existe. Atualizando...`);

            // Atualizar usuário existente
            user = await prisma.user.update({
                where: { email },
                data: {
                    passwordHash,
                    status: "active",
                    displayName,
                },
            });
            console.log(`✅ Usuário atualizado: ${user.id}`);
        } else {
            // Criar novo usuário
            user = await prisma.user.create({
                data: {
                    email,
                    displayName,
                    passwordHash,
                    status: "active",
                },
            });
            console.log(`✅ Usuário criado: ${user.id}`);
        }

        // Buscar ou criar organização padrão
        let org = await prisma.organization.findFirst();

        if (!org) {
            console.log("📦 Criando organização padrão...");
            org = await prisma.organization.create({
                data: {
                    id: "org-morina",
                    name: "Morina",
                    slug: "morina",
                },
            });
            console.log(`✅ Organização criada: ${org.name}`);
        }

        // Criar/atualizar membership como OWNER (super admin)
        const membership = await prisma.organizationMembership.upsert({
            where: {
                organizationId_userId: {
                    organizationId: org.id,
                    userId: user.id,
                },
            },
            create: {
                organizationId: org.id,
                userId: user.id,
                role: "owner", // Super Admin
            },
            update: {
                role: "owner", // Garantir que é owner
            },
        });

        console.log(
            `✅ Membership criado/atualizado como OWNER na organização ${org.name}: ${membership.id}`,
        );

        // Buscar ou criar perfil de super admin
        let superAdminRole = await prisma.role.findFirst({
            where: {
                name: "Super Administrador",
                orgId: org.id,
            },
        });

        if (!superAdminRole) {
            console.log("🔑 Criando perfil Super Administrador...");
            superAdminRole = await prisma.role.create({
                data: {
                    name: "Super Administrador",
                    code: "SUPER_ADMIN",
                    description: "Acesso total ao sistema",
                    scope: "GLOBAL",
                    orgId: org.id,
                },
            });
            console.log(`✅ Perfil Super Administrador criado: ${superAdminRole.id}`);
        }

        // Atribuir perfil ao usuário
        const userRole = await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: superAdminRole.id,
                },
            },
            create: {
                userId: user.id,
                roleId: superAdminRole.id,
            },
            update: {},
        });

        console.log(`✅ Perfil atribuído ao usuário.`);

        console.log("\n🎉 Super Administrador criado/atualizado com sucesso!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password}`);
        console.log(`👤 Nome: ${displayName}`);
        console.log(`🆔 User ID: ${user.id}`);
        console.log(`🏢 Organização: ${org.name} (${org.id})`);
        console.log(`👑 Role: ${membership.role.toUpperCase()}`);
        console.log(`🔐 Perfil: ${superAdminRole.name}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n✨ Você pode fazer login agora!");
    } catch (error) {
        console.error("❌ Erro ao criar super administrador:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

void createSuperAdmin();
