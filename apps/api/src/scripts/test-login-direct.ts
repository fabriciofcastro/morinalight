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

const prisma = new PrismaClient();

async function testLogin() {
  const email = "fabricio@morina.com.br";
  const password = "67318696Il!@#";

  try {
    console.log("🔍 Testando login diretamente...\n");

    // 1. Buscar usuário exatamente como a rota faz
    console.log(`1️⃣ Buscando usuário: ${email}`);
    const emailLower = email.toLowerCase();
    console.log(`   Email normalizado: ${emailLower}`);

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado!");
      return;
    }

    console.log("✅ Usuário encontrado!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email no banco: ${user.email}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Hash: ${user.passwordHash.substring(0, 30)}...`);

    // 2. Testar senha exatamente como a rota faz
    console.log("\n2️⃣ Testando senha...");
    console.log(`   Senha fornecida: ${password}`);
    console.log(`   Tamanho da senha: ${password.length} caracteres`);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`   Resultado: ${isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`);

    if (!isValid) {
      console.log("\n⚠️  Testando variações da senha...");
      
      // Testar com espaços
      const withSpaces = ` ${password} `;
      const test1 = await bcrypt.compare(withSpaces, user.passwordHash);
      console.log(`   Com espaços: ${test1 ? "✅" : "❌"}`);

      // Testar sem espaços
      const noSpaces = password.trim();
      const test2 = await bcrypt.compare(noSpaces, user.passwordHash);
      console.log(`   Sem espaços: ${test2 ? "✅" : "❌"}`);

      // Testar diferentes encodings
      const utf8 = Buffer.from(password, "utf-8").toString("utf-8");
      const test3 = await bcrypt.compare(utf8, user.passwordHash);
      console.log(`   UTF-8: ${test3 ? "✅" : "❌"}`);

      console.log("\n💡 A senha não corresponde. Vamos atualizar...");
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      console.log("✅ Senha atualizada!");

      // Verificar novamente
      const verify = await bcrypt.compare(password, newHash);
      console.log(`   Verificação: ${verify ? "✅ CORRETA" : "❌ AINDA ERRADA"}`);
    } else {
      console.log("\n✅ Tudo correto! O problema pode estar em outro lugar.");
      console.log("\n💡 Possíveis causas:");
      console.log("   1. Problema com o auditRepository");
      console.log("   2. Problema com o organizationRepository");
      console.log("   3. Erro silencioso na rota");
      console.log("   4. Problema com o JWT_SECRET");
    }

    // 3. Verificar organizações
    console.log("\n3️⃣ Verificando organizações...");
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: user.id },
      include: { organization: true },
    });
    console.log(`   Organizações: ${memberships.length}`);
    for (const m of memberships) {
      console.log(`   - ${m.organization.name} (${m.role})`);
    }
  } catch (error) {
    console.error("\n❌ Erro:", error);
    if (error instanceof Error) {
      console.error("   Mensagem:", error.message);
      console.error("   Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void testLogin();













