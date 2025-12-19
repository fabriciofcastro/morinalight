import { apiClient as api } from "./base";

// ============================================
// Types
// ============================================

export type TipoInsumo = "aviamento" | "servico" | "terceirizacao" | "outros";
export type StatusFichaCusto = "rascunho" | "enviada_para_conferencia" | "aprovada" | "reprovada";
export type StatusBoleto = "pendente" | "pago" | "cancelado" | "vencido";

export interface StatusCustomizado {
  id: string;
  orgId: string;
  nome: string;
  cor: string;
  descricao?: string | null;
  ordem: number;
  ativo: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateStatusCustomizadoInput {
  nome: string;
  cor: string;
  descricao?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateStatusCustomizadoInput {
  nome?: string;
  cor?: string;
  descricao?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface Insumo {
  id?: string;
  descricao: string;
  tipo: TipoInsumo;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  fornecedorCnpj?: string | null;
  notaFiscalNumero?: string | null;
  notaFiscalData?: string | null;
  notaFiscalValor?: number | null;
  quantidade: number;
  unidadeMedida: string;
  custoUnitario: number;
  custoTotal: number;
  observacoes?: string | null;
}

export interface FichaCusto {
  id: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  nomePeca: string;
  categoria?: string | null;
  departmentId?: string | null;
  sectorId?: string | null;
  status: StatusFichaCusto;
  fotoPecaUrl?: string | null;
  totalCustos: number;
  custoFinalPeca: number;
  criadoPor: string;
  aprovadoPor?: string | null;
  reprovadoPor?: string | null;
  responsavelFinanceiro?: string | null;
  dataEnvioConferencia?: string | null;
  dataAprovacao?: string | null;
  dataReprovacao?: string | null;
  justificativaReprovacao?: string | null;
  versaoAtual: number;
  createdAt: string;
  updatedAt: string;
  insumos: Insumo[];
  boletos?: BoletoFichaCusto[];
}

export interface BoletoFichaCusto {
  id: string;
  fichaCustoId: string;
  insumoId?: string | null;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  arquivoUrl?: string | null;
  arquivoStorageKey?: string | null;
  valorBoleto: number;
  dataVencimento: string;
  codigoBarras?: string | null;
  linhaDigitavel?: string | null;
  status: StatusBoleto;
  dataPagamento?: string | null;
  observacoes?: string | null;
  anexadoPor: string;
  pagoPor?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Input Types
// ============================================

export interface CreateInsumoInput {
  descricao: string;
  tipo: TipoInsumo;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  fornecedorCnpj?: string | null;
  notaFiscalNumero?: string | null;
  notaFiscalData?: string | null;
  notaFiscalValor?: number | null;
  quantidade: number;
  unidadeMedida: string;
  custoUnitario: number;
  observacoes?: string | null;
}

export interface CreateFichaCustoInput {
  referenciaPeca: string;
  nomePeca: string;
  categoria?: string | null;
  departmentId?: string | null;
  sectorId?: string | null;
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  insumos: CreateInsumoInput[];
}

export interface UpdateFichaCustoInput {
  referenciaPeca?: string;
  nomePeca?: string;
  categoria?: string | null;
  fotoPecaUrl?: string | null;
  fotoPecaStorageKey?: string | null;
  insumos?: CreateInsumoInput[];
}

export interface FiltroFichasCusto {
  status?: StatusFichaCusto[];
  departmentId?: string;
  sectorId?: string;
  referenciaPeca?: string;
  criadoPor?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface ListaFichasCustoResultado {
  itens: FichaCusto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}

export interface ReprovarFichaCustoInput {
  justificativa: string;
}

export interface CreateBoletoInput {
  insumoId?: string | null;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  arquivoUrl?: string | null;
  arquivoStorageKey?: string | null;
  valorBoleto: number;
  dataVencimento: string;
  codigoBarras?: string | null;
  linhaDigitavel?: string | null;
  observacoes?: string | null;
}

export interface PagarBoletoInput {
  dataPagamento?: string;
}

export interface ListaBoletosResultado {
  boletos: BoletoFichaCusto[];
  total: number;
}

// ============================================
// API Client
// ============================================

export class FichasCustoApi {
  /**
   * Listar fichas de custo com filtros e paginação
   */
  async listar(orgId: string, filtro?: FiltroFichasCusto): Promise<ListaFichasCustoResultado> {
    const params = new URLSearchParams();
    
    if (filtro?.status && filtro.status.length > 0) {
      for (const s of filtro.status) {
        params.append("status", s);
      }
    }
    if (filtro?.departmentId) params.append("departmentId", filtro.departmentId);
    if (filtro?.sectorId) params.append("sectorId", filtro.sectorId);
    if (filtro?.referenciaPeca) params.append("referenciaPeca", filtro.referenciaPeca);
    if (filtro?.criadoPor) params.append("criadoPor", filtro.criadoPor);
    if (filtro?.dataInicio) params.append("dataInicio", filtro.dataInicio);
    if (filtro?.dataFim) params.append("dataFim", filtro.dataFim);
    if (filtro?.busca) params.append("busca", filtro.busca);
    if (filtro?.pagina) params.append("pagina", filtro.pagina.toString());
    if (filtro?.tamanhoPagina) params.append("tamanhoPagina", filtro.tamanhoPagina.toString());

    const queryString = params.toString();
    const url = `/organizations/${orgId}/fichas-custo${queryString ? `?${queryString}` : ""}`;
    
    return api.get<ListaFichasCustoResultado>(url);
  }

  /**
   * Buscar ficha de custo por ID
   */
  async buscarPorId(orgId: string, fichaCustoId: string): Promise<FichaCusto> {
    return api.get<FichaCusto>(`/organizations/${orgId}/fichas-custo/${fichaCustoId}`);
  }

  /**
   * Criar nova ficha de custo
   */
  async criar(orgId: string, input: CreateFichaCustoInput): Promise<FichaCusto> {
    return api.post<FichaCusto>(`/organizations/${orgId}/fichas-custo`, input);
  }

  /**
   * Atualizar ficha de custo
   */
  async atualizar(orgId: string, fichaCustoId: string, input: UpdateFichaCustoInput): Promise<FichaCusto> {
    return api.put<FichaCusto>(`/organizations/${orgId}/fichas-custo/${fichaCustoId}`, input);
  }

  /**
   * Enviar ficha para conferência (aprovação)
   */
  async enviarParaConferencia(orgId: string, fichaCustoId: string): Promise<{ fichaCustoId: string; status: StatusFichaCusto; dataEnvioConferencia: string }> {
    return api.post(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/enviar-conferencia`, {});
  }

  /**
   * Aprovar ficha de custo
   */
  async aprovar(orgId: string, fichaCustoId: string): Promise<{ fichaCustoId: string; status: StatusFichaCusto; dataAprovacao: string; aprovadoPor: string }> {
    return api.post(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/approve`, {});
  }

  /**
   * Reprovar ficha de custo
   */
  async reprovar(orgId: string, fichaCustoId: string, input: ReprovarFichaCustoInput): Promise<{ fichaCustoId: string; status: StatusFichaCusto; dataReprovacao: string; reprovadoPor: string; justificativaReprovacao: string }> {
    return api.post(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/reject`, input);
  }

  /**
   * Anexar boleto a uma ficha de custo
   */
  async anexarBoleto(orgId: string, fichaCustoId: string, input: CreateBoletoInput): Promise<{ boleto: BoletoFichaCusto }> {
    return api.post(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/boletos`, input);
  }

  /**
   * Listar boletos de uma ficha de custo
   */
  async listarBoletos(orgId: string, fichaCustoId: string): Promise<ListaBoletosResultado> {
    return api.get(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/boletos`);
  }

  /**
   * Pagar boleto
   */
  async pagarBoleto(orgId: string, fichaCustoId: string, boletoId: string, input?: PagarBoletoInput): Promise<{ boleto: BoletoFichaCusto }> {
    return api.post(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/boletos/${boletoId}/pagar`, input || {});
  }

  /**
   * Remover boleto
   */
  async removerBoleto(orgId: string, fichaCustoId: string, boletoId: string): Promise<{ sucesso: boolean; boletoRemovido: string }> {
    return api.delete(`/organizations/${orgId}/fichas-custo/${fichaCustoId}/boletos/${boletoId}`);
  }

  // ============================================
  // Status Customizados
  // ============================================

  /**
   * Listar status customizados
   */
  async listarStatusCustomizados(orgId: string): Promise<StatusCustomizado[]> {
    return api.get<StatusCustomizado[]>(`/organizations/${orgId}/fichas-custo/status-customizados`);
  }

  /**
   * Criar status customizado
   */
  async criarStatusCustomizado(orgId: string, input: CreateStatusCustomizadoInput): Promise<StatusCustomizado> {
    return api.post<StatusCustomizado>(`/organizations/${orgId}/fichas-custo/status-customizados`, input);
  }

  /**
   * Atualizar status customizado
   */
  async atualizarStatusCustomizado(
    orgId: string,
    statusId: string,
    input: UpdateStatusCustomizadoInput,
  ): Promise<StatusCustomizado> {
    return api.put<StatusCustomizado>(`/organizations/${orgId}/fichas-custo/status-customizados/${statusId}`, input);
  }

  /**
   * Excluir status customizado
   */
  async excluirStatusCustomizado(orgId: string, statusId: string): Promise<{ message: string }> {
    return api.delete(`/organizations/${orgId}/fichas-custo/status-customizados/${statusId}`);
  }
}

export const fichasCustoApi = new FichasCustoApi();
