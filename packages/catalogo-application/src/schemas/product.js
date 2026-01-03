"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarProdutosResultadoSchema = exports.listarProdutosInputSchema = exports.obterProdutoInputSchema = exports.reprovarProdutoInputSchema = exports.aprovarProdutoInputSchema = exports.atualizarProdutoInputSchema = exports.atualizarCategoriaInputSchema = exports.categoriaViewSchema = exports.criarCategoriaInputSchema = exports.atualizarVarianteInputSchema = exports.varianteViewSchema = exports.criarVarianteInputSchema = exports.varianteAtributosSchema = exports.produtoViewSchema = exports.criarProdutoInputSchema = exports.produtoBaseSchema = void 0;
const zod_1 = require("zod");
exports.produtoBaseSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1, "orgId obrigatório"),
    nome: zod_1.z.string().min(3).max(180),
    descricao: zod_1.z.string().max(1024).optional().nullable(),
    sku: zod_1.z.string().max(100).optional().nullable(),
    categoryId: zod_1.z.string().uuid().optional().nullable(),
});
exports.criarProdutoInputSchema = exports.produtoBaseSchema.pick({
    orgId: true,
    nome: true,
    descricao: true,
    sku: true,
    categoryId: true,
});
exports.produtoViewSchema = exports.produtoBaseSchema.extend({
    produtoId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(["rascunho", "aguardando_aprovacao", "ativo", "inativo"]),
    criadoPor: zod_1.z.string().min(1),
    atualizadoPor: zod_1.z.string().min(1),
    criadoEm: zod_1.z.date(),
    atualizadoEm: zod_1.z.date(),
});
exports.varianteAtributosSchema = zod_1.z.record(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]));
exports.criarVarianteInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    productId: zod_1.z.string().uuid(),
    sku: zod_1.z.string().min(1).max(100),
    nome: zod_1.z.string().min(1).max(180),
    atributos: exports.varianteAtributosSchema,
    preco: zod_1.z.number().nonnegative().optional().nullable(),
    estoque: zod_1.z.number().int().nonnegative().optional().nullable(),
    ativo: zod_1.z.boolean().optional(),
});
exports.varianteViewSchema = exports.criarVarianteInputSchema.extend({
    varianteId: zod_1.z.string().uuid(),
    createdBy: zod_1.z.string().min(1),
    updatedBy: zod_1.z.string().min(1),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.atualizarVarianteInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    varianteId: zod_1.z.string().uuid(),
    nome: zod_1.z.string().min(1).max(180).optional(),
    atributos: exports.varianteAtributosSchema.optional(),
    preco: zod_1.z.number().nonnegative().optional().nullable(),
    estoque: zod_1.z.number().int().nonnegative().optional().nullable(),
    ativo: zod_1.z.boolean().optional(),
});
exports.criarCategoriaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(180),
    slug: zod_1.z.string().min(1).max(180),
    description: zod_1.z.string().max(512).optional().nullable(),
    parentId: zod_1.z.string().uuid().optional().nullable(),
    ordem: zod_1.z.number().int().nonnegative().optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.categoriaViewSchema = exports.criarCategoriaInputSchema.extend({
    categoriaId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.atualizarCategoriaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    categoriaId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(180).optional(),
    description: zod_1.z.string().max(512).optional().nullable(),
    parentId: zod_1.z.string().uuid().optional().nullable(),
    ordem: zod_1.z.number().int().nonnegative().optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.atualizarProdutoInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    produtoId: zod_1.z.string().uuid(),
    nome: zod_1.z.string().min(3).max(180).optional(),
    descricao: zod_1.z.string().max(1024).optional().nullable(),
    sku: zod_1.z.string().max(100).optional().nullable(),
    categoryId: zod_1.z.string().uuid().optional().nullable(),
});
exports.aprovarProdutoInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    produtoId: zod_1.z.string().uuid(),
    motivo: zod_1.z.string().max(512).optional(),
});
exports.reprovarProdutoInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    produtoId: zod_1.z.string().uuid(),
    motivo: zod_1.z.string().min(3).max(512),
});
exports.obterProdutoInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    produtoId: zod_1.z.string().uuid(),
});
exports.listarProdutosInputSchema = zod_1.z
    .object({
    orgId: zod_1.z.string().min(1),
    status: exports.produtoViewSchema.shape.status.optional(),
    busca: zod_1.z.string().min(2).max(120).optional(),
    cursor: zod_1.z.string().optional(),
    limite: zod_1.z.number().int().min(1).max(50).optional(),
})
    .strict();
exports.listarProdutosResultadoSchema = zod_1.z.object({
    itens: zod_1.z.array(exports.produtoViewSchema),
    proximoCursor: zod_1.z.string().nullable().optional(),
});
