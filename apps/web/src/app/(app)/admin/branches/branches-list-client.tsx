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
    MapPin,
    Phone,
    Mail,
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
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-white/10"
                />
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

// Skeleton Loader
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

    return (
        <div className="relative min-h-screen p-6 space-y-8">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative group"
            >
                <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--primary)/0.2)] via-[hsl(var(--accent)/0.15)] to-[hsl(var(--primary)/0.2)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />

                <div className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[hsl(var(--primary))] rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--primary))] rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--accent))] rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[hsl(var(--accent))] rounded-br-3xl" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-lg shadow-[hsl(var(--primary))]/30"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Building2 className="h-8 w-8 text-white" />
                            </motion.div>
                            <div className="flex-1">
                                <motion.h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
                                    Gerenciamento de Filiais
                                </motion.h1>
                                <motion.div className="flex items-center gap-2 mt-1">
                                    <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                                    <p className="text-sm text-white/60 font-medium">
                                        Sistema de Gestão de Unidades Organizacionais
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Stats with Circular Progress */}
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

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
                <div className="relative flex-1 w-full sm:max-w-md group">
                    <motion.div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
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
                        <option value="all" className="bg-[#1a1f3a]">Todos</option>
                        <option value="active" className="bg-[#1a1f3a]">Ativo</option>
                        <option value="inactive" className="bg-[#1a1f3a]">Inativo</option>
                    </select>

                    <div className="flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode("grid")}
                            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "grid"
                                    ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg"
                                    : "text-white/60 hover:text-white"
                                }`}
                        >
                            <Grid className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode("list")}
                            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "list"
                                    ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg"
                                    : "text-white/60 hover:text-white"
                                }`}
                        >
                            <ListIcon className="h-4 w-4" />
                        </motion.button>
                    </div>

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

            {/* Content */}
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
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Building2 className="h-24 w-24 mx-auto mb-6 text-white/20" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white/80 mb-2">
                        {search ? "Nenhuma filial encontrada" : "Nenhuma filial cadastrada"}
                    </h3>
                    <p className="text-white/50 mb-6">
                        {search ? "Tente ajustar os filtros" : "Comece criando sua primeira filial"}
                    </p>
                    {!search && (
                        <Button
                            onClick={() => router.push("/admin/branches/new")}
                            className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Primeira Filial
                        </Button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    layout
                    className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                >
                    {filteredBranches.map((branch, index) => (
                        <motion.div
                            key={branch.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl hover:border-white/20 hover:shadow-2xl hover:shadow-[hsl(var(--primary))]/10 transition-all duration-300"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--primary))]/20 via-[hsl(var(--accent))]/20 to-[hsl(var(--primary))]/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary))]/30"
                                    >
                                        <Building2 className="h-7 w-7 text-white" />
                                    </motion.div>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${branch.active
                                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                                        }`}>
                                        {branch.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white/90 mb-3 group-hover:text-white transition-colors">
                                    {branch.name}
                                </h3>

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
                                            <Mail className="h-3.5 w-3.5" />
                                            {branch.email}
                                        </p>
                                    )}
                                    {branch.phone && (
                                        <p className="text-sm text-white/50 flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            {branch.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-white/10">
                                    <Button
                                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400"
                                        onClick={() => router.push(`/admin/branches/${branch.id}`)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver
                                    </Button>
                                    <Button
                                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                                        onClick={() => router.push(`/admin/branches/${branch.id}/edit`)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button
                                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3"
                                        onClick={() => void onDelete(branch.id)}
                                        disabled={deletingId === branch.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
