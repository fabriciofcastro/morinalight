import { z } from "zod";

/**
 * Schemas Zod para validação de dados de Ficha de Custo
 */

export const tipoInsumoSchema = z.enum(["aviamento", "servico", "terceirizacao", "outros"]);

export const statusFichaCustoSchema = z.enum([
  "rascunho",
  "enviada_para_conferencia",
  "aprovada",
  "reprovada",
]);

export const statusBoletoSchema = z.enum(["pendente", "pago", "cancelado", "vencido"]);

export const tipoDocumentoSchema = z.enum([
  "foto_peca",
  "nota_fiscal",
  "boleto",
  "comprovante_pagamento",
  "outros",
]);

/**
 * Schema para criação de Insumo
 */
export const criarInsumoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(500),
  tipo: tipoInsumoSchema,
  fornecedorId: z.string().uuid().nullable().optional(),
  fornecedorNome: z.string().max(255).nullable().optional(),
  fornecedorCnpj: z.string().max(20).nullable().optional(),
  notaFiscalNumero: z.string().max(50).nullable().optional(),
  notaFiscalData: z.coerce.date().nullable().optional(),
  notaFiscalValor: z.number().nonnegative().nullable().optional(),
  quantidade: z.number().positive("Quantidade deve ser maior que zero"),
  unidadeMedida: z.string().min(1).max(20),
  custoUnitario: z.number().nonnegative("Custo unitário não pode ser negativo"),
  observacoes: z.string().max(5000).nullable().optional(),
});

/**
 * Schema para atualização de Insumo
 */
export const atualizarInsumoSchema = criarInsumoSchema.partial();

/**
 * Schema para criação de Ficha de Custo
 */
export const criarFichaCustoSchema = z.object({
  referenciaPeca: z.string().min(1, "Referência da peça é obrigatória").max(100),
  nomePeca: z.string().min(1, "Nome da peça é obrigatória").max(255),
  categoria: z.string().max(100).nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  sectorId: z.string().uuid().nullable().optional(),
  fotoPecaUrl: z.string().url().nullable().optional(),
  fotoPecaStorageKey: z.string().max(512).nullable().optional(),
  insumos: z.array(criarInsumoSchema).min(0),
});

/**
 * Schema para atualização de Ficha de Custo
 */
export const atualizarFichaCustoSchema = z.object({
  referenciaPeca: z.string().min(1).max(100).optional(),
  nomePeca: z.string().min(1).max(255).optional(),
  categoria: z.string().max(100).nullable().optional(),
  fotoPecaUrl: z.string().url().nullable().optional(),
  fotoPecaStorageKey: z.string().max(512).nullable().optional(),
  insumos: z.array(criarInsumoSchema).optional(),
});

/**
 * Schema para aprovar Ficha de Custo
 */
export const aprovarFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
  aprovadorId: z.string().uuid(),
});

/**
 * Schema para reprovar Ficha de Custo
 */
export const reprovarFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
  reprovadorId: z.string().uuid(),
  justificativa: z.string().min(10, "Justificativa deve ter pelo menos 10 caracteres").max(5000),
});

/**
 * Schema para enviar Ficha de Custo para conferência
 */
export const enviarConferenciaFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
});

/**
 * Schema para criação de Boleto
 */
export const criarBoletoFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
  insumoId: z.string().uuid().nullable().optional(),
  fornecedorId: z.string().uuid().nullable().optional(),
  fornecedorNome: z.string().max(255).nullable().optional(),
  arquivoUrl: z.string().url().nullable().optional(),
  arquivoStorageKey: z.string().max(512).nullable().optional(),
  valorBoleto: z.number().positive("Valor do boleto deve ser maior que zero"),
  dataVencimento: z.coerce.date(),
  codigoBarras: z.string().max(100).nullable().optional(),
  linhaDigitavel: z.string().max(100).nullable().optional(),
  observacoes: z.string().max(5000).nullable().optional(),
});

/**
 * Schema para atualização de Boleto
 */
export const atualizarBoletoFichaCustoSchema = z.object({
  valorBoleto: z.number().positive().optional(),
  dataVencimento: z.coerce.date().optional(),
  codigoBarras: z.string().max(100).nullable().optional(),
  linhaDigitavel: z.string().max(100).nullable().optional(),
  status: statusBoletoSchema.optional(),
  dataPagamento: z.coerce.date().nullable().optional(),
  observacoes: z.string().max(5000).nullable().optional(),
});

/**
 * Schema para marcar boleto como pago
 */
export const pagarBoletoFichaCustoSchema = z.object({
  fichaCustoId: z.string().uuid(),
  boletoId: z.string().uuid(),
  dataPagamento: z.coerce.date().optional(),
});

/**
 * Schema para filtros de listagem
 */
export const filtroFichaCustoSchema = z.object({
  status: z.array(statusFichaCustoSchema).optional(),
  departmentId: z.string().uuid().optional(),
  sectorId: z.string().uuid().optional(),
  referenciaPeca: z.string().optional(),
  criadoPor: z.string().uuid().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  busca: z.string().optional(),
});

/**
 * Schema para paginação
 */
export const paginacaoFichaCustoSchema = z.object({
  pagina: z.number().int().positive().default(1),
  tamanhoPagina: z.number().int().positive().max(100).default(20),
});

/**
 * Schema de resposta (View) de Ficha de Custo
 */
export const fichaCustoViewSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  numeroSequencial: z.number().int().positive(),
  referenciaPeca: z.string(),
  nomePeca: z.string(),
  categoria: z.string().nullable(),
  departmentId: z.string().uuid().nullable(),
  sectorId: z.string().uuid().nullable(),
  status: statusFichaCustoSchema,
  fotoPecaUrl: z.string().url().nullable(),
  totalCustos: z.number().nonnegative(),
  custoFinalPeca: z.number().nonnegative(),
  criadoPor: z.string().uuid(),
  aprovadoPor: z.string().uuid().nullable(),
  reprovadoPor: z.string().uuid().nullable(),
  responsavelFinanceiro: z.string().uuid().nullable(),
  dataEnvioConferencia: z.date().nullable(),
  dataAprovacao: z.date().nullable(),
  dataReprovacao: z.date().nullable(),
  justificativaReprovacao: z.string().nullable(),
  versaoAtual: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  insumos: z.array(
    z.object({
      id: z.string().uuid().optional(),
      descricao: z.string(),
      tipo: tipoInsumoSchema,
      fornecedorId: z.string().uuid().nullable(),
      fornecedorNome: z.string().nullable(),
      notaFiscalNumero: z.string().nullable(),
      quantidade: z.number(),
      unidadeMedida: z.string(),
      custoUnitario: z.number(),
      custoTotal: z.number(),
    }),
  ),
});

export type CriarFichaCustoInput = z.infer<typeof criarFichaCustoSchema>;
export type AtualizarFichaCustoInput = z.infer<typeof atualizarFichaCustoSchema>;
export type AprovarFichaCustoInput = z.infer<typeof aprovarFichaCustoSchema>;
export type ReprovarFichaCustoInput = z.infer<typeof reprovarFichaCustoSchema>;
export type EnviarConferenciaFichaCustoInput = z.infer<typeof enviarConferenciaFichaCustoSchema>;
export type CriarBoletoFichaCustoInput = z.infer<typeof criarBoletoFichaCustoSchema>;
export type FichaCustoView = z.infer<typeof fichaCustoViewSchema>;
