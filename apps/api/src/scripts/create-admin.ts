import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Carregar variáveis de ambiente da raiz do projeto
const rootEnv = resolve(process.cwd(), ".env");
loadEnv({ path: rootEnv, override: false });

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@morina.ai";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const displayName = process.env.ADMIN_NAME || "Administrador";
  const orgName = process.env.ADMIN_ORG_NAME || "Morina Admin";

  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ Erro: DATABASE_URL não configurada.");
      console.error(
        "   Configure a variável DATABASE_URL no arquivo .env ou como variável de ambiente.",
      );
      console.error("   Exemplo: DATABASE_URL=postgresql://user:password@localhost:5432/morina");
      process.exit(1);
    }

    console.log("🔐 Criando usuário administrador...");

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  Usuário ${email} já existe. Atualizando...`);

      // Atualizar senha e status
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          status: "active",
          displayName,
        },
      });

      // Verificar se já tem organização
      const existingMembership = await prisma.organizationMembership.findFirst({
        where: {
          userId: existingUser.id,
          role: "owner",
        },
        include: { organization: true },
      });

      if (existingMembership) {
        console.log(`✅ Usuário atualizado. Organização: ${existingMembership.organization.name}`);
        return;
      }
    } else {
      // Criar novo usuário
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          displayName,
          passwordHash,
          status: "active",
        },
      });

      console.log(`✅ Usuário criado: ${user.id}`);
    }

    // Buscar ou criar organização
    let organization = await prisma.organization.findFirst({
      where: { name: orgName },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgName.toLowerCase().replace(/\s+/g, "-"),
          description: "Organização administrativa do sistema",
        },
      });
      console.log(`✅ Organização criada: ${organization.id}`);
    }

    // Buscar usuário novamente para garantir que temos o ID correto
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Usuário não encontrado após criação");
    }

    // Criar ou atualizar membership como owner
    const membership = await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
      },
      update: {
        role: "owner",
      },
    });

    console.log(`✅ Membership criado/atualizado: ${membership.id}`);

    console.log("\n🎉 Usuário administrador criado com sucesso!");
    console.log(`📧 Email: ${email}`);
    console.log("🔑 Senha: (oculta)");
    console.log(`🏢 Organização: ${organization.name} (${organization.id})`);
    console.log(`👤 Role: owner`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário administrador:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void createAdmin();
