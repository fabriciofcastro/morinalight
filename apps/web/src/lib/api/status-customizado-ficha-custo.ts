export interface StatusCustomizado {
  id: string;
  orgId: string;
  nome: string;
  cor: string;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
  criadoPor: string;
  atualizadoPor: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface CreateStatusCustomizadoInput {
  nome: string;
  cor: string;
  descricao?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateStatusCustomizadoInput {
  nome?: string;
  cor?: string;
  descricao?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface ListarStatusCustomizadosQuery {
  ativo?: boolean;
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
  ordenacaoCampo?: "nome" | "cor" | "ordem" | "createdAt";
  ordenacaoDirecao?: "asc" | "desc";
}

export interface ListarStatusCustomizadosResponse {
  status: StatusCustomizado[];
  paginacao: {
    total: number;
    pagina: number;
    tamanhoPagina: number;
    totalPaginas: number;
  };
}

class StatusCustomizadoApi {
  private baseUrl = "/api";

  async criar(orgId: string, input: CreateStatusCustomizadoInput): Promise<StatusCustomizado> {
    const response = await fetch(`${this.baseUrl}/organizations/${orgId}/fichas-custo/status-customizados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar status customizado" }));
      throw new Error(error.message || "Erro ao criar status customizado");
    }

    return response.json();
  }

  async listar(orgId: string, query?: ListarStatusCustomizadosQuery): Promise<ListarStatusCustomizadosResponse> {
    const params = new URLSearchParams();
    if (query?.ativo !== undefined) params.append("ativo", String(query.ativo));
    if (query?.busca) params.append("busca", query.busca);
    if (query?.pagina) params.append("pagina", String(query.pagina));
    if (query?.tamanhoPagina) params.append("tamanhoPagina", String(query.tamanhoPagina));
    if (query?.ordenacaoCampo) params.append("ordenacaoCampo", query.ordenacaoCampo);
    if (query?.ordenacaoDirecao) params.append("ordenacaoDirecao", query.ordenacaoDirecao);

    const url = `${this.baseUrl}/organizations/${orgId}/fichas-custo/status-customizados${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao listar status customizados" }));
      throw new Error(error.message || "Erro ao listar status customizados");
    }

    const data = await response.json();
    
    // Se a API retornar um objeto com status e paginacao, usar diretamente
    if (data.status && data.paginacao) {
      return data;
    }
    
    // Caso contrário, assumir que retornou um array
    const status = Array.isArray(data) ? data : [];
    return {
      status,
      paginacao: {
        total: status.length,
        pagina: query?.pagina || 1,
        tamanhoPagina: query?.tamanhoPagina || status.length,
        totalPaginas: 1,
      },
    };
  }

  async buscar(orgId: string, id: string): Promise<StatusCustomizado> {
    const response = await fetch(`${this.baseUrl}/organizations/${orgId}/fichas-custo/status-customizados`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar status customizado" }));
      throw new Error(error.message || "Erro ao buscar status customizado");
    }

    const status = await response.json();
    const encontrado = status.find((s: StatusCustomizado) => s.id === id);
    if (!encontrado) {
      throw new Error("Status customizado não encontrado");
    }
    return encontrado;
  }

  async atualizar(orgId: string, id: string, input: UpdateStatusCustomizadoInput): Promise<StatusCustomizado> {
    const response = await fetch(`${this.baseUrl}/organizations/${orgId}/fichas-custo/status-customizados/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar status customizado" }));
      throw new Error(error.message || "Erro ao atualizar status customizado");
    }

    return response.json();
  }

  async deletar(orgId: string, id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/organizations/${orgId}/fichas-custo/status-customizados/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao deletar status customizado" }));
      throw new Error(error.message || "Erro ao deletar status customizado");
    }
  }
}

export const statusCustomizadoApi = new StatusCustomizadoApi();

