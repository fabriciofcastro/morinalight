import { apiClient as api } from "./base";

// ============================================
// Types
// ============================================

export type TipoTecido = "principal" | "forro" | "entretela" | "outros";
export type TipoInsumoTecnico = "linha" | "ziper" | "botao" | "etiqueta" | "outros";
export type UnidadeMedida = "cm" | "unidade" | "metro" | "kg" | "litro";
export type StatusPreFichaTecnica =
  | "rascunho"
  | "submetida_para_revisao_tecnica"
  | "em_revisao_ficha_tecnica"
  | "aprovada_tecnicamente"
  | "aguardando_aval_diretoria"
  | "liberada_para_producao_piloto"
  | "reprovada";

export interface Tecido {
  id?: string;
  tipo: TipoTecido;
  nome: string;
  especificacao?: string | null;
  consumo: number;
  largura: number;
  quantidadePartes?: number | null;
  observacoesTecnicas?: string | null;
  ordem?: number;
}

export interface InsumoTecnico {
  id?: string;
  descricao: string;
  tipo: TipoInsumoTecnico;
  quantidadeBase: number;
  consumoPorTamanho?: { [tamanho: string]: number } | null;
  unidadeMedida: UnidadeMedida;
  observacoesTecnicas?: string | null;
  ordem?: number;
}

export interface PreFichaTecnica {
  id: string;
  orgId: string;
  numeroSequencial: number;
  codigoPeca: string;
  nomePecaPiloto: string;
  categoria?: string | null;
  versaoMolde: number;
  status: StatusPreFichaTecnica;
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  fotosAdicionais?: string[] | null;
  estilistaId?: string | null;
  estilistaNome?: string | null;
  modelistaId?: string | null;
  modelistaNome?: string | null;
  piloteiroId?: string | null;
  piloteiroNome?: string | null;
  liberadoPorId?: string | null;
  liberadoPorNome?: string | null;
  gradeTamanhos?: string[] | null;
  observacoesTecnicas?: string | null;
  observacoesOficina?: string | null;
  houveAlteracao: boolean;
  descricaoAlteracao?: string | null;
  checklistTecnico?: {
    moldeVesteCorretamente?: boolean;
    costuraViavel?: boolean;
    insumosCompatíveis?: boolean;
    pecaPilotoAprovadaVisualmente?: boolean;
  } | null;
  medidasCriticas?: string | null;
  resultadoAvaliacao?: string | null;
  observacaoAvaliacao?: string | null;
  dataSubmissao?: string | null;
  dataInicioRevisao?: string | null;
  dataAprovacaoTecnica?: string | null;
  dataAprovacaoDiretoria?: string | null;
  dataReprovacao?: string | null;
  justificativaReprovacao?: string | null;
  versaoAtual: number;
  versaoAnteriorId?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  tecidos: Tecido[];
  insumosTecnicos: InsumoTecnico[];
}

// ============================================
// Input Types
// ============================================

export interface CreateTecidoInput {
  tipo: TipoTecido;
  nome: string;
  especificacao?: string | null;
  consumo: number;
  largura: number;
  quantidadePartes?: number | null;
  observacoesTecnicas?: string | null;
  ordem?: number;
}

export interface CreateInsumoTecnicoInput {
  descricao: string;
  tipo: TipoInsumoTecnico;
  quantidadeBase: number;
  consumoPorTamanho?: { [tamanho: string]: number } | null;
  unidadeMedida: UnidadeMedida;
  observacoesTecnicas?: string | null;
  ordem?: number;
}

export interface CreatePreFichaTecnicaInput {
  codigoPeca: string;
  nomePecaPiloto: string;
  categoria?: string | null;
  versaoMolde?: number;
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  gradeTamanhos?: string[] | null;
  observacoesTecnicas?: string | null;
  observacoesOficina?: string | null;
  tecidos: CreateTecidoInput[];
  insumosTecnicos: CreateInsumoTecnicoInput[];
  estilistaId?: string | null;
  estilistaNome?: string | null;
  modelistaId?: string | null;
  modelistaNome?: string | null;
  piloteiroId?: string | null;
  piloteiroNome?: string | null;
}

export interface UpdatePreFichaTecnicaInput extends Partial<CreatePreFichaTecnicaInput> {}

// ============================================
// API Functions
// ============================================

export async function listarPreFichasTecnicas(
  orgId: string,
  filtros?: {
    pagina?: number;
    tamanhoPagina?: number;
    status?: string[];
    categoria?: string;
    codigoPeca?: string;
    busca?: string;
  },
) {
  const params = new URLSearchParams();
  if (filtros?.pagina) params.append("pagina", filtros.pagina.toString());
  if (filtros?.tamanhoPagina) params.append("tamanhoPagina", filtros.tamanhoPagina.toString());
  if (filtros?.status) params.append("status", filtros.status.join(","));
  if (filtros?.categoria) params.append("categoria", filtros.categoria);
  if (filtros?.codigoPeca) params.append("codigoPeca", filtros.codigoPeca);
  if (filtros?.busca) params.append("busca", filtros.busca);

  const response = await api.get<{
    itens: PreFichaTecnica[];
    total: number;
    pagina: number;
    tamanhoPagina: number;
    totalPaginas: number;
  }>(`/organizations/${orgId}/pre-fichas-tecnicas?${params.toString()}`);

  return response.data;
}

export async function buscarPreFichaTecnica(orgId: string, id: string): Promise<PreFichaTecnica> {
  const response = await api.get<PreFichaTecnica>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}`,
  );
  return response.data;
}

export async function criarPreFichaTecnica(
  orgId: string,
  input: CreatePreFichaTecnicaInput,
): Promise<PreFichaTecnica> {
  const response = await api.post<PreFichaTecnica>(
    `/organizations/${orgId}/pre-fichas-tecnicas`,
    input,
  );
  return response.data;
}

export async function submeterPreFichaTecnica(
  orgId: string,
  id: string,
): Promise<{ id: string; status: StatusPreFichaTecnica }> {
  const response = await api.post<{ id: string; status: StatusPreFichaTecnica }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/submeter`,
  );
  return response.data;
}

export async function aprovarTecnicamentePreFichaTecnica(
  orgId: string,
  id: string,
  aprovadorNome: string,
): Promise<{ id: string; status: StatusPreFichaTecnica }> {
  const response = await api.post<{ id: string; status: StatusPreFichaTecnica }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/aprovar-tecnicamente`,
    { aprovadorNome },
  );
  return response.data;
}

export async function reprovarPreFichaTecnica(
  orgId: string,
  id: string,
  justificativa: string,
  reprovadorNome?: string,
): Promise<{ id: string; status: StatusPreFichaTecnica }> {
  const response = await api.post<{ id: string; status: StatusPreFichaTecnica }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/reprovar`,
    { justificativa, reprovadorNome },
  );
  return response.data;
}

export async function aprovarDiretoriaPreFichaTecnica(
  orgId: string,
  id: string,
  aprovadorNome: string,
): Promise<{ id: string; status: StatusPreFichaTecnica }> {
  const response = await api.post<{ id: string; status: StatusPreFichaTecnica }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/aprovar-diretoria`,
    { aprovadorNome },
  );
  return response.data;
}

export interface VersaoPreFichaTecnica {
  id: string;
  versao: number;
  criadoPor: string;
  motivoAlteracao?: string | null;
  createdAt: string;
  dadosSnapshot: any;
}

export async function listarVersoesPreFichaTecnica(
  orgId: string,
  preFichaTecnicaId: string,
  pagina?: number,
  tamanhoPagina?: number,
): Promise<{
  itens: VersaoPreFichaTecnica[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}> {
  const params = new URLSearchParams();
  if (pagina) params.append("pagina", pagina.toString());
  if (tamanhoPagina) params.append("tamanhoPagina", tamanhoPagina.toString());

  const response = await api.get<{
    itens: VersaoPreFichaTecnica[];
    total: number;
    pagina: number;
    tamanhoPagina: number;
    totalPaginas: number;
  }>(`/organizations/${orgId}/pre-fichas-tecnicas/${preFichaTecnicaId}/versoes?${params.toString()}`);

  return response.data;
}

export async function atualizarPreFichaTecnica(
  orgId: string,
  id: string,
  input: Partial<CreatePreFichaTecnicaInput> & { motivoAlteracao?: string },
): Promise<{ id: string; versao: number; status: StatusPreFichaTecnica }> {
  const response = await api.put<{ id: string; versao: number; status: StatusPreFichaTecnica }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}`,
    input,
  );
  return response.data;
}

export async function atualizarChecklistTecnico(
  orgId: string,
  id: string,
  checklist: {
    moldeVesteCorretamente?: boolean;
    costuraViavel?: boolean;
    insumosCompatíveis?: boolean;
    pecaPilotoAprovadaVisualmente?: boolean;
  },
): Promise<{ id: string; checklist: any }> {
  const response = await api.put<{ id: string; checklist: any }>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/checklist-tecnico`,
    { checklist },
  );
  return response.data;
}

export async function exportarPdfPreFichaTecnica(
  orgId: string,
  id: string,
): Promise<string> {
  const response = await api.get<string>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${id}/exportar-pdf`,
    {
      responseType: "text",
    } as any,
  );
  return response;
}

export interface ComparacaoVersoes {
  versao1: number | "atual";
  versao2: number | "atual";
  dados1: any;
  dados2: any;
  diff: Array<{
    campo: string;
    valorAnterior: any;
    valorNovo: any;
    tipo: "alterado" | "adicionado" | "removido";
  }>;
  metadata1: any;
  metadata2: any;
}

export async function compararVersoesPreFichaTecnica(
  orgId: string,
  preFichaTecnicaId: string,
  versao1?: number,
  versao2?: number,
): Promise<ComparacaoVersoes> {
  const params = new URLSearchParams();
  if (versao1 !== undefined) params.append("versao1", versao1.toString());
  if (versao2 !== undefined) params.append("versao2", versao2.toString());

  const response = await api.get<ComparacaoVersoes>(
    `/organizations/${orgId}/pre-fichas-tecnicas/${preFichaTecnicaId}/comparar-versoes?${params.toString()}`,
  );
  return response.data;
}












