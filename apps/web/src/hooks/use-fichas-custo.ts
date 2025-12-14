"use client";

import { useCallback, useState, useEffect } from "react";
import { fichasCustoApi, type FichaCusto, type FiltroFichasCusto, type ListaFichasCustoResultado, type CreateFichaCustoInput, type UpdateFichaCustoInput, type BoletoFichaCusto, type CreateBoletoInput, type PagarBoletoInput, type ListaBoletosResultado } from "@/lib/api/fichas-custo";

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
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

export function useFichasCusto(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState<FichaCusto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const listar = useCallback(async (filtro?: FiltroFichasCusto) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.listar(currentOrgId, filtro);
      setFichas(resultado.itens);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPaginas);
      return resultado;
    } catch (error) {
      console.error("Erro ao listar fichas de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  return {
    fichas,
    total,
    totalPaginas,
    loading,
    listar,
    refresh: () => listar(),
  };
}

export function useFichaCusto(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [ficha, setFicha] = useState<FichaCusto | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(async (fichaCustoId: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.buscarPorId(currentOrgId, fichaCustoId);
      setFicha(resultado);
      return resultado;
    } catch (error) {
      console.error("Erro ao buscar ficha de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const criar = useCallback(async (input: CreateFichaCustoInput) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.criar(currentOrgId, input);
      return resultado;
    } catch (error) {
      console.error("Erro ao criar ficha de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const atualizar = useCallback(async (fichaCustoId: string, input: UpdateFichaCustoInput) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.atualizar(currentOrgId, fichaCustoId, input);
      setFicha(resultado);
      return resultado;
    } catch (error) {
      console.error("Erro ao atualizar ficha de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  const enviarParaConferencia = useCallback(async (fichaCustoId: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.enviarParaConferencia(currentOrgId, fichaCustoId);
      if (ficha) {
        setFicha({ ...ficha, status: resultado.status, dataEnvioConferencia: resultado.dataEnvioConferencia });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao enviar ficha para conferência:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  const aprovar = useCallback(async (fichaCustoId: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.aprovar(currentOrgId, fichaCustoId);
      if (ficha) {
        setFicha({ ...ficha, status: resultado.status, dataAprovacao: resultado.dataAprovacao, aprovadoPor: resultado.aprovadoPor });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao aprovar ficha de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  const reprovar = useCallback(async (fichaCustoId: string, justificativa: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.reprovar(currentOrgId, fichaCustoId, { justificativa });
      if (ficha) {
        setFicha({ ...ficha, status: resultado.status, dataReprovacao: resultado.dataReprovacao, reprovadoPor: resultado.reprovadoPor, justificativaReprovacao: resultado.justificativaReprovacao });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao reprovar ficha de custo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  const anexarBoleto = useCallback(async (fichaCustoId: string, input: CreateBoletoInput) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.anexarBoleto(currentOrgId, fichaCustoId, input);
      // Atualizar ficha se estiver carregada
      if (ficha && ficha.id === fichaCustoId) {
        setFicha({ ...ficha, boletos: [...(ficha.boletos || []), resultado.boleto] });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao anexar boleto:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  const pagarBoleto = useCallback(async (fichaCustoId: string, boletoId: string, input?: PagarBoletoInput) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.pagarBoleto(currentOrgId, fichaCustoId, boletoId, input);
      // Atualizar ficha se estiver carregada
      if (ficha && ficha.id === fichaCustoId && ficha.boletos) {
        setFicha({
          ...ficha,
          boletos: ficha.boletos.map((b) => (b.id === boletoId ? resultado.boleto : b)),
        });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao pagar boleto:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  const removerBoleto = useCallback(async (fichaCustoId: string, boletoId: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.removerBoleto(currentOrgId, fichaCustoId, boletoId);
      // Atualizar ficha se estiver carregada
      if (ficha && ficha.id === fichaCustoId && ficha.boletos) {
        setFicha({
          ...ficha,
          boletos: ficha.boletos.filter((b) => b.id !== boletoId),
        });
      }
      return resultado;
    } catch (error) {
      console.error("Erro ao remover boleto:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId, ficha]);

  return {
    ficha,
    loading,
    buscar,
    criar,
    atualizar,
    enviarParaConferencia,
    aprovar,
    reprovar,
    anexarBoleto,
    pagarBoleto,
    removerBoleto,
  };
}

/**
 * Hook para gerenciar boletos de uma ficha de custo
 */
export function useBoletosFichaCusto(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [boletos, setBoletos] = useState<BoletoFichaCusto[]>([]);
  const [total, setTotal] = useState(0);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const listar = useCallback(async (fichaCustoId: string) => {
    if (!currentOrgId) return;
    
    setLoading(true);
    try {
      const resultado = await fichasCustoApi.listarBoletos(currentOrgId, fichaCustoId);
      setBoletos(resultado.boletos);
      setTotal(resultado.total);
      return resultado;
    } catch (error) {
      console.error("Erro ao listar boletos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  return {
    boletos,
    total,
    loading,
    listar,
    refresh: (fichaCustoId: string) => listar(fichaCustoId),
  };
}
