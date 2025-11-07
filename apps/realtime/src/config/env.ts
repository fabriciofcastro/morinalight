import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
loadEnv({ path: envFile, override: false });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REALTIME_PORT: z.coerce.number().int().min(0).max(65535).default(3334),
  REALTIME_HOST: z.string().default("0.0.0.0"),
  REDIS_URL: z.string().url(),
  REALTIME_SECRET: z.string().min(16),
  REALTIME_STREAM: z.string().default("realtime.catalogo"),
});

const env = EnvSchema.parse(process.env);

export { env, EnvSchema };
