import { apiClient as api } from "./base";

// ============================================
// Types
// ============================================

export interface Supplier {
  id: string;
  orgId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status: string;
  notes?: string | null;
  website?: string | null;
  contatoPrincipal?: string | null;
  cargoContato?: string | null;
  ramoAtividade?: string | null;
  tipoFornecedor?: string | null;
  prazoPagamento?: number | null;
  condicaoPagamento?: string | null;
  limiteCredito?: number | null;
  avaliacao?: number | null;
  dataUltimaCompra?: string | null;
  totalCompras?: number | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status?: string;
  notes?: string | null;
  website?: string | null;
  contatoPrincipal?: string | null;
  cargoContato?: string | null;
  ramoAtividade?: string | null;
  tipoFornecedor?: string | null;
  prazoPagamento?: number | null;
  condicaoPagamento?: string | null;
  limiteCredito?: number | null;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface ListSuppliersQuery {
  status?: string;
  busca?: string;
  documento?: string;
  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;
  pagina?: number;
  tamanhoPagina?: number;
  ordenarPor?: "name" | "createdAt" | "updatedAt" | "status";
  ordem?: "asc" | "desc";
}

export interface ListSuppliersResponse {
  itens: Supplier[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}

export interface AuditoriaSupplier {
  id: string;
  supplierId: string;
  orgId: string;
  acao: string;
  campo?: string | null;
  estadoAnterior?: unknown | null;
  estadoNovo?: unknown | null;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  justificativa?: string | null;
  metadata?: unknown | null;
  createdAt: string;
}

export interface AuditoriaSupplierPage {
  itens: AuditoriaSupplier[];
  proximoCursor?: string;
}

export interface ListAuditoriaQuery {
  limite?: number;
  cursor?: string;
  acao?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface VersaoSupplier {
  id: string;
  supplierId: string;
  versao: number;
  dadosSnapshot: unknown;
  criadoPor: string;
  motivoAlteracao?: string | null;
  createdAt: string;
}

export interface VersoesSupplierResponse {
  versoes: VersaoSupplier[];
}

export interface SupplierEstatisticas {
  totalFichasCusto: number;
  totalInsumos: number;
  valorTotal: number;
  totalBoletos: number;
  ultimaCompra: string | null;
}

export interface SupplierFichaCusto {
  id: string;
  numeroSequencial: number;
  referenciaPeca: string;
  nomePeca: string;
  status: string;
  totalCustos: number;
  custoFinalPeca: number;
  createdAt: string;
  updatedAt: string;
  valorFornecedor: number;
}

export interface SupplierFichasCustoResponse {
  itens: SupplierFichaCusto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}

export interface SupplierInsumo {
  descricao: string;
  tipo: string;
  quantidadeTotal: number;
  valorTotal: number;
  precoMinimo: number;
  precoMaximo: number;
  precoMedio: number;
  ultimaCompra: string;
  totalCompras: number;
  fichaMaisRecente: {
    id: string;
    numeroSequencial: number;
    referenciaPeca: string;
    nomePeca: string;
    createdAt: string;
  };
}

export interface SupplierInsumosResponse {
  insumos: SupplierInsumo[];
}

export interface SupplierBoleto {
  id: string;
  valorBoleto: number;
  dataVencimento: string;
  status: string;
  dataPagamento: string | null;
  codigoBarras: string | null;
  linhaDigitavel: string | null;
  arquivoUrl: string | null;
  fichaCusto: {
    id: string;
    numeroSequencial: number;
    referenciaPeca: string;
    nomePeca: string;
  };
  createdAt: string;
}

export interface SupplierBoletosResponse {
  boletos: SupplierBoleto[];
}

export interface ListFichasCustoQuery {
  pagina?: number;
  tamanhoPagina?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface ListInsumosQuery {
  // Futuro: filtros adicionais
}

export interface ListBoletosQuery {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface SupplierDocumento {
  id: string;
  tipo: string;
  nomeArquivo: string;
  arquivoUrl: string;
  tamanhoBytes: number;
  mimeType: string;
  descricao?: string | null;
  anexadoPor: string;
  createdAt: string;
}

export interface SupplierDocumentosResponse {
  documentos: SupplierDocumento[];
}

export interface CreateDocumentoInput {
  tipo: "foto_peca" | "nota_fiscal" | "boleto" | "comprovante_pagamento" | "outros";
  nomeArquivo: string;
  arquivoUrl: string;
  arquivoStorageKey: string;
  tamanhoBytes: number;
  mimeType: string;
  descricao?: string | null;
}

// ============================================
// Tags
// ============================================
export interface SupplierTag {
  id: string;
  orgId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierTagInput {
  name: string;
  color?: string | null;
}

export interface UpdateSupplierTagInput {
  name?: string;
  color?: string | null;
}

// ============================================
// Avaliações
// ============================================
export interface AvaliacaoSupplier {
  id: string;
  supplierId: string;
  userId: string;
  nota: number;
  comentario: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvaliacaoInput {
  nota: number;
  comentario?: string | null;
}

// ============================================
// Histórico de Preços
// ============================================
export interface HistoricoPrecoSupplier {
  id: string;
  supplierId: string;
  insumoId: string | null;
  insumoNome: string;
  preco: number;
  quantidade: number | null;
  unidade: string | null;
  fichaCustoId: string | null;
  dataCompra: string;
  createdAt: string;
}

export interface CreateHistoricoPrecoInput {
  insumoId?: string | null;
  insumoNome: string;
  preco: number;
  quantidade?: number | null;
  unidade?: string | null;
  fichaCustoId?: string | null;
  dataCompra: string;
}

// ============================================
// Notas
// ============================================
export interface NotaSupplier {
  id: string;
  supplierId: string;
  orgId: string;
  titulo: string | null;
  conteudo: string;
  tipo: string; // nota, lembrete, observacao
  criadoPor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotaInput {
  titulo?: string | null;
  conteudo: string;
  tipo?: string; // nota, lembrete, observacao
}

export interface UpdateNotaInput {
  titulo?: string | null;
  conteudo?: string;
  tipo?: string;
}

// ============================================
// CONTATOS
// ============================================
export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cargo?: string | null;
  isPrincipal: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContatoInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  cargo?: string | null;
  isPrincipal?: boolean;
  notes?: string | null;
}

export interface UpdateContatoInput extends Partial<Omit<CreateContatoInput, "isPrincipal">> {
  isPrincipal?: boolean;
}

// ============================================
// Alertas
// ============================================
export interface AlertaSupplier {
  id: string;
  supplierId: string | null;
  orgId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  prioridade: string;
  status: string;
  dataVencimento: string | null;
  lido: boolean;
  lidoEm: string | null;
  lidoPor: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Client
// ============================================

export const suppliersApi = {
  async list(orgId: string, query?: ListSuppliersQuery): Promise<ListSuppliersResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.busca) params.append("busca", query.busca);
    if (query?.documento) params.append("documento", query.documento);
    if (query?.cidade) params.append("cidade", query.cidade);
    if (query?.estado) params.append("estado", query.estado);
    if (query?.email) params.append("email", query.email);
    if (query?.telefone) params.append("telefone", query.telefone);
    if (query?.pagina) params.append("pagina", query.pagina.toString());
    if (query?.tamanhoPagina) params.append("tamanhoPagina", query.tamanhoPagina.toString());
    if (query?.ordenarPor) params.append("ordenarPor", query.ordenarPor);
    if (query?.ordem) params.append("ordem", query.ordem);

    const response = await api.get<ListSuppliersResponse>(
      `/suppliers?${params.toString()}`,
      { headers: { "x-org-id": orgId } }
    );
    return response;
  },

  async getById(orgId: string, id: string): Promise<Supplier> {
    return api.get<Supplier>(`/suppliers/${id}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async create(orgId: string, input: CreateSupplierInput): Promise<Supplier> {
    return api.post<Supplier>("/suppliers", input, {
      headers: { "x-org-id": orgId },
    });
  },

  async update(
    orgId: string,
    id: string,
    input: UpdateSupplierInput
  ): Promise<Supplier> {
    return api.put<Supplier>(`/suppliers/${id}`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async delete(orgId: string, id: string): Promise<void> {
    return api.delete(`/suppliers/${id}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async restore(orgId: string, id: string): Promise<Supplier> {
    return api.post<Supplier>(`/suppliers/${id}/restore`, {}, {
      headers: { "x-org-id": orgId },
    });
  },

  async getAuditoria(orgId: string, id: string, query?: ListAuditoriaQuery): Promise<AuditoriaSupplierPage> {
    const params = new URLSearchParams();
    if (query?.limite) params.append("limite", query.limite.toString());
    if (query?.cursor) params.append("cursor", query.cursor);
    if (query?.acao) params.append("acao", query.acao);
    if (query?.dataInicio) params.append("dataInicio", query.dataInicio);
    if (query?.dataFim) params.append("dataFim", query.dataFim);

    return api.get<AuditoriaSupplierPage>(
      `/suppliers/${id}/auditoria?${params.toString()}`,
      { headers: { "x-org-id": orgId } }
    );
  },

  async getVersoes(orgId: string, id: string): Promise<VersoesSupplierResponse> {
    return api.get<VersoesSupplierResponse>(`/suppliers/${id}/versoes`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getVersao(orgId: string, id: string, versao: number): Promise<VersaoSupplier> {
    return api.get<VersaoSupplier>(`/suppliers/${id}/versoes/${versao}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getEstatisticas(orgId: string, id: string): Promise<SupplierEstatisticas> {
    return api.get<SupplierEstatisticas>(`/suppliers/${id}/estatisticas`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getFichasCusto(
    orgId: string,
    id: string,
    query?: ListFichasCustoQuery
  ): Promise<SupplierFichasCustoResponse> {
    const params = new URLSearchParams();
    if (query?.pagina) params.append("pagina", query.pagina.toString());
    if (query?.tamanhoPagina) params.append("tamanhoPagina", query.tamanhoPagina.toString());
    if (query?.status) params.append("status", query.status);
    if (query?.dataInicio) params.append("dataInicio", query.dataInicio);
    if (query?.dataFim) params.append("dataFim", query.dataFim);

    return api.get<SupplierFichasCustoResponse>(
      `/suppliers/${id}/fichas-custo?${params.toString()}`,
      { headers: { "x-org-id": orgId } }
    );
  },

  async getInsumos(orgId: string, id: string): Promise<SupplierInsumosResponse> {
    return api.get<SupplierInsumosResponse>(`/suppliers/${id}/insumos`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getBoletos(
    orgId: string,
    id: string,
    query?: ListBoletosQuery
  ): Promise<SupplierBoletosResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.dataInicio) params.append("dataInicio", query.dataInicio);
    if (query?.dataFim) params.append("dataFim", query.dataFim);

    return api.get<SupplierBoletosResponse>(
      `/suppliers/${id}/boletos?${params.toString()}`,
      { headers: { "x-org-id": orgId } }
    );
  },

  async getDocumentos(orgId: string, id: string): Promise<SupplierDocumentosResponse> {
    return api.get<SupplierDocumentosResponse>(`/suppliers/${id}/documentos`, {
      headers: { "x-org-id": orgId },
    });
  },

  async createDocumento(
    orgId: string,
    id: string,
    input: CreateDocumentoInput
  ): Promise<SupplierDocumento> {
    return api.post<SupplierDocumento>(`/suppliers/${id}/documentos`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async deleteDocumento(orgId: string, id: string, docId: string): Promise<void> {
    return api.delete(`/suppliers/${id}/documentos/${docId}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async duplicate(
    orgId: string,
    id: string,
    data?: { name?: string; email?: string | null; phone?: string | null; status?: string }
  ): Promise<Supplier> {
    return api.post<Supplier>(`/suppliers/${id}/duplicate`, data || {}, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // TAGS
  // ============================================
  async listTags(orgId: string): Promise<{ tags: SupplierTag[] }> {
    return api.get<{ tags: SupplierTag[] }>("/suppliers/tags", {
      headers: { "x-org-id": orgId },
    });
  },

  async createTag(orgId: string, input: CreateSupplierTagInput): Promise<SupplierTag> {
    return api.post<SupplierTag>("/suppliers/tags", input, {
      headers: { "x-org-id": orgId },
    });
  },

  async updateTag(orgId: string, id: string, input: UpdateSupplierTagInput): Promise<SupplierTag> {
    return api.put<SupplierTag>(`/suppliers/tags/${id}`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async deleteTag(orgId: string, id: string): Promise<void> {
    return api.delete(`/suppliers/tags/${id}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async addTagToSupplier(orgId: string, supplierId: string, tagId: string): Promise<void> {
    return api.post(`/suppliers/${supplierId}/tags/${tagId}`, {}, {
      headers: { "x-org-id": orgId },
    });
  },

  async removeTagFromSupplier(orgId: string, supplierId: string, tagId: string): Promise<void> {
    return api.delete(`/suppliers/${supplierId}/tags/${tagId}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getSupplierTags(orgId: string, supplierId: string): Promise<{ tags: SupplierTag[] }> {
    return api.get<{ tags: SupplierTag[] }>(`/suppliers/${supplierId}/tags`, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // AVALIAÇÕES
  // ============================================
  async createAvaliacao(orgId: string, supplierId: string, input: CreateAvaliacaoInput): Promise<AvaliacaoSupplier> {
    return api.post<AvaliacaoSupplier>(`/suppliers/${supplierId}/avaliacoes`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async getAvaliacoes(orgId: string, supplierId: string): Promise<{ avaliacoes: AvaliacaoSupplier[]; stats: { average: number; count: number } }> {
    return api.get<{ avaliacoes: AvaliacaoSupplier[]; stats: { average: number; count: number } }>(`/suppliers/${supplierId}/avaliacoes`, {
      headers: { "x-org-id": orgId },
    });
  },

  async deleteAvaliacao(orgId: string, supplierId: string, avaliacaoId: string): Promise<void> {
    return api.delete(`/suppliers/${supplierId}/avaliacoes/${avaliacaoId}`, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // HISTÓRICO DE PREÇOS
  // ============================================
  async createHistoricoPreco(orgId: string, supplierId: string, input: CreateHistoricoPrecoInput): Promise<HistoricoPrecoSupplier> {
    return api.post<HistoricoPrecoSupplier>(`/suppliers/${supplierId}/historico-precos`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async getHistoricoPrecos(orgId: string, supplierId: string, query?: { insumoId?: string; dataInicio?: string; dataFim?: string }): Promise<{ historicos: HistoricoPrecoSupplier[] }> {
    const params = new URLSearchParams();
    if (query?.insumoId) params.append("insumoId", query.insumoId);
    if (query?.dataInicio) params.append("dataInicio", query.dataInicio);
    if (query?.dataFim) params.append("dataFim", query.dataFim);
    return api.get<{ historicos: HistoricoPrecoSupplier[] }>(`/suppliers/${supplierId}/historico-precos?${params.toString()}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async getHistoricoPrecosStats(orgId: string, supplierId: string, insumoId?: string): Promise<{ min: number; max: number; avg: number; count: number }> {
    const params = new URLSearchParams();
    if (insumoId) params.append("insumoId", insumoId);
    return api.get<{ min: number; max: number; avg: number; count: number }>(`/suppliers/${supplierId}/historico-precos/stats?${params.toString()}`, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // ALERTAS
  // ============================================
  async getAlertas(orgId: string, query?: { supplierId?: string; tipo?: string; status?: string; lido?: boolean }): Promise<{ alertas: AlertaSupplier[] }> {
    const params = new URLSearchParams();
    if (query?.supplierId) params.append("supplierId", query.supplierId);
    if (query?.tipo) params.append("tipo", query.tipo);
    if (query?.status) params.append("status", query.status);
    if (query?.lido !== undefined) params.append("lido", query.lido.toString());
    return api.get<{ alertas: AlertaSupplier[] }>(`/suppliers/alertas?${params.toString()}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async markAlertaAsRead(orgId: string, alertaId: string): Promise<AlertaSupplier> {
    return api.post<AlertaSupplier>(`/suppliers/alertas/${alertaId}/ler`, {}, {
      headers: { "x-org-id": orgId },
    });
  },

  async getUnreadAlertasCount(orgId: string, supplierId?: string): Promise<{ count: number }> {
    const params = new URLSearchParams();
    if (supplierId) params.append("supplierId", supplierId);
    return api.get<{ count: number }>(`/suppliers/alertas/nao-lidos?${params.toString()}`, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // NOTAS
  // ============================================
  async getNotas(orgId: string, supplierId: string, query?: { tipo?: string; criadoPor?: string; busca?: string }): Promise<{ notas: NotaSupplier[] }> {
    const params = new URLSearchParams();
    if (query?.tipo) params.append("tipo", query.tipo);
    if (query?.criadoPor) params.append("criadoPor", query.criadoPor);
    if (query?.busca) params.append("busca", query.busca);
    return api.get<{ notas: NotaSupplier[] }>(`/suppliers/${supplierId}/notas?${params.toString()}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async createNota(orgId: string, supplierId: string, input: CreateNotaInput): Promise<NotaSupplier> {
    return api.post<NotaSupplier>(`/suppliers/${supplierId}/notas`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async updateNota(orgId: string, supplierId: string, notaId: string, input: UpdateNotaInput): Promise<NotaSupplier> {
    return api.put<NotaSupplier>(`/suppliers/${supplierId}/notas/${notaId}`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async deleteNota(orgId: string, supplierId: string, notaId: string): Promise<void> {
    return api.delete(`/suppliers/${supplierId}/notas/${notaId}`, {
      headers: { "x-org-id": orgId },
    });
  },

  // ============================================
  // CONTATOS
  // ============================================
  async getContatos(orgId: string, supplierId: string): Promise<{ contatos: SupplierContact[] }> {
    return api.get<{ contatos: SupplierContact[] }>(`/suppliers/${supplierId}/contatos`, {
      headers: { "x-org-id": orgId },
    });
  },

  async createContato(orgId: string, supplierId: string, input: CreateContatoInput): Promise<SupplierContact> {
    return api.post<SupplierContact>(`/suppliers/${supplierId}/contatos`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async updateContato(orgId: string, supplierId: string, contactId: string, input: UpdateContatoInput): Promise<SupplierContact> {
    return api.put<SupplierContact>(`/suppliers/${supplierId}/contatos/${contactId}`, input, {
      headers: { "x-org-id": orgId },
    });
  },

  async deleteContato(orgId: string, supplierId: string, contactId: string): Promise<void> {
    return api.delete(`/suppliers/${supplierId}/contatos/${contactId}`, {
      headers: { "x-org-id": orgId },
    });
  },

  async setContatoPrincipal(orgId: string, supplierId: string, contactId: string): Promise<SupplierContact> {
    return api.post<SupplierContact>(`/suppliers/${supplierId}/contatos/${contactId}/principal`, {}, {
      headers: { "x-org-id": orgId },
    });
  },
};





