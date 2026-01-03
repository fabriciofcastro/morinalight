import bcrypt from "bcryptjs";
import { getPrisma } from "../src/infra/database/prisma.service";

const prisma = getPrisma();

async function updateUserPassword(email: string, newPassword: string) {
  try {
    console.log(`Buscando usuário com email: ${email}`);

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`Usuário com email ${email} não encontrado.`);
      process.exit(1);
    }

    console.log(`Usuário encontrado: ${user.id} - ${user.email} - ${user.displayName}`);

    // Hash da nova senha
    console.log("Gerando hash da nova senha...");
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha no banco
    console.log("Atualizando senha no banco de dados...");
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log("✅ Senha atualizada com sucesso!");
    console.log(`   Email: ${user.email}`);
    console.log("   Nova senha: ******** (oculta)");
  } catch (error) {
    console.error("❌ Erro ao atualizar senha:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Obter argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Uso: tsx scripts/update-user-password.ts <email> <nova-senha>");
  console.error("Exemplo: tsx scripts/update-user-password.ts usuario@example.com 67318696");
  process.exit(1);
}

const [email, newPassword] = args;

if (newPassword.length < 8) {
  console.error("❌ A senha deve ter pelo menos 8 caracteres.");
  process.exit(1);
}

updateUserPassword(email, newPassword);
