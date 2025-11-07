import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
loadEnv({ path: envFile, override: false });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(0).max(65535).default(3333),
  API_HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  REALTIME_SECRET: z.string().min(16).optional(),
});

type Env = z.infer<typeof EnvSchema>;

const env: Env = EnvSchema.parse(process.env);

export { env, EnvSchema };
export type { Env };
