"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { useFornecedoresBulkActions } from "@/hooks/use-fornecedores-bulk-actions";
import { useFornecedoresFilters } from "@/hooks/use-fornecedores-filters";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { Insumo } from "@/lib/api/fichas-custo";
import { fichasCustoApi } from "@/lib/api/fichas-custo";
import type { ListSuppliersQuery, Supplier } from "@/lib/api/suppliers";
import {
  exportSuppliersToCSV,
  exportSuppliersToExcel,
  exportSuppliersToJSON,
  exportSupplierToPDF,
} from "@/lib/utils/export-suppliers";
import { Button, ListPageLayout, StatCard, StatsGroup, ViewToggle } from "@morina/ui";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Building2, CheckCircle2, Filter, Plus, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FornecedoresBulkActions } from "./components/fornecedores-bulk-actions";
import { FornecedoresGrid } from "./components/fornecedores-grid";
import { FornecedoresList } from "./components/fornecedores-list";
import type { FornecedorFichaCusto, FornecedorItem } from "./components/types";

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

export function FornecedoresListClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const queryClient = useQueryClient();

  // Hooks customizados
  const filtersHook = useFornecedoresFilters();
  const { filters } = filtersHook;

  const bulkActionsHook = useFornecedoresBulkActions(orgId, () => {
    // Callback de sucesso para recarregar dados
    void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    void loadFornecedores();
  });

  // Estado para paginação e dados
  const { suppliers, total, pagina, tamanhoPagina, totalPaginas, loading, listar, setPagina, setTamanhoPagina } = useSuppliers(orgId);
  const [fornecedoresFichasCusto, setFornecedoresFichasCusto] = useState<FornecedorFichaCusto[]>([]);
  const [loadingFichasCusto, setLoadingFichasCusto] = useState(false);

  // Carregar fornecedores de fichas-custo
  const carregarFornecedoresFichasCusto = useCallback(async () => {
    if (!orgId) return;

    setLoadingFichasCusto(true);
    try {
      // Buscar todas as fichas de custo
      const resultado = await fichasCustoApi.listar(orgId, { pagina: 1, tamanhoPagina: 1000 });

      // Extrair fornecedores únicos dos insumos
      const fornecedoresMap = new Map<string, FornecedorFichaCusto>();

      resultado.itens.forEach((ficha) => {
        ficha.insumos.forEach((insumo: Insumo) => {
          if (insumo.fornecedorNome && !insumo.fornecedorId) {
            const nomeNormalizado = insumo.fornecedorNome.trim().toLowerCase();
            if (!fornecedoresMap.has(nomeNormalizado)) {
              fornecedoresMap.set(nomeNormalizado, {
                id: `ficha-custo-${nomeNormalizado.replace(/\s+/g, "-")}`,
                name: insumo.fornecedorNome.trim(),
                email: null,
                phone: null,
                document: insumo.fornecedorCnpj || null,
                address: null,
                city: null,
                state: null,
                zipCode: null,
                status: "ativo",
                notes: null,
                createdBy: "sistema",
                updatedBy: "sistema",
                createdAt: ficha.createdAt,
                updatedAt: ficha.updatedAt,
                // orgId: ficha.orgId, 
                origem: "ficha-custo",
              });
            }
          }
        });
      });

      setFornecedoresFichasCusto(Array.from(fornecedoresMap.values()));
    } catch (error) {
      console.error("Erro ao carregar fornecedores de fichas-custo:", error);
    } finally {
      setLoadingFichasCusto(false);
    }
  }, [orgId]);

  // Combinar fornecedores cadastrados com fornecedores de fichas-custo
  const fornecedoresCompletos = useMemo<FornecedorItem[]>(() => {
    const todos: FornecedorItem[] = [...suppliers];

    // Adicionar fornecedores de fichas-custo que não estão cadastrados
    fornecedoresFichasCusto.forEach((fornecedorFC) => {
      const jaExiste = suppliers.some(
        (s) => s.name.toLowerCase() === fornecedorFC.name.toLowerCase()
      );
      if (!jaExiste) {
        todos.push(fornecedorFC);
      }
    });

    return todos;
  }, [suppliers, fornecedoresFichasCusto]);

  // Carregar dados com filtros do servidor
  const loadFornecedores = useCallback(async () => {
    if (!orgId) return;

    const filtroQuery: ListSuppliersQuery = {
      pagina,
      tamanhoPagina,
      ordenarPor: filters.sorting.field,
      ordem: filters.sorting.order,
    };

    if (filters.status !== "all") {
      filtroQuery.status = filters.status;
    }

    // Se houver filtros específicos, usar apenas eles (busca avançada)
    // Caso contrário, usar busca geral
    const { advanced, debouncedSearch } = filters;
    const hasAdvancedFilters = Object.values(advanced).some(v => !!v);

    if (hasAdvancedFilters) {
      if (advanced.documento) filtroQuery.documento = advanced.documento;
      if (advanced.cidade) filtroQuery.cidade = advanced.cidade;
      if (advanced.estado) filtroQuery.estado = advanced.estado;
      if (advanced.email) filtroQuery.email = advanced.email;
      if (advanced.telefone) filtroQuery.telefone = advanced.telefone;
    } else if (debouncedSearch) {
      filtroQuery.busca = debouncedSearch;
    }

    await listar(filtroQuery);
    await carregarFornecedoresFichasCusto();
  }, [listar, filters, orgId, carregarFornecedoresFichasCusto, pagina, tamanhoPagina]);

  useEffect(() => {
    if (orgId) {
      void loadFornecedores();
    }
  }, [loadFornecedores, orgId]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    if (pagina > 1) {
      setPagina(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.debouncedSearch, filters.sorting, setPagina]);

  // Filtrar fornecedores (apenas fornecedores de fichas-custo client-side e data)
  const fornecedoresFiltrados = useMemo(() => {
    let filtrados = fornecedoresCompletos;

    // Filtro de data (client-side para todos ou ajustado conforme API)
    // A API já filtra dados do servidor, mas precisamos filtrar os de ficha-custo e aplicar filtro de data se a API não suportar range
    const { dataInicio, dataFim } = filters.advanced;

    if (dataInicio || dataFim) {
      filtrados = filtrados.filter((f) => {
        const dataCriacao = new Date(f.createdAt);
        if (dataInicio && dataCriacao < new Date(dataInicio)) return false;
        if (dataFim && dataCriacao > new Date(dataFim)) return false;
        return true;
      });
    }

    return filtrados;
  }, [fornecedoresCompletos, filters.advanced]);

  // Exportação em massa
  const handleBulkExport = useCallback(() => {
    if (bulkActionsHook.selected.size === 0) return;

    const fornecedoresSelecionados = fornecedoresCompletos.filter((f) =>
      bulkActionsHook.selected.has(f.id) && "orgId" in f
    ) as Supplier[]; // Cast since we filter non-registered ones next check

    if (fornecedoresSelecionados.length === 0) {
      notificationCenter.add({
        type: "warning",
        title: "Aviso",
        message: "Apenas fornecedores cadastrados podem ser exportados.",
      });
      return;
    }

    // Try to auto-select CSV if not prompting, but original had prompt.
    // Simplifying to CSV for bulk action shortcut or keep prompt if desired.
    // Keeping prompt as per original.
    const format = window.prompt("Escolha o formato:\n1 - CSV\n2 - Excel\n3 - PDF (primeiro fornecedor)\n4 - JSON");

    try {
      if (format === "1") {
        exportSuppliersToCSV(fornecedoresSelecionados);
      } else if (format === "2") {
        exportSuppliersToExcel(fornecedoresSelecionados);
      } else if (format === "3") {
        if (fornecedoresSelecionados.length > 0) {
          exportSupplierToPDF(fornecedoresSelecionados[0]!);
        }
      } else if (format === "4") {
        exportSuppliersToJSON(fornecedoresSelecionados);
      }

      if (["1", "2", "3", "4"].includes(format || "")) {
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fornecedoresSelecionados.length} fornecedor(es) processado(s).`,
        });
      }
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao exportar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [bulkActionsHook.selected, fornecedoresCompletos]);

  // Stats
  const stats = {
    total: total + fornecedoresFichasCusto.length,
    ativos: suppliers.filter((f) => f.status === "ativo").length,
    inativos: suppliers.filter((f) => f.status === "inativo").length,
    fichasCusto: fornecedoresFichasCusto.length,
  };

  return (
    <ListPageLayout
      header={{
        icon: Building2,
        title: "Fornecedores",
        description: "Gestão Avançada de Cadeia de Suprimentos",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Fornecedores", href: "/fornecedores" },
          { label: "Gestão", href: "/fornecedores" },
        ],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard
              icon={Building2}
              label="Total"
              value={stats.total}
              variant="primary"
              subtitle="Fornecedores cadastrados"
            />
            <StatCard
              icon={CheckCircle2}
              label="Ativos"
              value={stats.ativos}
              variant="success"
              subtitle={`${Math.round((stats.ativos / (stats.total || 1)) * 100)}% do total`}
            />
            <StatCard
              icon={XCircle}
              label="Inativos"
              value={stats.inativos}
              variant="danger"
              subtitle={`${Math.round((stats.inativos / (stats.total || 1)) * 100)}% do total`}
            />
            {stats.fichasCusto > 0 && (
              <StatCard
                icon={AlertCircle}
                label="Fichas-Custo"
                value={stats.fichasCusto}
                variant="warning"
              />
            )}
          </StatsGroup>
        ),
      }}
      controls={{
        searchValue: filtersHook.filters.search,
        onSearchChange: filtersHook.setSearch,
        searchPlaceholder: "Buscar por nome, documento ou email...",
        hasSelection: bulkActionsHook.selected.size > 0,
        bulkActions: (
          <FornecedoresBulkActions
            bulkActions={bulkActionsHook}
            total={total}
            onExport={handleBulkExport}
          />
        ),
        filterButton: (
          <Button
            variant={filtersHook.filters.showAdvanced ? "default" : "outline"}
            onClick={filtersHook.toggleAdvanced}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        ),
        viewToggle: (
          <ViewToggle
            value={filtersHook.filters.viewMode}
            onChange={(v) => filtersHook.setViewMode(v as "grid" | "list")}

          />
        ),
        actions: (
          <Button onClick={() => router.push("/fornecedores/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        ),
      }}
      pagination={{
        total: total + fornecedoresFichasCusto.length,
        page: pagina,
        pageSize: tamanhoPagina,
        onPageChange: setPagina,
        onPageSizeChange: setTamanhoPagina,
        showPageSize: true,
        showFirstLast: true,
      }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[hsl(var(--primary))] rounded-full animate-spin mb-4" />
          <p className="text-white/40 font-mono animate-pulse">CARREGANDO DADOS DO SISTEMA...</p>
        </div>
      ) : (
        <>
          {filtersHook.filters.viewMode === "grid" ? (
            <FornecedoresGrid
              data={fornecedoresFiltrados}
              loading={loading}
              bulkActions={bulkActionsHook}
            />
          ) : (
            <FornecedoresList
              data={fornecedoresFiltrados}
              loading={loading}
              bulkActions={bulkActionsHook}
            />
          )}
        </>
      )}
    </ListPageLayout>
  );
}
