import { z } from "zod";

/**
 * Configuração de variáveis de ambiente do frontend
 * Validação com Zod para garantir tipos corretos
 */
const FrontendEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3333"),
  NEXT_PUBLIC_REALTIME_URL: z.string().url().default("ws://localhost:3334"),
  NEXT_PUBLIC_ORG_ID: z.string().optional(),
  NEXT_PUBLIC_ACTOR_ID: z.string().optional(),
});

type FrontendEnv = z.infer<typeof FrontendEnvSchema>;

const parsed = FrontendEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL,
  NEXT_PUBLIC_ORG_ID: process.env.NEXT_PUBLIC_ORG_ID,
  NEXT_PUBLIC_ACTOR_ID: process.env.NEXT_PUBLIC_ACTOR_ID,
});

export const env: FrontendEnv = {
  ...parsed,
  NEXT_PUBLIC_ORG_ID: parsed.NEXT_PUBLIC_ORG_ID ?? "org-demo",
  NEXT_PUBLIC_ACTOR_ID: parsed.NEXT_PUBLIC_ACTOR_ID ?? "user-demo",
};

// Exports individuais para compatibilidade
export const apiUrl = env.NEXT_PUBLIC_API_URL;
export const realtimeUrl = env.NEXT_PUBLIC_REALTIME_URL;
export const defaultOrgId = env.NEXT_PUBLIC_ORG_ID;
export const defaultActorId = env.NEXT_PUBLIC_ACTOR_ID;

export type { FrontendEnv };
