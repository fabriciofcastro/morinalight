import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Carregar variáveis de ambiente da raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnv = resolve(__dirname, "../../../../.env");
loadEnv({ path: rootEnv, override: false });

// Verificar se DATABASE_URL foi carregada
if (!process.env.DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL não encontrada no .env");
  console.error(`   Tentou carregar de: ${rootEnv}`);
  console.error("   Verifique se o arquivo .env existe na raiz do projeto");
  process.exit(1);
}

const prisma = new PrismaClient();

async function diagnoseLogin(email: string, password: string) {
  try {
    console.log("🔍 Diagnosticando problema de login...\n");

    // 1. Verificar se o usuário existe (case-insensitive)
    console.log(`1️⃣ Buscando usuário: ${email}`);
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado!");
      console.log("\n💡 Soluções:");
      console.log("   1. Verifique se o email está correto");
      console.log("   2. Execute: pnpm -C apps/api tsx src/scripts/create-admin.ts");
      console.log("   3. Ou use: ADMIN_EMAIL=seu@email.com ADMIN_PASSWORD=suaSenha pnpm -C apps/api tsx src/scripts/create-admin.ts");
      return;
    }

    console.log("✅ Usuário encontrado!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email no banco: ${user.email}`);
    console.log(`   Nome: ${user.displayName ?? "N/A"}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Hash preview: ${user.passwordHash.substring(0, 30)}...`);
    console.log(`   Organizações: ${user.memberships.length}`);

    // 2. Verificar status
    if (user.status !== "active") {
      console.log("\n⚠️  PROBLEMA ENCONTRADO: Usuário está inativo!");
      console.log(`   Status atual: ${user.status}`);
      console.log("\n💡 Corrigindo status para 'active'...");
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "active" },
      });
      console.log("✅ Status atualizado para 'active'");
    }

    // 3. Verificar senha
    console.log("\n2️⃣ Testando senha...");
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      console.log("❌ Senha incorreta!");
      console.log("\n💡 Gerando novo hash e atualizando senha...");
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          status: "active",
        },
      });
      console.log("✅ Senha atualizada!");

      // Verificar novamente
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (updatedUser) {
        const verifyNew = await bcrypt.compare(password, updatedUser.passwordHash);
        if (verifyNew) {
          console.log("✅ Verificação: Senha corrigida com sucesso!");
        } else {
          console.log("❌ Erro: Senha ainda não está correta após atualização");
        }
      }
    } else {
      console.log("✅ Senha está correta!");
    }

    // 4. Verificar organizações
    if (user.memberships.length === 0) {
      console.log("\n⚠️  AVISO: Usuário não está associado a nenhuma organização");
      console.log("💡 Isso pode causar problemas no login");
    } else {
      console.log("\n✅ Organizações associadas:");
      for (const membership of user.memberships) {
        console.log(`   - ${membership.organization.name} (${membership.role})`);
      }
    }

    // 5. Resumo final
    console.log("\n📋 Resumo:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Senha: ${isValid ? "✅ Correta" : "❌ Foi corrigida"}`);
    console.log(`   Organizações: ${user.memberships.length}`);

    console.log("\n🎉 Diagnóstico concluído!");
    console.log("\n💡 Tente fazer login novamente agora.");
  } catch (error) {
    console.error("\n❌ Erro durante diagnóstico:", error);
    if (error instanceof Error) {
      console.error("   Mensagem:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Obter email e senha dos argumentos ou variáveis de ambiente
const email = process.argv[2] || process.env.ADMIN_EMAIL || "fabricio@morina.com.br";
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "67318696Il!@#";

console.log("📧 Email:", email);
console.log("🔑 Senha:", "*".repeat(password.length));
console.log("");

void diagnoseLogin(email, password);


