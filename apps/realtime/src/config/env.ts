import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
loadEnv({ path: envFile, override: false });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REALTIME_PORT: z.coerce.number().int().min(0).max(65535).default(3334),
  REALTIME_HOST: z.string().default("0.0.0.0"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  REALTIME_SECRET: z.string().min(16).default("dev_realtime_secret"),
  REALTIME_STREAM: z.string().default("realtime.catalogo"),
  REALTIME_PENDING_ALERT_THRESHOLD: z.coerce.number().int().min(1).default(100),
  REALTIME_PENDING_ALERT_INTERVAL_MS: z.coerce.number().int().min(1000).default(30000),
});

const env = EnvSchema.parse(process.env);

export { env, EnvSchema };
