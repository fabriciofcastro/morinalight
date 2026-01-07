import { z } from "zod";

export const produtoBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  nome: z.string().min(3).max(180),
  descricao: z.string().max(1024).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
});

export const criarProdutoInputSchema = produtoBaseSchema.pick({
  orgId: true,
  nome: true,
  descricao: true,
  sku: true,
  categoryId: true,
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

export const varianteAtributosSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export const criarVarianteInputSchema = z.object({
  orgId: z.string().min(1),
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  nome: z.string().min(1).max(180),
  atributos: varianteAtributosSchema,
  preco: z.number().nonnegative().optional().nullable(),
  estoque: z.number().int().nonnegative().optional().nullable(),
  ativo: z.boolean().optional(),
});

export type CriarVarianteInput = z.infer<typeof criarVarianteInputSchema>;

export const varianteViewSchema = criarVarianteInputSchema.extend({
  varianteId: z.string().uuid(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VarianteView = z.infer<typeof varianteViewSchema>;

export const atualizarVarianteInputSchema = z.object({
  orgId: z.string().min(1),
  varianteId: z.string().uuid(),
  nome: z.string().min(1).max(180).optional(),
  atributos: varianteAtributosSchema.optional(),
  preco: z.number().nonnegative().optional().nullable(),
  estoque: z.number().int().nonnegative().optional().nullable(),
  ativo: z.boolean().optional(),
});

export type AtualizarVarianteInput = z.infer<typeof atualizarVarianteInputSchema>;

export const criarCategoriaInputSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(180),
  slug: z.string().min(1).max(180),
  description: z.string().max(512).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  ordem: z.number().int().nonnegative().optional(),
  ativo: z.boolean().optional(),
});

export type CriarCategoriaInput = z.infer<typeof criarCategoriaInputSchema>;

export const categoriaViewSchema = criarCategoriaInputSchema.extend({
  categoriaId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CategoriaView = z.infer<typeof categoriaViewSchema>;

export const atualizarCategoriaInputSchema = z.object({
  orgId: z.string().min(1),
  categoriaId: z.string().uuid(),
  name: z.string().min(1).max(180).optional(),
  description: z.string().max(512).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  ordem: z.number().int().nonnegative().optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarCategoriaInput = z.infer<typeof atualizarCategoriaInputSchema>;

export const atualizarProdutoInputSchema = z.object({
  orgId: z.string().min(1),
  produtoId: z.string().uuid(),
  nome: z.string().min(3).max(180).optional(),
  descricao: z.string().max(1024).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
});

export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoInputSchema>;

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

export const obterProdutoInputSchema = z.object({
  orgId: z.string().min(1),
  produtoId: z.string().uuid(),
});

export type ObterProdutoInput = z.infer<typeof obterProdutoInputSchema>;

export const listarProdutosInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: produtoViewSchema.shape.status.optional(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarProdutosInput = z.infer<typeof listarProdutosInputSchema>;

export const listarProdutosResultadoSchema = z.object({
  itens: z.array(produtoViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarProdutosResultado = z.infer<typeof listarProdutosResultadoSchema>;
