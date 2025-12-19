"use client";

import { useCallback, useState } from "react";
import {
  listarPreFichasTecnicas,
  buscarPreFichaTecnica,
  criarPreFichaTecnica,
  submeterPreFichaTecnica,
  aprovarTecnicamentePreFichaTecnica,
  reprovarPreFichaTecnica,
  aprovarDiretoriaPreFichaTecnica,
  type PreFichaTecnica,
  type CreatePreFichaTecnicaInput,
} from "@/lib/api/pre-fichas-tecnicas";

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

export function usePreFichasTecnicas(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [preFichas, setPreFichas] = useState<PreFichaTecnica[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const listar = useCallback(
    async (filtros?: {
      pagina?: number;
      tamanhoPagina?: number;
      status?: string[];
      categoria?: string;
      codigoPeca?: string;
      busca?: string;
    }) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await listarPreFichasTecnicas(currentOrgId, filtros);
        setPreFichas(resultado.itens);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPaginas);
        return resultado;
      } catch (error) {
        console.error("Erro ao listar pré-fichas técnicas:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  return {
    preFichas,
    total,
    totalPaginas,
    loading,
    listar,
    refresh: () => listar(),
  };
}

export function usePreFichaTecnica(orgId?: string) {
  const [loading, setLoading] = useState(false);
  const [preFicha, setPreFicha] = useState<PreFichaTecnica | null>(null);
  const currentOrgId = orgId || getCurrentOrgId() || "";

  const buscar = useCallback(
    async (preFichaTecnicaId: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await buscarPreFichaTecnica(currentOrgId, preFichaTecnicaId);
        setPreFicha(resultado);
        return resultado;
      } catch (error) {
        console.error("Erro ao buscar pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  const criar = useCallback(
    async (input: CreatePreFichaTecnicaInput) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await criarPreFichaTecnica(currentOrgId, input);
        return resultado;
      } catch (error) {
        console.error("Erro ao criar pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  const submeter = useCallback(
    async (preFichaTecnicaId: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await submeterPreFichaTecnica(currentOrgId, preFichaTecnicaId);
        if (preFicha) {
          setPreFicha({ ...preFicha, status: resultado.status });
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao submeter pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const aprovarTecnicamente = useCallback(
    async (preFichaTecnicaId: string, aprovadorNome: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await aprovarTecnicamentePreFichaTecnica(
          currentOrgId,
          preFichaTecnicaId,
          aprovadorNome,
        );
        if (preFicha) {
          setPreFicha({ ...preFicha, status: resultado.status });
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao aprovar tecnicamente pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const reprovar = useCallback(
    async (preFichaTecnicaId: string, justificativa: string, reprovadorNome?: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await reprovarPreFichaTecnica(
          currentOrgId,
          preFichaTecnicaId,
          justificativa,
          reprovadorNome,
        );
        if (preFicha) {
          setPreFicha({ ...preFicha, status: resultado.status });
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao reprovar pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const aprovarDiretoria = useCallback(
    async (preFichaTecnicaId: string, aprovadorNome: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await aprovarDiretoriaPreFichaTecnica(
          currentOrgId,
          preFichaTecnicaId,
          aprovadorNome,
        );
        if (preFicha) {
          setPreFicha({ ...preFicha, status: resultado.status });
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao aprovar pela diretoria pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const atualizar = useCallback(
    async (preFichaTecnicaId: string, input: UpdatePreFichaTecnicaInput & { motivoAlteracao?: string }) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await atualizarPreFichaTecnica(currentOrgId, preFichaTecnicaId, input);
        if (preFicha && preFicha.id === preFichaTecnicaId) {
          const updated = await buscarPreFichaTecnica(currentOrgId, preFichaTecnicaId);
          setPreFicha(updated);
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao atualizar pré-ficha técnica:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const atualizarChecklist = useCallback(
    async (
      preFichaTecnicaId: string,
      checklist: {
        moldeVesteCorretamente?: boolean;
        costuraViavel?: boolean;
        insumosCompatíveis?: boolean;
        pecaPilotoAprovadaVisualmente?: boolean;
      },
    ) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await atualizarChecklistTecnico(currentOrgId, preFichaTecnicaId, checklist);
        if (preFicha && preFicha.id === preFichaTecnicaId) {
          const updated = await buscarPreFichaTecnica(currentOrgId, preFichaTecnicaId);
          setPreFicha(updated);
        }
        return resultado;
      } catch (error) {
        console.error("Erro ao atualizar checklist técnico:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId, preFicha],
  );

  const exportarPdf = useCallback(
    async (preFichaTecnicaId: string) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const html = await exportarPdfPreFichaTecnica(currentOrgId, preFichaTecnicaId);
        // Abrir em nova janela para impressão
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        return html;
      } catch (error) {
        console.error("Erro ao exportar PDF:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  const compararVersoes = useCallback(
    async (preFichaTecnicaId: string, versao1?: number, versao2?: number) => {
      if (!currentOrgId) return;

      setLoading(true);
      try {
        const resultado = await compararVersoesPreFichaTecnica(
          currentOrgId,
          preFichaTecnicaId,
          versao1,
          versao2,
        );
        return resultado;
      } catch (error) {
        console.error("Erro ao comparar versões:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentOrgId],
  );

  return {
    preFicha,
    loading,
    buscar,
    criar,
    atualizar,
    submeter,
    aprovarTecnicamente,
    reprovar,
    aprovarDiretoria,
    atualizarChecklist,
    exportarPdf,
    compararVersoes,
  };
}












