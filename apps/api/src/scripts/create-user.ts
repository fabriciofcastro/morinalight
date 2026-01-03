import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";

// Carregar variáveis de ambiente
loadEnv({ path: ".env", override: false });

const prisma = new PrismaClient();

async function createUser() {
  const email = process.env.USER_EMAIL || "fabricio@morina.com.br";
  const password = process.env.USER_PASSWORD || "673186";
  const displayName = process.env.USER_NAME || "Fabricio";
  const orgId = process.env.ORG_ID;

  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ Erro: DATABASE_URL não configurada.");
      console.error(
        "   Configure a variável DATABASE_URL no arquivo .env ou como variável de ambiente.",
      );
      process.exit(1);
    }

    console.log(`🔐 Criando usuário ${email}...`);

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let user: { id: string };
    if (existingUser) {
      console.log(`⚠️  Usuário ${email} já existe. Atualizando senha...`);

      // Atualizar senha e status
      const passwordHash = await bcrypt.hash(password, 10);
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
      const passwordHash = await bcrypt.hash(password, 10);
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

    // Se orgId foi fornecido, criar/atualizar membership
    if (orgId) {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        console.log(`⚠️  Organização ${orgId} não encontrada. Pulando criação de membership.`);
      } else {
        const membership = await prisma.organizationMembership.upsert({
          where: {
            organizationId_userId: {
              organizationId: orgId,
              userId: user.id,
            },
          },
          create: {
            organizationId: orgId,
            userId: user.id,
            role: "member",
          },
          update: {
            role: "member",
          },
        });

        console.log(
          `✅ Membership criado/atualizado na organização ${organization.name}: ${membership.id}`,
        );
      }
    }

    console.log("\n🎉 Usuário criado/atualizado com sucesso!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);
    console.log(`👤 ID: ${user.id}`);
    if (orgId) {
      console.log(`🏢 Organização ID: ${orgId}`);
    }
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void createUser();
