"use client";

import { Button } from "@morina/ui";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  FileCheck,
  XCircle,
  Clock,
  Grid,
  List as ListIcon,
  Filter,
  Calendar,
  X,
  Download,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFichasCusto } from "@/hooks/use-fichas-custo";
import type { FichaCusto, StatusFichaCusto } from "@/lib/api/fichas-custo";
import { motion } from "framer-motion";
import { InlineLoader } from "@/components/ui/PageLoader";
import { useDebounce } from "@/hooks/use-debounce";
import { FichaGridSkeleton, FichaListSkeleton } from "@/components/ui/Skeleton";
import { exportFichasToCSV, exportFichasToExcel, exportFichasToJSON, exportFichasToPDF } from "@/lib/utils/export-fichas-custo";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DuplicarFichaModal } from "@/components/fichas-custo/DuplicarFichaModal";
import { FiltrosPresetsModal } from "@/components/fichas-custo/FiltrosPresetsModal";
import { Copy } from "lucide-react";

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
  const { fichas, total, totalPaginas, loading, listar } = useFichasCusto(orgId);

  // Stats
  const stats = {
    concluidas: fichas.filter((f) => f.status === "aprovada").length,
    canceladas: fichas.filter((f) => f.status === "reprovada").length,
    aguardandoInsumos: fichas.filter((f) => f.status === "rascunho").length,
  };

  const loadFichas = useCallback(async () => {
    if (!orgId) return;

    const filtro: any = {
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

  const handleBulkDelete = () => {
    if (selectedFichas.size === 0) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${selectedFichas.size} ficha(s)?\n\nEsta ação não pode ser desfeita.`)) {
      // TODO: Implementar exclusão em lote na API
      notificationCenter.add({
        type: "info",
        title: "Exclusão em lote",
        message: `Exclusão de ${selectedFichas.size} ficha(s) será implementada em breve.`,
      });
      setSelectedFichas(new Set());
    }
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
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />
        
        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <FileText className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Fichas de Custo de Aviamento
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Avançado de Gestão e Controle de Custos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <FileCheck className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white/80">{stats.concluidas} Concluídas</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white/80">{stats.canceladas} Canceladas</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">{stats.aguardandoInsumos} Aguardando</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
            <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
              <Search className="h-4 w-4 text-white/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fichas..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FiltroStatus)}
                className="relative px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px]"
              >
                <option value="all" className="bg-[#1a1f3a]">Todos os Status</option>
                <option value="rascunho" className="bg-[#1a1f3a]">Rascunho</option>
                <option value="enviada_para_conferencia" className="bg-[#1a1f3a]">Enviada para Conferência</option>
                <option value="aprovada" className="bg-[#1a1f3a]">Aprovada</option>
                <option value="reprovada" className="bg-[#1a1f3a]">Reprovada</option>
              </select>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4 ${showAdvancedFilters ? "bg-blue-500/20 border-blue-500/30" : ""}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 backdrop-blur-sm cursor-pointer h-[48px] px-4"
                onClick={() => setMostrarPresets(true)}
                title="Filtros salvos"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros Salvos
              </Button>
            </motion.div>
            <div className="flex gap-2 border border-white/20 rounded-lg p-1 bg-white/5 backdrop-blur-sm">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "grid" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-transparent border-transparent text-white/60 hover:text-white"}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Visualização em grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "list" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-transparent border-transparent text-white/60 hover:text-white"}`}
                  onClick={() => setViewMode("list")}
                  aria-label="Visualização em lista"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <div className="flex gap-2">
              {fichas.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4"
                    onClick={() => {
                      const format = window.prompt("Escolha o formato:\n1 - CSV\n2 - Excel\n3 - PDF\n4 - JSON");
                      try {
                        if (format === "1") {
                          exportFichasToCSV(fichas);
                          notificationCenter.add({
                            type: "success",
                            title: "Exportação concluída",
                            message: `${fichas.length} ficha(s) exportada(s) em CSV.`,
                          });
                        } else if (format === "2") {
                          exportFichasToExcel(fichas);
                          notificationCenter.add({
                            type: "success",
                            title: "Exportação concluída",
                            message: `${fichas.length} ficha(s) exportada(s) em Excel.`,
                          });
                        } else if (format === "3") {
                          exportFichasToPDF(fichas);
                          notificationCenter.add({
                            type: "info",
                            title: "Exportação PDF",
                            message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
                          });
                        } else if (format === "4") {
                          exportFichasToJSON(fichas);
                          notificationCenter.add({
                            type: "success",
                            title: "Exportação concluída",
                            message: `${fichas.length} ficha(s) exportada(s) em JSON.`,
                          });
                        }
                      } catch (error) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro ao exportar",
                          message: error instanceof Error ? error.message : "Erro desconhecido",
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] px-4"
                  onClick={() => router.push("/fichas-custo/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ficha
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </h4>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Fechar filtros"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Data Início</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Data Fim</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Coleção</label>
                <div className="relative group">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    value={filtroColecao}
                    onChange={(e) => setFiltroColecao(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px]"
                  >
                    <option value="" className="bg-[#1a1f3a]">Todas</option>
                    <option value="inverno" className="bg-[#1a1f3a]">Inverno</option>
                    <option value="verao" className="bg-[#1a1f3a]">Verão</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Ordenar por</label>
                <div className="relative group">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value as "data" | "valor" | "nome")}
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px]"
                  >
                    <option value="data" className="bg-[#1a1f3a]">Data</option>
                    <option value="valor" className="bg-[#1a1f3a]">Valor</option>
                    <option value="nome" className="bg-[#1a1f3a]">Nome</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => {
                  setFiltroDataInicio("");
                  setFiltroDataFim("");
                  setFiltroColecao("");
                  setOrdenacao("data");
                }}
              >
                Limpar
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[36px] px-4"
                onClick={() => {
                  // Aplicar filtros
                  void loadFichas();
                }}
              >
                Aplicar
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Barra de Ações em Lote */}
      {selectedFichas.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-white/90">
              {selectedFichas.size} ficha{selectedFichas.size > 1 ? "s" : ""} selecionada{selectedFichas.size > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={() => setSelectedFichas(new Set())}
            >
              Desmarcar
            </Button>
            <Button
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={handleBulkExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </motion.div>
      )}

      {/* Lista de Fichas */}
      {loading ? (
        viewMode === "grid" ? (
          <FichaGridSkeleton count={6} />
        ) : (
          <FichaListSkeleton count={5} />
        )
      ) : fichas.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <FileText className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {search || statusFilter !== "all" 
              ? "Nenhuma ficha encontrada com os filtros aplicados." 
              : "Nenhuma ficha cadastrada. Clique em 'Nova Ficha' para começar."}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {fichas.map((ficha) => (
            <motion.div
              key={ficha.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${viewMode === "grid" ? "p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all" : "p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"}`}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFichas.has(ficha.id)}
                        onChange={() => handleToggleSelect(ficha.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white/90">#{ficha.numeroSequencial}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(ficha.status)}`}>
                          {ficha.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="text-base font-medium text-white/80 mb-1">{ficha.nomePeca}</h4>
                      <p className="text-sm text-white/60">
                          Ref: {ficha.referenciaPeca}
                          {ficha.categoria && ` • ${ficha.categoria}`}
                        </p>
                      </div>
                    </div>
                    {ficha.fotoPecaUrl && (
                      <img
                        src={ficha.fotoPecaUrl}
                        alt={ficha.nomePeca}
                        className="w-16 h-16 object-cover rounded border border-white/10"
                      />
                    )}
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Total de Custos:</span>
                      <span className="font-semibold text-white/90">{formatCurrency(ficha.totalCustos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo por Peça:</span>
                      <span className="font-semibold text-white/90">{formatCurrency(ficha.custoFinalPeca)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insumos:</span>
                      <span className="font-semibold text-white/90">{ficha.insumos.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px]"
                        onClick={() => router.push(`/fichas-custo/${ficha.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px]"
                        onClick={() => router.push(`/fichas-custo/${ficha.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0"
                        onClick={() => setFichaParaDuplicar(ficha)}
                        title="Duplicar ficha"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={selectedFichas.has(ficha.id)}
                    onChange={() => handleToggleSelect(ficha.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 flex-shrink-0"
                  />
                  {ficha.fotoPecaUrl && (
                    <img
                      src={ficha.fotoPecaUrl}
                      alt={ficha.nomePeca}
                      className="w-20 h-20 object-cover rounded border border-white/10 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white/90">#{ficha.numeroSequencial}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(ficha.status)}`}>
                        {ficha.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h4 className="text-base font-medium text-white/80 mb-1">{ficha.nomePeca}</h4>
                    <p className="text-sm text-white/60 mb-2">
                      Ref: {ficha.referenciaPeca}
                      {ficha.categoria && ` • ${ficha.categoria}`}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/70">
                      <div>
                        <span className="text-white/50">Total: </span>
                        <span className="font-semibold text-white/90">{formatCurrency(ficha.totalCustos)}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Por Peça: </span>
                        <span className="font-semibold text-white/90">{formatCurrency(ficha.custoFinalPeca)}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Insumos: </span>
                        <span className="font-semibold text-white/90">{ficha.insumos.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px] px-4"
                        onClick={() => router.push(`/fichas-custo/${ficha.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                        onClick={() => router.push(`/fichas-custo/${ficha.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            Anterior
          </Button>
          <span className="text-white/60">
            Página {pagina} de {totalPaginas}
          </span>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal de Duplicação */}
      {fichaParaDuplicar && (
        <DuplicarFichaModal
          ficha={fichaParaDuplicar}
          onClose={() => setFichaParaDuplicar(null)}
          onDuplicate={(options) => handleDuplicate(fichaParaDuplicar, options)}
        />
      )}

      {/* Modal de Filtros Presets */}
      <FiltrosPresetsModal
        isOpen={mostrarPresets}
        onClose={() => setMostrarPresets(false)}
        filtrosAtuais={{
          status: statusFilter !== "all" ? statusFilter : undefined,
          colecao: filtroColecao || undefined,
          busca: debouncedSearch || undefined,
          ordenacao: ordenacao || undefined,
        }}
        onAplicarPreset={handleAplicarPreset}
      />
    </div>
  );
}

