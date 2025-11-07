import { z } from "zod";

export const produtoBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  nome: z.string().min(3).max(180),
  descricao: z.string().max(1024).optional().nullable(),
});

export const criarProdutoInputSchema = produtoBaseSchema.pick({
  orgId: true,
  nome: true,
  descricao: true,
});

export type CriarProdutoInput = z.infer<typeof criarProdutoInputSchema>;

export const produtoViewSchema = produtoBaseSchema.extend({
  produtoId: z.string().uuid(),
  status: z.enum(["rascunho", "aguardando_aprovacao", "ativo", "inativo"]),
  criadoPor: z.string().min(1),
  atualizadoPor: z.string().min(1),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});

export type ProdutoView = z.infer<typeof produtoViewSchema>;

export const aprovarProdutoInputSchema = z.object({
  orgId: z.string().min(1),
  produtoId: z.string().uuid(),
  motivo: z.string().max(512).optional(),
});

export type AprovarProdutoInput = z.infer<typeof aprovarProdutoInputSchema>;

export const reprovarProdutoInputSchema = z.object({
  orgId: z.string().min(1),
  produtoId: z.string().uuid(),
  motivo: z.string().min(3).max(512),
});

export type ReprovarProdutoInput = z.infer<typeof reprovarProdutoInputSchema>;
