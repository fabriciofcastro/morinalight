import { z } from "zod";

export const clienteBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  nome: z.string().min(2).max(255),
  nomeSocial: z.string().max(255).optional().nullable(), // Nome Social / Apelido
  razaoSocial: z.string().max(255).optional().nullable(),
  nomeFantasia: z.string().max(255).optional().nullable(), // Nome Fantasia separado (especialmente para PJ)
  tipo: z.enum(["fisica", "juridica"]).default("fisica"),
  documento: z.string().min(11).max(18), // CPF ou CNPJ
  documentoValidade: z.union([z.date(), z.string()]).optional().nullable().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }), // Data de validade do documento
  situacaoCadastral: z.string().max(50).optional().nullable(), // Situação Cadastral na Receita Federal
  fotoUrl: z.string().max(512).url().optional().nullable(), // URL da foto/logo do cliente
  rg: z.string().max(20).optional().nullable(), // RG para PF
  orgaoEmissor: z.string().max(10).optional().nullable(), // Órgão Emissor do RG
  dataNascimento: z.union([z.date(), z.string()]).optional().nullable().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }), // Data de Nascimento (PF) / Data de Fundação (PJ)
  sexo: z.enum(["masculino", "feminino", "outro", "nao_informar"]).optional().nullable(), // Sexo/Gênero (PF)
  estadoCivil: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).optional().nullable(), // Estado Civil (PF)
  nacionalidade: z.string().max(100).optional().nullable(), // Nacionalidade
  naturalidadeCidade: z.string().max(100).optional().nullable(), // Cidade de Naturalidade
  naturalidadeEstado: z.string().length(2).optional().nullable(), // Estado de Naturalidade (UF)
  tituloEleitor: z.string().max(20).optional().nullable(), // Título de Eleitor
  certidaoNascimento: z.string().max(50).optional().nullable(), // Certidão de Nascimento
  certidaoCasamento: z.string().max(50).optional().nullable(), // Certidão de Casamento
  nomeMae: z.string().max(255).optional().nullable(), // Nome da Mãe (PF)
  nomePai: z.string().max(255).optional().nullable(), // Nome do Pai (PF)
  inscricaoEstadual: z.string().max(50).optional().nullable(), // IE para PJ
  inscricaoMunicipal: z.string().max(50).optional().nullable(), // IM para PJ
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  celular: z.string().max(20).optional().nullable(),
  website: z.string().max(512).refine(
    (val) => !val || val.trim() === "" || val.startsWith("http://") || val.startsWith("https://"),
    { message: "Website deve começar com http:// ou https://" }
  ).optional().nullable(), // Website do cliente
  linkedin: z.string().max(512).url().optional().nullable(), // LinkedIn
  facebook: z.string().max(512).url().optional().nullable(), // Facebook
  instagram: z.string().max(512).url().optional().nullable(), // Instagram
  twitter: z.string().max(512).url().optional().nullable(), // Twitter/X
  youtube: z.string().max(512).url().optional().nullable(), // YouTube
  blog: z.string().max(512).url().optional().nullable(), // Blog
  endereco: z.string().max(512).optional().nullable(),
  numero: z.string().max(20).optional().nullable(), // Número do endereço
  complemento: z.string().max(255).optional().nullable(), // Complemento do endereço
  bairro: z.string().max(100).optional().nullable(), // Bairro
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  pontoReferencia: z.string().max(255).optional().nullable(), // Ponto de referência
  latitude: z.string().max(20).optional().nullable(), // Coordenada GPS - Latitude
  longitude: z.string().max(20).optional().nullable(), // Coordenada GPS - Longitude
  codigoIBGE: z.string().max(10).optional().nullable(), // Código IBGE da cidade
  codigoMunicipio: z.string().max(10).optional().nullable(), // Código do município
  regiao: z.string().max(50).optional().nullable(), // Região (Norte, Sul, etc)
  zona: z.enum(["urbana", "rural"]).optional().nullable(), // Zona (Urbana/Rural)
  observacoes: z.string().max(2048).optional().nullable(),
  horarioPreferencialContato: z.string().max(100).optional().nullable(), // Horário preferencial (ex: "08:00-18:00")
  idiomaPreferido: z.string().max(10).optional().nullable(), // Idioma preferido (pt-BR, en-US, etc)
  formaPreferidaComunicacao: z.enum(["email", "telefone", "whatsapp", "telegram", "presencial"]).optional().nullable(), // Forma preferida
});

export const criarClienteInputSchema = clienteBaseSchema.pick({
  orgId: true,
  nome: true,
  nomeSocial: true,
  razaoSocial: true,
  nomeFantasia: true,
  tipo: true,
  documento: true,
  documentoValidade: true,
  situacaoCadastral: true,
  fotoUrl: true,
  rg: true,
  orgaoEmissor: true,
  dataNascimento: true,
  sexo: true,
  estadoCivil: true,
  nacionalidade: true,
  naturalidadeCidade: true,
  naturalidadeEstado: true,
  tituloEleitor: true,
  certidaoNascimento: true,
  certidaoCasamento: true,
  nomeMae: true,
  nomePai: true,
  inscricaoEstadual: true,
  inscricaoMunicipal: true,
  email: true,
  emailSecundario: true,
  emailCorporativo: true,
  telefone: true,
  telefoneComercial: true,
  celular: true,
  whatsapp: true,
  telegram: true,
  website: true,
  linkedin: true,
  facebook: true,
  instagram: true,
  twitter: true,
  youtube: true,
  blog: true,
  endereco: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  estado: true,
  cep: true,
  pontoReferencia: true,
  latitude: true,
  longitude: true,
  codigoIBGE: true,
  codigoMunicipio: true,
  regiao: true,
  zona: true,
  observacoes: true,
  horarioPreferencialContato: true,
  idiomaPreferido: true,
  formaPreferidaComunicacao: true,
});

export type CriarClienteInput = z.infer<typeof criarClienteInputSchema>;

const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable().optional(),
});

export const clienteViewSchema = clienteBaseSchema.extend({
  clienteId: z.string().uuid(),
  status: z.enum(["ativo", "inativo", "bloqueado"]),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(tagSchema).optional().default([]),
});

export type ClienteView = z.infer<typeof clienteViewSchema>;

export const atualizarClienteInputSchema = z.object({
  orgId: z.string().min(1),
  clienteId: z.string().uuid(),
  nome: z.string().min(2).max(255).optional(),
  nomeSocial: z.string().max(255).optional().nullable(),
  razaoSocial: z.string().max(255).optional().nullable(),
  nomeFantasia: z.string().max(255).optional().nullable(),
  documentoValidade: z.union([z.date(), z.string()]).optional().nullable().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }),
  situacaoCadastral: z.string().max(50).optional().nullable(),
  fotoUrl: z.string().max(512).url().optional().nullable(),
  rg: z.string().max(20).optional().nullable(),
  orgaoEmissor: z.string().max(10).optional().nullable(),
  dataNascimento: z.union([z.date(), z.string()]).optional().nullable().transform((val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }),
  sexo: z.enum(["masculino", "feminino", "outro", "nao_informar"]).optional().nullable(),
  estadoCivil: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).optional().nullable(),
  nacionalidade: z.string().max(100).optional().nullable(),
  naturalidadeCidade: z.string().max(100).optional().nullable(),
  naturalidadeEstado: z.string().length(2).optional().nullable(),
  tituloEleitor: z.string().max(20).optional().nullable(),
  certidaoNascimento: z.string().max(50).optional().nullable(),
  certidaoCasamento: z.string().max(50).optional().nullable(),
  nomeMae: z.string().max(255).optional().nullable(),
  nomePai: z.string().max(255).optional().nullable(),
  inscricaoEstadual: z.string().max(50).optional().nullable(),
  inscricaoMunicipal: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  celular: z.string().max(20).optional().nullable(),
  website: z.string().max(512).refine(
    (val) => !val || val.trim() === "" || val.startsWith("http://") || val.startsWith("https://"),
    { message: "Website deve começar com http:// ou https://" }
  ).optional().nullable(),
  endereco: z.string().max(512).optional().nullable(),
  numero: z.string().max(20).optional().nullable(),
  complemento: z.string().max(255).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  status: z.enum(["ativo", "inativo", "bloqueado"]).optional(),
  observacoes: z.string().max(2048).optional().nullable(),
});

export type AtualizarClienteInput = z.infer<typeof atualizarClienteInputSchema>;

export const listarClientesInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "bloqueado"]).optional(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarClientesInput = z.infer<typeof listarClientesInputSchema>;

export const listarClientesResultadoSchema = z.object({
  itens: z.array(clienteViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarClientesResultado = z.infer<typeof listarClientesResultadoSchema>;
