import { z } from "zod";

/**
 * Schemas Zod para validação de dados de Pré-Ficha Técnica
 */

export const tipoTecidoSchema = z.enum(["principal", "forro", "entretela", "outros"]);

export const tipoInsumoTecnicoSchema = z.enum(["linha", "ziper", "botao", "etiqueta", "outros"]);

export const unidadeMedidaSchema = z.enum(["cm", "unidade", "metro", "kg", "litro"]);

export const statusPreFichaTecnicaSchema = z.enum([
  "rascunho",
  "submetida_para_revisao_tecnica",
  "em_revisao_ficha_tecnica",
  "aprovada_tecnicamente",
  "aguardando_aval_diretoria",
  "liberada_para_producao_piloto",
  "reprovada",
]);

/**
 * Schema para criação de Tecido
 */
export const criarTecidoSchema = z.object({
  tipo: tipoTecidoSchema,
  nome: z.string().min(1, "Nome do tecido é obrigatório").max(255),
  especificacao: z.string().max(500).nullable().optional(),
  consumo: z.number().positive("Consumo deve ser maior que zero"),
  largura: z.number().positive("Largura deve ser maior que zero"),
  quantidadePartes: z.number().int().positive().nullable().optional(),
  observacoesTecnicas: z.string().max(5000).nullable().optional(),
  ordem: z.number().int().nonnegative().optional(),
});

/**
 * Schema para criação de Insumo Técnico
 */
export const criarInsumoTecnicoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(500),
  tipo: tipoInsumoTecnicoSchema,
  quantidadeBase: z.number().positive("Quantidade base deve ser maior que zero"),
  consumoPorTamanho: z.record(z.string(), z.number().positive()).nullable().optional(), // { "PP": 10, "P": 12, ... }
  unidadeMedida: unidadeMedidaSchema,
  observacoesTecnicas: z.string().max(5000).nullable().optional(),
  ordem: z.number().int().nonnegative().optional(),
});

/**
 * Schema para criação de Pré-Ficha Técnica
 */
export const criarPreFichaTecnicaSchema = z.object({
  codigoPeca: z.string().min(1, "Código da peça é obrigatório").max(100),
  nomePecaPiloto: z.string().min(1, "Nome da peça piloto é obrigatório").max(255),
  categoria: z.string().max(100).nullable().optional(),
  versaoMolde: z.number().int().positive().default(1),
  fotoPecaUrl: z.string().url().nullable().optional(),
  fotoPecaStorageKey: z.string().max(512).nullable().optional(),
  gradeTamanhos: z.array(z.string()).nullable().optional(), // ["PP", "P", "M", "G", "GG"]
  observacoesTecnicas: z.string().max(10000).nullable().optional(),
  observacoesOficina: z.string().max(1000).nullable().optional(),
  tecidos: z.array(criarTecidoSchema).min(0),
  insumosTecnicos: z.array(criarInsumoTecnicoSchema).min(0),
  // Responsáveis técnicos
  estilistaId: z.string().uuid().nullable().optional(),
  estilistaNome: z.string().max(255).nullable().optional(),
  modelistaId: z.string().uuid().nullable().optional(),
  modelistaNome: z.string().max(255).nullable().optional(),
  piloteiroId: z.string().uuid().nullable().optional(),
  piloteiroNome: z.string().max(255).nullable().optional(),
});

/**
 * Schema para atualização de Pré-Ficha Técnica
 */
export const atualizarPreFichaTecnicaSchema = z.object({
  codigoPeca: z.string().min(1).max(100).optional(),
  nomePecaPiloto: z.string().min(1).max(255).optional(),
  categoria: z.string().max(100).nullable().optional(),
  fotoPecaUrl: z.string().url().nullable().optional(),
  fotoPecaStorageKey: z.string().max(512).nullable().optional(),
  gradeTamanhos: z.array(z.string()).nullable().optional(),
  observacoesTecnicas: z.string().max(10000).nullable().optional(),
  observacoesOficina: z.string().max(1000).nullable().optional(),
  tecidos: z.array(criarTecidoSchema).optional(),
  insumosTecnicos: z.array(criarInsumoTecnicoSchema).optional(),
  // Responsáveis técnicos
  estilistaId: z.string().uuid().nullable().optional(),
  estilistaNome: z.string().max(255).nullable().optional(),
  modelistaId: z.string().uuid().nullable().optional(),
  modelistaNome: z.string().max(255).nullable().optional(),
  piloteiroId: z.string().uuid().nullable().optional(),
  piloteiroNome: z.string().max(255).nullable().optional(),
});

/**
 * Schema para submeter Pré-Ficha Técnica
 */
export const submeterPreFichaTecnicaSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
});

/**
 * Schema para aprovar tecnicamente
 */
export const aprovarTecnicamentePreFichaTecnicaSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  aprovadorId: z.string().uuid(),
  aprovadorNome: z.string().min(1),
});

/**
 * Schema para reprovar
 */
export const reprovarPreFichaTecnicaSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  reprovadorId: z.string().uuid(),
  reprovadorNome: z.string().min(1),
  justificativa: z.string().min(10, "Justificativa deve ter pelo menos 10 caracteres").max(5000),
});

/**
 * Schema para aprovar pela diretoria
 */
export const aprovarDiretoriaPreFichaTecnicaSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  aprovadorId: z.string().uuid(),
  aprovadorNome: z.string().min(1),
});

/**
 * Schema para atualizar checklist técnico
 */
export const atualizarChecklistTecnicoSchema = z.object({
  preFichaTecnicaId: z.string().uuid(),
  checklist: z.object({
    moldeVesteCorretamente: z.boolean().optional(),
    costuraViavel: z.boolean().optional(),
    insumosCompatíveis: z.boolean().optional(),
    pecaPilotoAprovadaVisualmente: z.boolean().optional(),
  }),
});

/**
 * Schema para filtros de listagem
 */
export const listarPreFichasTecnicasFiltroSchema = z.object({
  status: z.array(statusPreFichaTecnicaSchema).optional(),
  categoria: z.string().max(100).optional(),
  codigoPeca: z.string().max(100).optional(),
  criadoPor: z.string().uuid().optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  busca: z.string().max(255).optional(),
});

/**
 * Schema para paginação
 */
export const paginacaoSchema = z.object({
  pagina: z.number().int().positive().default(1),
  tamanhoPagina: z.number().int().positive().max(100).default(20),
});
