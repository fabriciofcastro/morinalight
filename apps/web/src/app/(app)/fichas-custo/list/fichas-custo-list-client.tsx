"use client";

import { DuplicarFichaModal } from "@/components/fichas-custo/DuplicarFichaModal";
import { FiltrosPresetsModal } from "@/components/fichas-custo/FiltrosPresetsModal";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { FichaGridSkeleton, FichaListSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useFichasCusto } from "@/hooks/use-fichas-custo";
import type { FichaCusto, FiltroFichasCusto, StatusFichaCusto } from "@/lib/api/fichas-custo";
import { exportFichasToCSV, exportFichasToExcel, exportFichasToJSON, exportFichasToPDF } from "@/lib/utils/export-fichas-custo";
import {
  Badge,
  BulkActionsBar,
  Button,
  DataTable,
  ListPageLayout,
  StatCard,
  StatsGroup,
  ViewToggle,
  cn,
} from "@morina/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Trash2,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type FiltroStatus = "all" | StatusFichaCusto;

const getStatusBadgeStyle = (status: StatusFichaCusto) => {
  switch (status) {
    case "aprovada":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "reprovada":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "enviada_para_conferencia":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
};

type ViewMode = "grid" | "list";

export function FichasCustoListClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<FiltroStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroColecao, setFiltroColecao] = useState("");
  const [ordenacao, setOrdenacao] = useState<"data" | "valor" | "nome">("data");
  const [pagina, setPagina] = useState(1);
  const [selectedFichas, setSelectedFichas] = useState<Set<string>>(new Set());
  const [fichaParaDuplicar, setFichaParaDuplicar] = useState<FichaCusto | null>(null);
  const [mostrarPresets, setMostrarPresets] = useState(false);
  const [excluirEmLoteAberto, setExcluirEmLoteAberto] = useState(false);
  const { fichas: fichasRaw, total, totalPaginas, loading, listar } = useFichasCusto(orgId);

  // Ordenar fichas de forma crescente
  const fichas = useMemo(() => {
    const sorted = [...fichasRaw];

    switch (ordenacao) {
      case "data":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "valor":
        return sorted.sort((a, b) => a.totalCustos - b.totalCustos);
      case "nome":
        return sorted.sort((a, b) => a.nomePeca.localeCompare(b.nomePeca));
      default:
        return sorted;
    }
  }, [fichasRaw, ordenacao]);

  const columns = useMemo<ColumnDef<FichaCusto>[]>(
    () => [
      {
        id: "selection",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
          />
        ),
      },
      {
        accessorKey: "numeroSequencial",
        header: "#",
        cell: ({ row }) => <span className="font-mono text-white/60">#{row.original.numeroSequencial}</span>,
      },
      {
        accessorKey: "nomePeca",
        header: "Peça",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.nomePeca}</span>
            <span className="text-xs text-white/40">Ref: {row.original.referenciaPeca}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let variant: "success" | "warning" | "danger" | "secondary" = "secondary";
          let Icon = Clock;

          if (status === "aprovada") {
            variant = "success";
            Icon = CheckCircle2;
          } else if (status === "enviada_para_conferencia") {
            variant = "warning";
            Icon = Clock;
          } else if (status === "reprovada") {
            variant = "danger";
            Icon = XCircle;
          }

          return (
            <Badge variant={variant} icon={<Icon className="h-3 w-3" />} size="sm">
              {status.replace(/_/g, " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "totalCustos",
        header: "Custo Total",
        cell: ({ row }) => formatCurrency(row.original.totalCustos),
      },
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/fichas-custo/${row.original.id}`)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/fichas-custo/${row.original.id}/edit`)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFichaParaDuplicar(row.original)}
              className="h-8 w-8 p-0 text-purple-400"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    ],
    [router]
  );

  // Stats
  const stats = {
    concluidas: fichas.filter((f) => f.status === "aprovada").length,
    canceladas: fichas.filter((f) => f.status === "reprovada").length,
    aguardandoInsumos: fichas.filter((f) => f.status === "rascunho").length,
  };

  const loadFichas = useCallback(async () => {
    if (!orgId) return;

    const filtro: FiltroFichasCusto = {
      pagina,
      tamanhoPagina: 20,
    };

    if (statusFilter !== "all") {
      filtro.status = [statusFilter];
    }

    if (debouncedSearch) {
      filtro.busca = debouncedSearch;
    }

    // Filtros de data
    if (filtroDataInicio) {
      filtro.dataInicio = filtroDataInicio;
    }
    if (filtroDataFim) {
      filtro.dataFim = filtroDataFim;
    }

    // Filtro de coleção
    if (filtroColecao) {
      filtro.colecao = filtroColecao;
    }

    // Ordenação
    if (ordenacao) {
      filtro.ordenacao = ordenacao;
    }

    await listar(filtro);
  }, [listar, pagina, statusFilter, debouncedSearch, filtroDataInicio, filtroDataFim, filtroColecao, ordenacao, orgId]);

  useEffect(() => {
    if (orgId) {
      void loadFichas();
    }
  }, [loadFichas, orgId]);

  // Ações em lote
  const handleSelectAll = () => {
    if (selectedFichas.size === fichas.length) {
      setSelectedFichas(new Set());
    } else {
      setSelectedFichas(new Set(fichas.map((f) => f.id)));
    }
  };

  const handleToggleSelect = (fichaId: string) => {
    setSelectedFichas((prev) => {
      const next = new Set(prev);
      if (next.has(fichaId)) {
        next.delete(fichaId);
      } else {
        next.add(fichaId);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedFichas.size === 0) return;

    // TODO: Implementar exclusão em lote na API
    notificationCenter.add({
      type: "info",
      title: "Exclusão em lote",
      message: `Exclusão de ${selectedFichas.size} ficha(s) será implementada em breve.`,
    });
    setSelectedFichas(new Set());
    setExcluirEmLoteAberto(false);
  };

  const handleBulkExport = () => {
    if (selectedFichas.size === 0) return;

    const fichasSelecionadas = fichas.filter((f) => selectedFichas.has(f.id));
    const format = window.prompt("Escolha o formato:\n1 - CSV\n2 - Excel\n3 - PDF\n4 - JSON");

    try {
      if (format === "1") {
        exportFichasToCSV(fichasSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fichasSelecionadas.length} ficha(s) exportada(s) em CSV.`,
        });
      } else if (format === "2") {
        exportFichasToExcel(fichasSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fichasSelecionadas.length} ficha(s) exportada(s) em Excel.`,
        });
      } else if (format === "3") {
        exportFichasToPDF(fichasSelecionadas);
        notificationCenter.add({
          type: "info",
          title: "Exportação PDF",
          message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
        });
      } else if (format === "4") {
        exportFichasToJSON(fichasSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fichasSelecionadas.length} ficha(s) exportada(s) em JSON.`,
        });
      }
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao exportar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  const handleDuplicate = (ficha: FichaCusto, options: {
    manterFornecedores: boolean;
    resetarValores: boolean;
    copiarEstrutura: boolean;
  }) => {
    // Prepara os dados para duplicação
    const dadosDuplicacao = {
      fichaId: ficha.id,
      manterFornecedores: options.manterFornecedores,
      resetarValores: options.resetarValores,
      copiarEstrutura: options.copiarEstrutura,
    };

    // Salva no sessionStorage para o formulário de criação ler
    sessionStorage.setItem("duplicar_ficha", JSON.stringify(dadosDuplicacao));

    // Navega para a tela de criação
    router.push("/fichas-custo/new");

    notificationCenter.add({
      type: "success",
      title: "Ficha preparada para duplicação",
      message: "Preenchendo formulário com dados da ficha original...",
    });
  };

  const handleAplicarPreset = (filtros: {
    status?: string;
    colecao?: string;
    busca?: string;
    ordenacao?: string;
  }) => {
    if (filtros.status) {
      setStatusFilter(filtros.status as FiltroStatus);
    }
    if (filtros.colecao) {
      setFiltroColecao(filtros.colecao);
    }
    if (filtros.busca) {
      setSearch(filtros.busca);
    }
    if (filtros.ordenacao) {
      setOrdenacao(filtros.ordenacao as "data" | "valor" | "nome");
    }

    // Recarregar fichas com os novos filtros
    setPagina(1);
    notificationCenter.add({
      type: "success",
      title: "Filtro aplicado",
      message: "Os filtros salvos foram aplicados com sucesso.",
    });
  };

  return (
    <ListPageLayout
      header={{
        icon: FileText,
        title: "Fichas de Custo de Aviamento",
        description: "Sistema Avançado de Gestão e Controle de Custos",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Fichas de Custo", href: "/fichas-custo/list" },
        ],
        stats: (
          <StatsGroup layout="horizontal" showSeparators>
            <StatCard
              icon={CheckCircle2}
              label="Concluídas"
              value={stats.concluidas}
              variant="success"
              subtitle="Fichas aprovadas"
            />
            <StatCard
              icon={Clock}
              label="Aguardando"
              value={stats.aguardandoInsumos}
              variant="warning"
              subtitle="Em rascunho"
            />
            <StatCard
              icon={XCircle}
              label="Canceladas"
              value={stats.canceladas}
              variant="danger"
              subtitle="Reprovadas"
            />
          </StatsGroup>
        ),
      }}
      controls={{
        searchValue: search,
        onSearchChange: (val) => setSearch(val),
        searchPlaceholder: "Buscar fichas...",
        filterButton: (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FiltroStatus)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#1a1f3a]">Status</option>
              <option value="rascunho" className="bg-[#1a1f3a]">Rascunho</option>
              <option value="enviada_para_conferencia" className="bg-[#1a1f3a]">Conferência</option>
              <option value="aprovada" className="bg-[#1a1f3a]">Aprovada</option>
              <option value="reprovada" className="bg-[#1a1f3a]">Reprovada</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", showAdvancedFilters && "bg-blue-500/20")}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-purple-400 border-purple-500/30"
              onClick={() => setMostrarPresets(true)}
            >
              <Filter className="h-4 w-4" />
              Presets
            </Button>
          </div>
        ),
        viewToggle: (
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
          />
        ),
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleBulkExport}
              disabled={selectedFichas.size === 0}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              onClick={() => router.push("/fichas-custo/new")}
              className="gap-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] border-0"
            >
              <Plus className="h-4 w-4" />
              Nova Ficha
            </Button>
          </div>
        ),
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedFichas.size}
            onCancel={() => setSelectedFichas(new Set())}
            actions={[
              {
                label: "PDF/CSV",
                icon: <Download className="h-4 w-4" />,
                onClick: handleBulkExport,
                variant: "outline",
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => setExcluirEmLoteAberto(true),
                variant: "destructive",
              },
            ]}
          />
        ),
        hasSelection: selectedFichas.size > 0,
      }}
      pagination={{
        total: total,
        page: pagina,
        pageSize: 20,
        onPageChange: setPagina,
      }}
    >
      <div className="space-y-6">
        {/* Filtros Avançados */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase">Início</label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase">Fim</label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase">Coleção</label>
                  <select
                    value={filtroColecao}
                    onChange={(e) => setFiltroColecao(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm"
                  >
                    <option value="" className="bg-[#1a1f3a]">Todas</option>
                    <option value="inverno" className="bg-[#1a1f3a]">Inverno</option>
                    <option value="verao" className="bg-[#1a1f3a]">Verão</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase">Ordenação</label>
                  <select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value as "data" | "valor" | "nome")}
                    className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm"
                  >
                    <option value="data" className="bg-[#1a1f3a]">Data</option>
                    <option value="valor" className="bg-[#1a1f3a]">Valor</option>
                    <option value="nome" className="bg-[#1a1f3a]">Nome</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroDataInicio("");
                    setFiltroDataFim("");
                    setFiltroColecao("");
                    setOrdenacao("data");
                  }}
                >
                  Limpar
                </Button>
                <Button size="sm" onClick={() => loadFichas()}>
                  Aplicar Filtros
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          viewMode === "grid" ? (
            <FichaGridSkeleton count={6} />
          ) : (
            <FichaListSkeleton count={5} />
          )
        ) : fichas.length === 0 ? (
          <div className="p-20 text-center rounded-xl border border-white/10 bg-white/[0.03]">
            <FileText className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white/80">Nenhuma ficha encontrada</h3>
            <p className="text-white/40 mt-1 max-w-xs mx-auto">
              Tente ajustar seus filtros ou buscar por outro termo.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fichas.map((ficha) => (
              <motion.div
                key={ficha.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group relative p-6 rounded-xl border border-white/10 bg-white/[0.05] transition-all",
                  "hover:bg-white/[0.08] hover:border-white/20",
                  selectedFichas.has(ficha.id) && "border-blue-500/50 bg-blue-500/5"
                )}
                onClick={() => handleToggleSelect(ficha.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                        #{ficha.numeroSequencial}
                      </span>
                      <Badge
                        variant={
                          ficha.status === "aprovada" ? "success" :
                            ficha.status === "reprovada" ? "danger" :
                              ficha.status === "enviada_para_conferencia" ? "warning" : "secondary"
                        }
                        size="sm"
                      >
                        {ficha.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ficha.nomePeca}
                    </h3>
                  </div>
                  {ficha.fotoPecaUrl && (
                    <img
                      src={ficha.fotoPecaUrl}
                      alt={ficha.nomePeca}
                      className="w-16 h-16 object-cover rounded-lg border border-white/10"
                    />
                  )}
                </div>

                <div className="space-y-3 py-4 border-y border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Referência</span>
                    <span className="text-white/80 font-mono">{ficha.referenciaPeca}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Custo Total</span>
                    <span className="text-white/80 font-bold">{formatCurrency(ficha.totalCustos)}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    {/* Placeholder for avatars if needed */}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/fichas-custo/${ficha.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/fichas-custo/${ficha.id}/edit`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={fichas}
            emptyMessage="Nenhuma ficha encontrada"
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedFichas).map((id) => [
                  fichas.findIndex((f) => f.id === id),
                  true
                ]).filter(([index]) => index !== -1)
              )
            }}
            onRowSelectionChange={(updater) => {
              if (typeof updater === "function") {
                const newState = updater({});
                const newSelected = new Set<string>();
                Object.keys(newState).forEach((key) => {
                  const index = parseInt(key);
                  if (fichas[index]) newSelected.add(fichas[index].id);
                });
                setSelectedFichas(newSelected);
              }
            }}
          />
        )}
      </div>

      {/* Modals */}
      {fichaParaDuplicar && (
        <DuplicarFichaModal
          ficha={fichaParaDuplicar}
          onClose={() => setFichaParaDuplicar(null)}
          onDuplicate={(options) => handleDuplicate(fichaParaDuplicar, options)}
        />
      )}

      <FiltrosPresetsModal
        isOpen={mostrarPresets}
        onClose={() => setMostrarPresets(false)}
        filtrosAtuais={{
          status: statusFilter !== "all" ? statusFilter : undefined,
          colecao: filtroColecao || undefined,
          busca: search || undefined,
          ordenacao: ordenacao || undefined,
        }}
        onAplicarPreset={handleAplicarPreset}
      />

      <DeleteConfirmDialog
        open={excluirEmLoteAberto}
        onOpenChange={setExcluirEmLoteAberto}
        onConfirm={handleBulkDelete}
        itemName={`${selectedFichas.size} ficha(s)`}
        itemType="fichas"
      />
    </ListPageLayout>
  );
};

