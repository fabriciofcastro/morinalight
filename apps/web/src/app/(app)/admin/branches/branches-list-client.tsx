"use client";

import {
    Button,
    ListPageLayout,
    StatsGroup,
    StatCardCircular,
    EmptyState,
    ViewToggle,
} from "@morina/ui";
import {
    Building2,
    Plus,
    Search,
    Eye,
    Edit,
    PlusCircle,
    CheckCircle2,
    XCircle,
    Trash2,
    Mail,
    Phone,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { type Branch, organizationalStructureApi } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";


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
        <ListPageLayout
            header={{
                icon: Building2,
                title: "Gerenciamento de Filiais",
                description: "Sistema de Gestão de Unidades Organizacionais",
                stats: (
                    <StatsGroup layout="horizontal">
                        <StatCardCircular
                            icon={Building2}
                            label="Total"
                            value={stats.total}
                            maxValue={stats.total}
                            variant="primary"
                            showProgress
                        />
                        <StatCardCircular
                            icon={CheckCircle2}
                            label="Ativas"
                            value={stats.active}
                            maxValue={stats.total}
                            variant="success"
                            showProgress
                        />
                        <StatCardCircular
                            icon={XCircle}
                            label="Inativas"
                            value={stats.inactive}
                            maxValue={stats.total}
                            variant="secondary"
                            showProgress
                        />
                    </StatsGroup>
                ),
            }}
            controls={{
                searchValue: search,
                onSearchChange: setSearch,
                searchPlaceholder: "Buscar por nome, código ou tipo...",
                loading: loading,
                actions: (
                    <Button
                        onClick={() => router.push("/admin/branches/new")}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Filial
                    </Button>
                ),
                filterButton: (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-primary/50"
                    >
                        <option value="all" className="bg-slate-900">Todos Status</option>
                        <option value="active" className="bg-slate-900">Ativas</option>
                        <option value="inactive" className="bg-slate-900">Inativas</option>
                    </select>
                ),
                viewToggle: <ViewToggle value={viewMode} onChange={setViewMode} />,
            }}
        >

            {/* Content */}
            {loading ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="p-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm animate-pulse min-h-[200px]"
                        />
                    ))}
                </div>
            ) : filteredBranches.length === 0 ? (
                <EmptyState
                    icon={<Building2 />}
                    title={search ? "Nenhuma filial encontrada" : "Nenhuma filial cadastrada"}
                    description={search ? "Tente ajustar os filtros ou termo de busca" : "Comece criando sua primeira filial para gerenciar suas unidades"}
                    action={!search ? (
                        <Button
                            onClick={() => router.push("/admin/branches/new")}
                            className="bg-primary text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Primeira Filial
                        </Button>
                    ) : undefined}
                />
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
        </ListPageLayout>
    );
}
