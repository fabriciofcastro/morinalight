import { z } from "zod";

export const criarPrefichaInputSchema = z.object({
  orgId: z.string().min(1),
  produtoId: z.string().min(1),
  aprovadoresIds: z.array(z.string().min(1)).min(1, "É necessário pelo menos um aprovador"),
});

export const aprovarPrefichaInputSchema = z.object({
  orgId: z.string().min(1),
  prefichaId: z.string().min(1),
  comentario: z.string().optional(),
});

export const rejeitarPrefichaInputSchema = z.object({
  orgId: z.string().min(1),
  prefichaId: z.string().min(1),
  motivo: z.string().min(1, "Motivo da rejeição é obrigatório"),
});

export const listarPrefichasInputSchema = z.object({
  orgId: z.string().min(1),
  status: z.enum(["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]).optional(),
  produtoId: z.string().optional(),
  busca: z.string().min(2).max(120).optional(),
  cursor: z.string().optional(),
  limite: z.number().int().min(1).max(50).optional(),
});

export const obterPrefichaInputSchema = z.object({
  orgId: z.string().min(1),
  prefichaId: z.string().min(1),
});

export const adicionarComentarioInputSchema = z.object({
  orgId: z.string().min(1),
  prefichaId: z.string().min(1),
  comentario: z.string().min(1, "Comentário não pode ser vazio"),
});

export const prefichaViewSchema = z.object({
  prefichaId: z.string(),
  orgId: z.string(),
  produtoId: z.string(),
  status: z.enum(["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]),
  aprovadores: z.array(
    z.object({
      userId: z.string(),
      aprovado: z.boolean(),
      aprovadoEm: z.date().nullable(),
      comentario: z.string().nullable(),
    }),
  ),
  comentarios: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      comentario: z.string(),
      criadoEm: z.date(),
    }),
  ),
  criadoPor: z.string(),
  atualizadoPor: z.string(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});

export type CriarPrefichaInput = z.infer<typeof criarPrefichaInputSchema>;
export type AprovarPrefichaInput = z.infer<typeof aprovarPrefichaInputSchema>;
export type RejeitarPrefichaInput = z.infer<typeof rejeitarPrefichaInputSchema>;
export type ListarPrefichasInput = z.infer<typeof listarPrefichasInputSchema>;
export type ObterPrefichaInput = z.infer<typeof obterPrefichaInputSchema>;
export type AdicionarComentarioInput = z.infer<typeof adicionarComentarioInputSchema>;
export type PrefichaView = z.infer<typeof prefichaViewSchema>;
