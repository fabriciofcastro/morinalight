import { z } from "zod";
export declare const produtoBaseSchema: z.ZodObject<{
    orgId: z.ZodString;
    nome: z.ZodString;
    descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    nome: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}, {
    orgId: string;
    nome: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}>;
export declare const criarProdutoInputSchema: z.ZodObject<Pick<{
    orgId: z.ZodString;
    nome: z.ZodString;
    descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "orgId" | "sku" | "categoryId" | "nome" | "descricao">, "strip", z.ZodTypeAny, {
    orgId: string;
    nome: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}, {
    orgId: string;
    nome: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}>;
export type CriarProdutoInput = z.infer<typeof criarProdutoInputSchema>;
export declare const produtoViewSchema: z.ZodObject<{
    orgId: z.ZodString;
    nome: z.ZodString;
    descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
} & {
    produtoId: z.ZodString;
    status: z.ZodEnum<["rascunho", "aguardando_aprovacao", "ativo", "inativo"]>;
    criadoPor: z.ZodString;
    atualizadoPor: z.ZodString;
    criadoEm: z.ZodDate;
    atualizadoEm: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
    orgId: string;
    criadoPor: string;
    nome: string;
    produtoId: string;
    atualizadoPor: string;
    criadoEm: Date;
    atualizadoEm: Date;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}, {
    status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
    orgId: string;
    criadoPor: string;
    nome: string;
    produtoId: string;
    atualizadoPor: string;
    criadoEm: Date;
    atualizadoEm: Date;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    descricao?: string | null | undefined;
}>;
export declare const varianteAtributosSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
export declare const criarVarianteInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    productId: z.ZodString;
    sku: z.ZodString;
    nome: z.ZodString;
    atributos: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
    preco: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    estoque: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    sku: string;
    nome: string;
    productId: string;
    atributos: Record<string, string | number | boolean>;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}, {
    orgId: string;
    sku: string;
    nome: string;
    productId: string;
    atributos: Record<string, string | number | boolean>;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}>;
export type CriarVarianteInput = z.infer<typeof criarVarianteInputSchema>;
export declare const varianteViewSchema: z.ZodObject<{
    orgId: z.ZodString;
    productId: z.ZodString;
    sku: z.ZodString;
    nome: z.ZodString;
    atributos: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
    preco: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    estoque: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
} & {
    varianteId: z.ZodString;
    createdBy: z.ZodString;
    updatedBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    updatedAt: Date;
    orgId: string;
    sku: string;
    createdBy: string;
    updatedBy: string;
    nome: string;
    productId: string;
    atributos: Record<string, string | number | boolean>;
    varianteId: string;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}, {
    createdAt: Date;
    updatedAt: Date;
    orgId: string;
    sku: string;
    createdBy: string;
    updatedBy: string;
    nome: string;
    productId: string;
    atributos: Record<string, string | number | boolean>;
    varianteId: string;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}>;
export type VarianteView = z.infer<typeof varianteViewSchema>;
export declare const atualizarVarianteInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    varianteId: z.ZodString;
    nome: z.ZodOptional<z.ZodString>;
    atributos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>;
    preco: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    estoque: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    varianteId: string;
    nome?: string | undefined;
    atributos?: Record<string, string | number | boolean> | undefined;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}, {
    orgId: string;
    varianteId: string;
    nome?: string | undefined;
    atributos?: Record<string, string | number | boolean> | undefined;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
    ativo?: boolean | undefined;
}>;
export type AtualizarVarianteInput = z.infer<typeof atualizarVarianteInputSchema>;
export declare const criarCategoriaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ordem: z.ZodOptional<z.ZodNumber>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    name: string;
    slug: string;
    description?: string | null | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}, {
    orgId: string;
    name: string;
    slug: string;
    description?: string | null | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}>;
export type CriarCategoriaInput = z.infer<typeof criarCategoriaInputSchema>;
export declare const categoriaViewSchema: z.ZodObject<{
    orgId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ordem: z.ZodOptional<z.ZodNumber>;
    ativo: z.ZodOptional<z.ZodBoolean>;
} & {
    categoriaId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    updatedAt: Date;
    orgId: string;
    name: string;
    slug: string;
    categoriaId: string;
    description?: string | null | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}, {
    createdAt: Date;
    updatedAt: Date;
    orgId: string;
    name: string;
    slug: string;
    categoriaId: string;
    description?: string | null | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}>;
export type CategoriaView = z.infer<typeof categoriaViewSchema>;
export declare const atualizarCategoriaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    categoriaId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ordem: z.ZodOptional<z.ZodNumber>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    categoriaId: string;
    description?: string | null | undefined;
    name?: string | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}, {
    orgId: string;
    categoriaId: string;
    description?: string | null | undefined;
    name?: string | undefined;
    parentId?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
}>;
export type AtualizarCategoriaInput = z.infer<typeof atualizarCategoriaInputSchema>;
export declare const atualizarProdutoInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    produtoId: z.ZodString;
    nome: z.ZodOptional<z.ZodString>;
    descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    produtoId: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    nome?: string | undefined;
    descricao?: string | null | undefined;
}, {
    orgId: string;
    produtoId: string;
    sku?: string | null | undefined;
    categoryId?: string | null | undefined;
    nome?: string | undefined;
    descricao?: string | null | undefined;
}>;
export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoInputSchema>;
export type ProdutoView = z.infer<typeof produtoViewSchema>;
export declare const aprovarProdutoInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    produtoId: z.ZodString;
    motivo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    produtoId: string;
    motivo?: string | undefined;
}, {
    orgId: string;
    produtoId: string;
    motivo?: string | undefined;
}>;
export type AprovarProdutoInput = z.infer<typeof aprovarProdutoInputSchema>;
export declare const reprovarProdutoInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    produtoId: z.ZodString;
    motivo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    produtoId: string;
    motivo: string;
}, {
    orgId: string;
    produtoId: string;
    motivo: string;
}>;
export type ReprovarProdutoInput = z.infer<typeof reprovarProdutoInputSchema>;
export declare const obterProdutoInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    produtoId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    produtoId: string;
}, {
    orgId: string;
    produtoId: string;
}>;
export type ObterProdutoInput = z.infer<typeof obterProdutoInputSchema>;
export declare const listarProdutosInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["rascunho", "aguardando_aprovacao", "ativo", "inativo"]>>;
    busca: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limite: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    orgId: string;
    status?: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo" | undefined;
    cursor?: string | undefined;
    busca?: string | undefined;
    limite?: number | undefined;
}, {
    orgId: string;
    status?: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo" | undefined;
    cursor?: string | undefined;
    busca?: string | undefined;
    limite?: number | undefined;
}>;
export type ListarProdutosInput = z.infer<typeof listarProdutosInputSchema>;
export declare const listarProdutosResultadoSchema: z.ZodObject<{
    itens: z.ZodArray<z.ZodObject<{
        orgId: z.ZodString;
        nome: z.ZodString;
        descricao: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        sku: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    } & {
        produtoId: z.ZodString;
        status: z.ZodEnum<["rascunho", "aguardando_aprovacao", "ativo", "inativo"]>;
        criadoPor: z.ZodString;
        atualizadoPor: z.ZodString;
        criadoEm: z.ZodDate;
        atualizadoEm: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
        orgId: string;
        criadoPor: string;
        nome: string;
        produtoId: string;
        atualizadoPor: string;
        criadoEm: Date;
        atualizadoEm: Date;
        sku?: string | null | undefined;
        categoryId?: string | null | undefined;
        descricao?: string | null | undefined;
    }, {
        status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
        orgId: string;
        criadoPor: string;
        nome: string;
        produtoId: string;
        atualizadoPor: string;
        criadoEm: Date;
        atualizadoEm: Date;
        sku?: string | null | undefined;
        categoryId?: string | null | undefined;
        descricao?: string | null | undefined;
    }>, "many">;
    proximoCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    itens: {
        status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
        orgId: string;
        criadoPor: string;
        nome: string;
        produtoId: string;
        atualizadoPor: string;
        criadoEm: Date;
        atualizadoEm: Date;
        sku?: string | null | undefined;
        categoryId?: string | null | undefined;
        descricao?: string | null | undefined;
    }[];
    proximoCursor?: string | null | undefined;
}, {
    itens: {
        status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
        orgId: string;
        criadoPor: string;
        nome: string;
        produtoId: string;
        atualizadoPor: string;
        criadoEm: Date;
        atualizadoEm: Date;
        sku?: string | null | undefined;
        categoryId?: string | null | undefined;
        descricao?: string | null | undefined;
    }[];
    proximoCursor?: string | null | undefined;
}>;
export type ListarProdutosResultado = z.infer<typeof listarProdutosResultadoSchema>;
