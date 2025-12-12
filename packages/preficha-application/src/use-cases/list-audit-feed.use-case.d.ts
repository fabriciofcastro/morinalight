import type { PrefichaAuditoriaRepository, PrefichaRepository } from "@morina/preficha-domain";
import { z } from "zod";
declare const listarAuditoriaFeedInputSchema: z.ZodObject<
  {
    orgId: z.ZodString;
    acao: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limite: z.ZodOptional<z.ZodNumber>;
    inicio: z.ZodOptional<z.ZodDate>;
    fim: z.ZodOptional<z.ZodDate>;
  },
  "strip",
  z.ZodTypeAny,
  {
    orgId: string;
    cursor?: string | undefined;
    limite?: number | undefined;
    acao?: string | undefined;
    inicio?: Date | undefined;
    fim?: Date | undefined;
  },
  {
    orgId: string;
    cursor?: string | undefined;
    limite?: number | undefined;
    acao?: string | undefined;
    inicio?: Date | undefined;
    fim?: Date | undefined;
  }
>;
type Dependencies = {
  prefichaAuditoriaRepository: PrefichaAuditoriaRepository;
  prefichaRepository: PrefichaRepository;
};
export declare class ListarPrefichaAuditoriaFeedUseCase {
  private readonly deps;
  constructor(deps: Dependencies);
  execute(rawInput: unknown): Promise<{
    itens: {
      id: string;
      acao: string;
      criadoEm: Date;
      actorId: string;
      payload: Record<string, unknown> | null | undefined;
      preficha: {
        prefichaId: string;
        produtoId: string;
        status: import("@morina/preficha-domain").PrefichaStatus;
      } | null;
    }[];
    proximoCursor: string | null;
  }>;
}
export { listarAuditoriaFeedInputSchema };
