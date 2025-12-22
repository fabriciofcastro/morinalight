"use client";

import { Button } from "@morina/ui";
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Grid,
  List as ListIcon,
  Filter,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { type Branch, organizationalStructureApi } from "@/lib/api/organizational-structure";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@morina/ui";
import {
  exportBranchesToCSV,
  exportBranchesToExcel,
  exportBranchesToJSON,
  exportBranchToPDF,
} from "@/lib/utils/export-branches";
import { notificationCenter } from "@/components/notifications/notification-center";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";

// Circular Progress Component
function CircularProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function BranchSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-9 h-9 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
        <div className="w-16 h-6 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-white/5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-9 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
    </motion.div>
  );
}

export function BranchesListClient() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());

  // Advanced Filters
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar",
        message: "Não foi possível carregar as filiais",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const filteredBranches = useMemo(() => {
    let filtered = branches;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (branch) =>
          branch.name.toLowerCase().includes(q) ||
          branch.code.toLowerCase().includes(q) ||
          branch.type.toLowerCase().includes(q) ||
          branch.cnpj?.toLowerCase().includes(q) ||
          branch.email?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((branch) =>
        statusFilter === "active" ? branch.active : !branch.active,
      );
    }

    // Advanced Filters
    if (filtroTipo) {
      filtered = filtered.filter((b) => b.type.toLowerCase().includes(filtroTipo.toLowerCase()));
    }

    if (filtroEstado) {
      filtered = filtered.filter(
        (b) => b.address?.state.toLowerCase().includes(filtroEstado.toLowerCase()),
      );
    }

    if (filtroCidade) {
      filtered = filtered.filter(
        (b) => b.address?.city.toLowerCase().includes(filtroCidade.toLowerCase()),
      );
    }

    return filtered;
  }, [branches, debouncedSearch, statusFilter, filtroTipo, filtroEstado, filtroCidade]);

  const stats = useMemo(() => {
    return {
      total: branches.length,
      active: branches.filter((b) => b.active).length,
      inactive: branches.filter((b) => !b.active).length,
    };
  }, [branches]);

  const onDelete = useCallback(
    async (branchId: string) => {
      const ok = confirm("Tem certeza que deseja deletar esta filial?");
      if (!ok) return;
      try {
        setDeletingId(branchId);
        await organizationalStructureApi.deleteBranch(branchId);
        await loadBranches();
        notificationCenter.add({
          type: "success",
          title: "Filial deletada",
          message: "Filial foi deletada com sucesso",
        });
      } catch (error) {
        console.error("Failed to delete branch", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao deletar",
          message: "Não foi possível deletar a filial",
        });
      } finally {
        setDeletingId(null);
      }
    },
    [loadBranches],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedBranches.size === 0) return;

    const branchesSelecionadas = filteredBranches.filter((b) => selectedBranches.has(b.id));

    if (!confirm(`Deseja realmente deletar ${branchesSelecionadas.length} filial(is)?`)) {
      return;
    }

    try {
      const resultados = await Promise.allSettled(
        branchesSelecionadas.map((b) => organizationalStructureApi.deleteBranch(b.id)),
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled").length;
      const falhas = resultados.filter((r) => r.status === "rejected").length;

      if (falhas > 0) {
        notificationCenter.add({
          type: "warning",
          title: "Deleção parcial",
          message: `${sucessos} filial(is) deletada(s) com sucesso. ${falhas} falha(ram).`,
        });
      } else {
        notificationCenter.add({
          type: "success",
          title: "Filiais deletadas",
          message: `${sucessos} filial(is) deletada(s) com sucesso.`,
        });
      }

      setSelectedBranches(new Set());
      await loadBranches();
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível deletar as filiais.",
      });
    }
  }, [selectedBranches, filteredBranches, loadBranches]);

  const handleBulkExport = useCallback(() => {
    if (selectedBranches.size === 0) return;

    const branchesSelecionadas = filteredBranches.filter((b) => selectedBranches.has(b.id));

    const format = window.prompt("Escolha o formato:\n1 - CSV\n2 - Excel\n3 - PDF (primeira filial)\n4 - JSON");

    try {
      if (format === "1") {
        exportBranchesToCSV(branchesSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${branchesSelecionadas.length} filial(is) exportada(s) em CSV.`,
        });
      } else if (format === "2") {
        exportBranchesToExcel(branchesSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${branchesSelecionadas.length} filial(is) exportada(s) em Excel.`,
        });
      } else if (format === "3") {
        if (branchesSelecionadas.length > 0) {
          exportBranchToPDF(branchesSelecionadas[0]);
          notificationCenter.add({
            type: "info",
            title: "Exportação PDF",
            message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
          });
        }
      } else if (format === "4") {
        exportBranchesToJSON(branchesSelecionadas);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${branchesSelecionadas.length} filial(is) exportada(s) em JSON.`,
        });
      }
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao exportar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [selectedBranches, filteredBranches]);

  const toggleSelectBranch = useCallback((branchId: string) => {
    setSelectedBranches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedBranches.size === filteredBranches.length) {
      setSelectedBranches(new Set());
    } else {
      setSelectedBranches(new Set(filteredBranches.map((b) => b.id)));
    }
  }, [selectedBranches, filteredBranches]);

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Enhanced Header with Parallax Effect */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative group"
      >
        {/* Animated Background Glow */}
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--primary)/0.2)] via-[hsl(var(--accent)/0.15)] to-[hsl(var(--primary)/0.2)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {/* Premium Tech Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[hsl(var(--primary))] rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--primary))] rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--accent))] rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[hsl(var(--accent))] rounded-br-3xl" />

          <div className="relative z-10 space-y-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-lg shadow-[hsl(var(--primary))]/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.h1
                  className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Gerenciamento de Filiais
                </motion.h1>
                <motion.div
                  className="flex items-center gap-2 mt-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                  <p className="text-sm text-white/60 font-medium">
                    Sistema de Gestão de Unidades Organizacionais
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Enhanced Stats with Circular Progress */}
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-400/60">
                      <TrendingUp className="h-3 w-3" />
                      <span>Filiais cadastradas</span>
                    </div>
                  </div>
                  <CircularProgress value={stats.total} max={stats.total} color="#60a5fa" size={70} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group relative p-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-green-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-semibold text-green-400/70 uppercase tracking-wider">Ativas</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{stats.active}</p>
                    <div className="flex items-center gap-1 text-xs text-green-400/60">
                      <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
                      <span>do total</span>
                    </div>
                  </div>
                  <CircularProgress value={stats.active} max={stats.total} color="#4ade80" size={70} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="group relative p-6 rounded-2xl border border-gray-500/20 bg-gradient-to-br from-gray-500/10 via-gray-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-gray-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400/70 uppercase tracking-wider">Inativas</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-400">{stats.inactive}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400/60">
                      <span>{stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%</span>
                      <span>do total</span>
                    </div>
                  </div>
                  <CircularProgress value={stats.inactive} max={stats.total} color="#9ca3af" size={70} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="relative flex-1 w-full sm:max-w-md group">
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"
          />
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl focus-within:border-blue-500/50 hover:border-white/30 transition-all duration-300">
            <Search className="h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar filiais..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm"
            />
            {search && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearch("")}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl text-white text-sm focus:outline-none focus:border-blue-500/50 hover:border-white/30 transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#1a1f3a]">Todos os Status</option>
            <option value="active" className="bg-[#1a1f3a]">Ativo</option>
            <option value="inactive" className="bg-[#1a1f3a]">Inativo</option>
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "grid"
                  ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/30"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              <Grid className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "list"
                  ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/30"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              <ListIcon className="h-4 w-4" />
            </motion.button>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:border-white/30 text-white backdrop-blur-xl transition-all duration-300 ${showAdvancedFilters ? "ring-2 ring-blue-500/50" : ""}`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:border-white/30 text-white backdrop-blur-xl transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1f3a]/95 backdrop-blur-xl border-white/20">
              <DropdownMenuItem
                onClick={() => {
                  try {
                    exportBranchesToCSV(filteredBranches);
                    notificationCenter.add({
                      type: "success",
                      title: "Exportação concluída",
                      message: `${filteredBranches.length} filial(is) exportada(s) em CSV.`,
                    });
                  } catch (error) {
                    notificationCenter.add({
                      type: "error",
                      title: "Erro ao exportar",
                      message: error instanceof Error ? error.message : "Erro desconhecido",
                    });
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  try {
                    exportBranchesToExcel(filteredBranches);
                    notificationCenter.add({
                      type: "success",
                      title: "Exportação concluída",
                      message: `${filteredBranches.length} filial(is) exportada(s) em Excel.`,
                    });
                  } catch (error) {
                    notificationCenter.add({
                      type: "error",
                      title: "Erro ao exportar",
                      message: error instanceof Error ? error.message : "Erro desconhecido",
                    });
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  try {
                    exportBranchesToJSON(filteredBranches);
                    notificationCenter.add({
                      type: "success",
                      title: "Exportação concluída",
                      message: `${filteredBranches.length} filial(is) exportada(s) em JSON.`,
                    });
                  } catch (error) {
                    notificationCenter.add({
                      type: "error",
                      title: "Erro ao exportar",
                      message: error instanceof Error ? error.message : "Erro desconhecido",
                    });
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (filteredBranches.length > 0) {
                    try {
                      exportBranchToPDF(filteredBranches[0]);
                      notificationCenter.add({
                        type: "info",
                        title: "Exportação PDF",
                        message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
                      });
                    } catch (error) {
                      notificationCenter.add({
                        type: "error",
                        title: "Erro ao exportar",
                        message: error instanceof Error ? error.message : "Erro desconhecido",
                      });
                    }
                  }
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF (Primeira)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => void loadBranches()}
              className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:border-white/30 text-white backdrop-blur-xl transition-all duration-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push("/admin/branches/new")}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/30 hover:shadow-[hsl(var(--primary))]/50 border-0 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Filial
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/20">
                    <Filter className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white/90">Filtros Avançados</h4>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Tipo</label>
                  <input
                    type="text"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    placeholder="Ex: LOJA, FABRICA"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Estado</label>
                  <input
                    type="text"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    placeholder="Ex: SP, RJ"
                    maxLength={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={filtroCidade}
                    onChange={(e) => setFiltroCidade(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => {
                      setFiltroTipo("");
                      setFiltroEstado("");
                      setFiltroCidade("");
                    }}
                    className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 text-white backdrop-blur-xl"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedBranches.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-2xl shadow-2xl shadow-blue-500/20">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  </motion.div>
                  <span className="text-white font-semibold">
                    {selectedBranches.size} selecionada{selectedBranches.size > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleBulkExport}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xl"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleBulkDelete}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-xl"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setSelectedBranches(new Set())}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xl"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Limpar
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid/List */}
      {loading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BranchSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-16 text-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Building2 className="h-24 w-24 mx-auto mb-6 text-white/20" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white/80 mb-2">
            {search ? "Nenhuma filial encontrada" : "Nenhuma filial cadastrada"}
          </h3>
          <p className="text-white/50 mb-6">
            {search
              ? "Tente ajustar os filtros de busca"
              : "Comece criando sua primeira filial"}
          </p>
          {!search && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/admin/branches/new")}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Filial
              </Button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <>
          {viewMode === "list" && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10">
              <input
                type="checkbox"
                checked={selectedBranches.size === filteredBranches.length && filteredBranches.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-white/20 bg-white/10 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] cursor-pointer"
              />
              <span className="text-sm text-white/60 font-medium">Selecionar todos</span>
            </div>
          )}
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredBranches.map((branch, index) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  viewMode={viewMode}
                  index={index}
                  onView={() => router.push(`/admin/branches/${branch.id}`)}
                  onEdit={() => router.push(`/admin/branches/${branch.id}/edit`)}
                  onDelete={() => void onDelete(branch.id)}
                  isDeleting={deletingId === branch.id}
                  isSelected={selectedBranches.has(branch.id)}
                  onToggleSelect={() => toggleSelectBranch(branch.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}

interface BranchCardProps {
  branch: Branch;
  viewMode: ViewMode;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function BranchCard({
  branch,
  viewMode,
  index,
  onView,
  onEdit,
  onDelete,
  isDeleting,
  isSelected,
  onToggleSelect,
}: BranchCardProps) {
  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05 }}
        className="group relative p-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex items-center gap-4"
      >
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="rounded border-white/20 bg-white/10 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] cursor-pointer"
        />

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[hsl(var(--primary))]/20"
        >
          <Building2 className="h-6 w-6 text-white" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-white/90 truncate">{branch.name}</h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.active
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                }`}
            >
              {branch.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="font-mono border border-white/10 bg-white/5 px-2 py-1 rounded-lg">
              {branch.code}
            </span>
            <span className="border border-white/10 bg-white/5 px-2 py-1 rounded-lg">
              {branch.type}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-9 w-9 p-0"
              onClick={onView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-9 w-9 p-0"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-9 w-9 p-0"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl hover:border-white/20 hover:shadow-2xl hover:shadow-[hsl(var(--primary))]/10 transition-all duration-300"
    >
      {/* 3D Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--primary))]/20 via-[hsl(var(--accent))]/20 to-[hsl(var(--primary))]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

      {/* Content */}
      <div className="relative">
        {/* Checkbox Top-Left */}
        <div className="absolute -top-2 -left-2 z-10">
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] cursor-pointer shadow-lg"
            />
          </motion.div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary))]/30"
          >
            <Building2 className="h-7 w-7 text-white" />
          </motion.div>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${branch.active
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
              }`}
          >
            {branch.active ? "Ativo" : "Inativo"}
          </motion.span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white/90 mb-3 group-hover:text-white transition-colors">
          {branch.name}
        </h3>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="font-mono text-xs border border-white/10 bg-white/5 px-2 py-1 rounded-lg">
              {branch.code}
            </span>
            <span className="text-white/30">•</span>
            <span>{branch.type}</span>
          </div>
          {branch.email && (
            <p className="text-sm text-white/50 truncate flex items-center gap-2">
              <span className="text-white/30">✉</span>
              {branch.email}
            </p>
          )}
          {branch.phone && (
            <p className="text-sm text-white/50 flex items-center gap-2">
              <span className="text-white/30">☎</span>
              {branch.phone}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer"
              onClick={onView}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
              onClick={onEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer px-3"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
