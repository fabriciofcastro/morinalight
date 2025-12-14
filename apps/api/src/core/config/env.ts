import { config as loadEnv } from "dotenv";
import { z } from "zod";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Carregar .env da raiz do projeto
// Tentar múltiplos caminhos para garantir que encontre o .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Possíveis caminhos para o .env
const possiblePaths = [
  // Caminho relativo do arquivo atual
  resolve(__dirname, "../../../../../.env"),
  // Caminho do process.cwd() (raiz quando executado)
  resolve(process.cwd(), ".env"),
  // Caminho alternativo
  resolve(process.cwd(), "../.env"),
];

const _envFile = process.env.NODE_ENV === "test" ? ".env.test" : possiblePaths[0];

// Tentar carregar de cada caminho possível
let envLoaded = false;
for (const envPath of possiblePaths) {
  const result = loadEnv({ path: envPath, override: false });
  if (result.parsed) {
    envLoaded = true;
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ [ENV] Arquivo .env carregado de: ${envPath}`);
    }
    break;
  }
}

if (!envLoaded && process.env.NODE_ENV !== "test") {
  console.warn(`⚠️  [ENV] Arquivo .env não encontrado nos caminhos:`, possiblePaths);
  console.warn("   Tentando usar variáveis de ambiente do sistema...");
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(0).max(65535).default(3333),
  API_HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().url().optional(),
  DATABASE_REPLICA_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  REDIS_REPLICA_URL: z.string().url().optional(),
  REALTIME_SECRET: z.string().min(16).optional(),
  JWT_SECRET: z.string().min(32).default("test-jwt-secret-test-jwt-secret-12345"),
  // Configuração do e-millennium
  EMILLENNIUM_BASE_URL: z.string().url().optional(),
  EMILLENNIUM_USERNAME: z.string().optional(),
  EMILLENNIUM_PASSWORD: z.string().optional(),
  EMILLENNIUM_TENANT_ID: z.string().optional(),
  EMILLENNIUM_VITRINE_ID: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
});

type Env = z.infer<typeof EnvSchema>;

const parsed: Env = EnvSchema.parse(process.env);

const env: Env = {
  ...parsed,
  REALTIME_SECRET:
    parsed.REALTIME_SECRET ??
    (parsed.NODE_ENV !== "production" ? "dev_realtime_secret" : undefined),
};

export { env, EnvSchema };
export type { Env };
