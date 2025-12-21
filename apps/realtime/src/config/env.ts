import { config as loadEnv } from "dotenv";
import { z } from "zod";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Carregar .env da raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Caminho relativo: de apps/realtime/src/config/env.ts para raiz do projeto
const rootEnv = resolve(__dirname, "../../../../.env");
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : rootEnv;

// Carregar .env da raiz
const envResult = loadEnv({ path: envFile, override: false });
// Se não encontrou, tentar carregar de process.cwd()
if (!envResult.parsed && process.env.NODE_ENV !== "test") {
  const cwdEnv = resolve(process.cwd(), ".env");
  if (cwdEnv !== envFile) {
    loadEnv({ path: cwdEnv, override: false });
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REALTIME_PORT: z.coerce.number().int().min(0).max(65535).default(3334),
  REALTIME_HOST: z.string().default("0.0.0.0"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  REDIS_PASSWORD: z.string().min(1).optional(),
  REALTIME_SECRET: z.string().min(16).default("dev_realtime_secret_change_me_in_production"),
  REALTIME_STREAM: z.string().default("realtime.catalogo"),
  REALTIME_PENDING_ALERT_THRESHOLD: z.coerce.number().int().min(1).default(100),
  REALTIME_PENDING_ALERT_INTERVAL_MS: z.coerce.number().int().min(1000).default(30000),
});

const parsed = EnvSchema.parse(process.env);

const env = {
  ...parsed,
  REDIS_URL: (() => {
    if (!parsed.REDIS_PASSWORD) return parsed.REDIS_URL;
    try {
      const url = new URL(parsed.REDIS_URL);
      if (url.password) return parsed.REDIS_URL;
      url.password = parsed.REDIS_PASSWORD;
      return url.toString();
    } catch {
      return parsed.REDIS_URL;
    }
  })(),
};

export { env, EnvSchema };
