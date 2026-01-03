import { config } from "dotenv";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Obter diretório atual (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env da raiz do projeto
const rootEnv = resolve(__dirname, "../../../.env");
config({ path: rootEnv });

// Verificar se DATABASE_URL foi carregada
if (!process.env.DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL não encontrada no .env");
  console.error(`   Tentou carregar de: ${rootEnv}`);
  process.exit(1);
}

console.log("✅ DATABASE_URL carregada");
console.log(`   Database: ${process.env.DATABASE_URL.split("@")[1]?.split("/")[0] || "N/A"}`);

// Executar Prisma Studio
console.log("\n🚀 Iniciando Prisma Studio...");
console.log("   Acesse em: http://localhost:5555\n");

try {
  execSync("pnpm prisma studio --schema prisma/schema.prisma", {
    stdio: "inherit",
    cwd: resolve(__dirname, ".."),
  });
} catch (_error) {
  // Prisma Studio pode ser interrompido com Ctrl+C, isso é normal
  process.exit(0);
}













