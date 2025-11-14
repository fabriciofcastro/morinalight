import { getPrisma } from "../src/infra/database/prisma.service";

const prisma = getPrisma();

async function listUsers() {
  try {
    console.log("Buscando usuários...\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (users.length === 0) {
      console.log("Nenhum usuário encontrado.");
      return;
    }

    console.log(`Total de usuários: ${users.length}\n`);
    console.log("Usuários encontrados:");
    console.log("─".repeat(80));

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.displayName || "N/A"}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Criado em: ${user.createdAt.toISOString()}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
