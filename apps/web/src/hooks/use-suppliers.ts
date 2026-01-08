import {
    suppliersApi,
    type AlertaSupplier,
    type AuditoriaSupplier,
    type AvaliacaoSupplier,
    type CreateAvaliacaoInput,
    type CreateContatoInput,
    type CreateDocumentoInput,
    type CreateHistoricoPrecoInput,
    type CreateNotaInput,
    type CreateSupplierInput,
    type CreateSupplierTagInput,
    type HistoricoPrecoSupplier,
    type ListAuditoriaQuery,
    type ListBoletosQuery,
    type ListFichasCustoQuery,
    type ListSuppliersQuery,
    type NotaSupplier,
    type Supplier,
    type SupplierBoletosResponse,
    type SupplierContact,
    type SupplierDocumentosResponse,
    type SupplierEstatisticas,
    type SupplierFichasCustoResponse,
    type SupplierInsumosResponse,
    type SupplierTag,
    type UpdateContatoInput,
    type UpdateNotaInput,
    type UpdateSupplierInput,
    type UpdateSupplierTagInput,
    type VersaoSupplier
} from "@/lib/api/suppliers";
import { useCallback, useEffect, useState } from "react";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0]!.organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

export function useSuppliers(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(20);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const listar = useCallback(async (filtro?: ListSuppliersQuery) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await suppliersApi.list(currentOrgId, {
        ...filtro,
        pagina: filtro?.pagina || pagina,
        tamanhoPagina: filtro?.tamanhoPagina || tamanhoPagina,
      });
      setSuppliers(resultado.itens);
      setTotal(resultado.total);
      setPagina(resultado.pagina);
      setTamanhoPagina(resultado.tamanhoPagina);
      setTotalPaginas(resultado.totalPaginas);
      return resultado;
    } catch (error) {
      console.error("Erro ao listar fornecedores:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, pagina, tamanhoPagina]);

  return {
    suppliers,
    total,
    pagina,
    tamanhoPagina,
    totalPaginas,
    loading,
    listar,
    setPagina,
    setTamanhoPagina,
    refresh: () => listar(),
  };
}

export function useSupplier(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const criar = useCallback(async (input: CreateSupplierInput): Promise<Supplier> => {
    if (!currentOrgId) throw new Error("OrgId não encontrado");
    
    setLoading(true);
    try {
      const result = await suppliersApi.create(currentOrgId, input);
      return result;
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const atualizar = useCallback(async (id: string, input: UpdateSupplierInput): Promise<Supplier> => {
    if (!currentOrgId) throw new Error("OrgId não encontrado");
    
    setLoading(true);
    try {
      const result = await suppliersApi.update(currentOrgId, id, input);
      setSupplier(result);
      return result;
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const buscarPorId = useCallback(async (id: string): Promise<Supplier> => {
    if (!currentOrgId) {
      const err = "OrgId não encontrado";
      setError(err);
      throw new Error(err);
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await suppliersApi.getById(currentOrgId, id);
      setSupplier(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar fornecedor";
      setError(errorMessage);
      console.error("Erro ao buscar fornecedor:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const deletar = useCallback(async (id: string): Promise<void> => {
    if (!currentOrgId) throw new Error("OrgId não encontrado");
    
    setLoading(true);
    try {
      await suppliersApi.delete(currentOrgId, id);
      setSupplier(null);
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  return {
    supplier,
    loading,
    error,
    criar,
    atualizar,
    buscarPorId,
    deletar,
  };
}

export function useSupplierAuditoria(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [auditoria, setAuditoria] = useState<AuditoriaSupplier[]>([]);
  const [proximoCursor, setProximoCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (filtro?: ListAuditoriaQuery) => {
      if (!currentOrgId || !supplierId) return;

      setLoading(true);
      setError(null);
      try {
        const resultado = await suppliersApi.getAuditoria(currentOrgId, supplierId, filtro);
        setAuditoria(resultado.itens);
        setProximoCursor(resultado.proximoCursor);
        return resultado;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao buscar auditoria";
        setError(errorMessage);
        console.error("Erro ao buscar auditoria:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  return {
    auditoria,
    loading,
    error,
    proximoCursor,
    buscar,
    refresh: () => buscar(),
  };
}

export function useSupplierVersoes(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [versoes, setVersoes] = useState<VersaoSupplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const resultado = await suppliersApi.getVersoes(currentOrgId, supplierId);
      setVersoes(resultado.versoes);
      return resultado;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar versões";
      setError(errorMessage);
      console.error("Erro ao buscar versões:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  return {
    versoes,
    loading,
    error,
    buscar,
    refresh: buscar,
  };
}

export function useSupplierEstatisticas(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<SupplierEstatisticas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const resultado = await suppliersApi.getEstatisticas(currentOrgId, supplierId);
      setEstatisticas(resultado);
      return resultado;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar estatísticas";
      setError(errorMessage);
      console.error("Erro ao buscar estatísticas:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  return {
    estatisticas,
    loading,
    error,
    buscar,
    refresh: buscar,
  };
}

export function useSupplierFichasCusto(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState<SupplierFichasCustoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (query?: ListFichasCustoQuery) => {
      if (!currentOrgId || !supplierId) return;

      setLoading(true);
      setError(null);
      try {
        const resultado = await suppliersApi.getFichasCusto(currentOrgId, supplierId, query);
        setFichas(resultado);
        return resultado;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao buscar fichas de custo";
        setError(errorMessage);
        console.error("Erro ao buscar fichas de custo:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  return {
    fichas,
    loading,
    error,
    buscar,
    refresh: () => buscar(),
  };
}

export function useSupplierInsumos(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [insumos, setInsumos] = useState<SupplierInsumosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const resultado = await suppliersApi.getInsumos(currentOrgId, supplierId);
      setInsumos(resultado);
      return resultado;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar insumos";
      setError(errorMessage);
      console.error("Erro ao buscar insumos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  return {
    insumos,
    loading,
    error,
    buscar,
    refresh: buscar,
  };
}

export function useSupplierBoletos(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [boletos, setBoletos] = useState<SupplierBoletosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (query?: ListBoletosQuery) => {
      if (!currentOrgId || !supplierId) return;

      setLoading(true);
      setError(null);
      try {
        const resultado = await suppliersApi.getBoletos(currentOrgId, supplierId, query);
        setBoletos(resultado);
        return resultado;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao buscar boletos";
        setError(errorMessage);
        console.error("Erro ao buscar boletos:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  return {
    boletos,
    loading,
    error,
    buscar,
    refresh: () => buscar(),
  };
}

export function useSupplierDocumentos(supplierId: string, orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [documentos, setDocumentos] = useState<SupplierDocumentosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const resultado = await suppliersApi.getDocumentos(currentOrgId, supplierId);
      setDocumentos(resultado);
      return resultado;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar documentos";
      setError(errorMessage);
      console.error("Erro ao buscar documentos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  const criar = useCallback(
    async (input: CreateDocumentoInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.createDocumento(currentOrgId, supplierId, input);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao criar documento:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const deletar = useCallback(
    async (docId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        await suppliersApi.deleteDocumento(currentOrgId, supplierId, docId);
        await buscar(); // Atualizar lista
      } catch (error) {
        console.error("Erro ao deletar documento:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return {
    documentos,
    loading,
    error,
    buscar,
    criar,
    deletar,
    refresh: buscar,
  };
}

// ============================================
// TAGS
// ============================================
export function useSupplierTags(orgId?: string) {
  const [tags, setTags] = useState<SupplierTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await suppliersApi.listTags(currentOrgId);
      setTags(result.tags);
      return result.tags;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar tags";
      setError(errorMessage);
      console.error("Erro ao buscar tags:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const criar = useCallback(
    async (input: CreateSupplierTagInput) => {
      if (!currentOrgId) throw new Error("OrgId não encontrado");
      setLoading(true);
      setError(null);
      try {
        const tag = await suppliersApi.createTag(currentOrgId, input);
        void buscar();
        return tag;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar tag";
        setError(errorMessage);
        console.error("Erro ao criar tag:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, buscar],
  );

  const atualizar = useCallback(
    async (id: string, input: UpdateSupplierTagInput) => {
      if (!currentOrgId) throw new Error("OrgId não encontrado");
      setLoading(true);
      setError(null);
      try {
        const tag = await suppliersApi.updateTag(currentOrgId, id, input);
        void buscar();
        return tag;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar tag";
        setError(errorMessage);
        console.error("Erro ao atualizar tag:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, buscar],
  );

  const deletar = useCallback(
    async (id: string) => {
      if (!currentOrgId) throw new Error("OrgId não encontrado");
      setLoading(true);
      setError(null);
      try {
        await suppliersApi.deleteTag(currentOrgId, id);
        void buscar();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao deletar tag";
        setError(errorMessage);
        console.error("Erro ao deletar tag:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, buscar],
  );

  return { tags, loading, error, buscar, criar, atualizar, deletar, refresh: buscar };
}

export function useSupplierTagsRelation(supplierId: string, orgId?: string) {
  const [tags, setTags] = useState<SupplierTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await suppliersApi.getSupplierTags(currentOrgId, supplierId);
      setTags(result.tags);
      return result.tags;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar tags do fornecedor";
      setError(errorMessage);
      console.error("Erro ao buscar tags do fornecedor:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  const adicionar = useCallback(
    async (tagId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");
      setLoading(true);
      setError(null);
      try {
        await suppliersApi.addTagToSupplier(currentOrgId, supplierId, tagId);
        void buscar();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao adicionar tag";
        setError(errorMessage);
        console.error("Erro ao adicionar tag:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const remover = useCallback(
    async (tagId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");
      setLoading(true);
      setError(null);
      try {
        await suppliersApi.removeTagFromSupplier(currentOrgId, supplierId, tagId);
        void buscar();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao remover tag";
        setError(errorMessage);
        console.error("Erro ao remover tag:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return { tags, loading, error, buscar, adicionar, remover, refresh: buscar };
}

// ============================================
// AVALIAÇÕES
// ============================================
export function useSupplierAvaliacoes(supplierId: string, orgId?: string) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoSupplier[]>([]);
  const [stats, setStats] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await suppliersApi.getAvaliacoes(currentOrgId, supplierId);
      setAvaliacoes(result.avaliacoes);
      setStats(result.stats);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar avaliações";
      setError(errorMessage);
      console.error("Erro ao buscar avaliações:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  const criar = useCallback(
    async (input: CreateAvaliacaoInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");
      setLoading(true);
      setError(null);
      try {
        const avaliacao = await suppliersApi.createAvaliacao(currentOrgId, supplierId, input);
        void buscar();
        return avaliacao;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar avaliação";
        setError(errorMessage);
        console.error("Erro ao criar avaliação:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const deletar = useCallback(
    async (avaliacaoId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");
      setLoading(true);
      setError(null);
      try {
        await suppliersApi.deleteAvaliacao(currentOrgId, supplierId, avaliacaoId);
        void buscar();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao deletar avaliação";
        setError(errorMessage);
        console.error("Erro ao deletar avaliação:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return { avaliacoes, stats, loading, error, buscar, criar, deletar, refresh: buscar };
}

// ============================================
// HISTÓRICO DE PREÇOS
// ============================================
export function useSupplierHistoricoPrecos(supplierId: string, orgId?: string) {
  const [historicos, setHistoricos] = useState<HistoricoPrecoSupplier[]>([]);
  const [stats, setStats] = useState<{ min: number; max: number; avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (filtros?: { insumoId?: string; dataInicio?: string; dataFim?: string }) => {
      if (!currentOrgId || !supplierId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await suppliersApi.getHistoricoPrecos(currentOrgId, supplierId, filtros);
        setHistoricos(result.historicos);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao buscar histórico de preços";
        setError(errorMessage);
        console.error("Erro ao buscar histórico de preços:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  const buscarStats = useCallback(
    async (insumoId?: string) => {
      if (!currentOrgId || !supplierId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await suppliersApi.getHistoricoPrecosStats(currentOrgId, supplierId, insumoId);
        setStats(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao buscar estatísticas de preços";
        setError(errorMessage);
        console.error("Erro ao buscar estatísticas de preços:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  const criar = useCallback(
    async (input: CreateHistoricoPrecoInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");
      setLoading(true);
      setError(null);
      try {
        const historico = await suppliersApi.createHistoricoPreco(currentOrgId, supplierId, input);
        void buscar();
        return historico;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar histórico de preço";
        setError(errorMessage);
        console.error("Erro ao criar histórico de preço:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return { historicos, stats, loading, error, buscar, buscarStats, criar, refresh: buscar };
}

// ============================================
// ALERTAS
// ============================================
export function useSupplierAlertas(orgId?: string) {
  const [alertas, setAlertas] = useState<AlertaSupplier[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (filtros?: { supplierId?: string; tipo?: string; status?: string; lido?: boolean }) => {
      if (!currentOrgId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await suppliersApi.getAlertas(currentOrgId, filtros);
        setAlertas(result.alertas);
        return result.alertas;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao buscar alertas";
        setError(errorMessage);
        console.error("Erro ao buscar alertas:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  const buscarUnreadCount = useCallback(
    async (supplierId?: string) => {
      if (!currentOrgId) return;
      try {
        const result = await suppliersApi.getUnreadAlertasCount(currentOrgId, supplierId);
        setUnreadCount(result.count);
        return result.count;
      } catch (err) {
        console.error("Erro ao buscar contagem de alertas não lidos:", err);
        return 0;
      }
    },
    [currentOrgId],
  );

  const marcarComoLido = useCallback(
    async (alertaId: string) => {
      if (!currentOrgId) throw new Error("OrgId não encontrado");
      setLoading(true);
      setError(null);
      try {
        const alerta = await suppliersApi.markAlertaAsRead(currentOrgId, alertaId);
        void buscar();
        void buscarUnreadCount();
        return alerta;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao marcar alerta como lido";
        setError(errorMessage);
        console.error("Erro ao marcar alerta como lido:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, buscar, buscarUnreadCount],
  );

  return { alertas, unreadCount, loading, error, buscar, buscarUnreadCount, marcarComoLido, refresh: buscar };
}

// ============================================
// NOTAS
// ============================================
export function useSupplierNotas(supplierId: string, orgId?: string) {
  const [notas, setNotas] = useState<NotaSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (filters?: { tipo?: string; criadoPor?: string; busca?: string }) => {
      if (!currentOrgId || !supplierId) return;

      setLoading(true);
      setError(null);
      try {
        const resultado = await suppliersApi.getNotas(currentOrgId, supplierId, filters);
        setNotas(resultado.notas);
        return resultado;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao buscar notas";
        setError(errorMessage);
        console.error("Erro ao buscar notas:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId],
  );

  const criar = useCallback(
    async (input: CreateNotaInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.createNota(currentOrgId, supplierId, input);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao criar nota:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const atualizar = useCallback(
    async (notaId: string, input: UpdateNotaInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.updateNota(currentOrgId, supplierId, notaId, input);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao atualizar nota:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const deletar = useCallback(
    async (notaId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        await suppliersApi.deleteNota(currentOrgId, supplierId, notaId);
        await buscar(); // Atualizar lista
      } catch (error) {
        console.error("Erro ao deletar nota:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return {
    notas,
    loading,
    error,
    buscar,
    criar,
    atualizar,
    deletar,
    refresh: buscar,
  };
}

export function useSupplierContatos(supplierId: string | null) {
  const currentOrgId = getCurrentOrgId();
  const [contatos, setContatos] = useState<SupplierContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    if (!currentOrgId || !supplierId) return;

    setLoading(true);
    setError(null);
    try {
      const resultado = await suppliersApi.getContatos(currentOrgId, supplierId);
      setContatos(resultado.contatos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar contatos";
      setError(errorMessage);
      console.error("Erro ao buscar contatos:", err);
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, supplierId]);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  const criar = useCallback(
    async (input: CreateContatoInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.createContato(currentOrgId, supplierId, input);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao criar contato:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const atualizar = useCallback(
    async (contactId: string, input: UpdateContatoInput) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.updateContato(currentOrgId, supplierId, contactId, input);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao atualizar contato:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const deletar = useCallback(
    async (contactId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        await suppliersApi.deleteContato(currentOrgId, supplierId, contactId);
        await buscar(); // Atualizar lista
      } catch (error) {
        console.error("Erro ao deletar contato:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  const setPrincipal = useCallback(
    async (contactId: string) => {
      if (!currentOrgId || !supplierId) throw new Error("OrgId ou SupplierId não encontrado");

      setLoading(true);
      try {
        const resultado = await suppliersApi.setContatoPrincipal(currentOrgId, supplierId, contactId);
        await buscar(); // Atualizar lista
        return resultado;
      } catch (error) {
        console.error("Erro ao definir contato principal:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, supplierId, buscar],
  );

  return {
    contatos,
    loading,
    error,
    buscar,
    criar,
    atualizar,
    deletar,
    setPrincipal,
    refresh: buscar,
  };
}




