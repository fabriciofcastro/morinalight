"use client";

import { Button } from "@morina/ui";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Grid,
  List as ListIcon,
  Filter,
  Calendar,
  X,
  UserCheck,
  UserX,
  Clock,
  Shield,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUsers, type User } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import { UsersStats } from "./users-stats";
import { UserStatusBadge } from "./user-status-badge";
import { UserSkeleton } from "./UserSkeleton";
import { useBulkActions } from "@/hooks/use-bulk-actions";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive" | "suspended" | "pending";

export function UsersListClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Advanced filters
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "lastLogin">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { users, loading, error, total, totalPages, refetch } = useUsers({
    busca: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    departmentId: filterDepartment || undefined,
    sectorId: filterSector || undefined,
    positionId: filterPosition || undefined,
    admissionDateFrom: filterDateFrom || undefined,
    admissionDateTo: filterDateTo || undefined,
    sortBy,
    sortDir,
    page,
    limit,
  });

  // Bulk actions
  const { activateUsers, deactivateUsers, suspendUsers, deleteUsers, loading: bulkLoading } = useBulkActions({
    onSuccess: () => {
      setSelectedUserIds(new Set());
      refetch();
    },
  });

  // Calculate stats
  const stats = {
    total: total,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  const hasActiveFilters =
    filterDepartment ||
    filterSector ||
    filterPosition ||
    filterDateFrom ||
    filterDateTo ||
    statusFilter !== "all";

  const clearFilters = useCallback(() => {
    setFilterDepartment("");
    setFilterSector("");
    setFilterPosition("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setStatusFilter("all");
    setSortBy("name");
    setSortDir("asc");
  }, []);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.userId)));
    }
  }, [users, selectedUserIds.size]);

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
          {/* Bordas decorativas */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Gerenciamento de Usuários
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Avançado de Gestão e Controle de Acesso
                </p>
              </div>
            </div>
            <UsersStats
              total={stats.total}
              active={stats.active}
              inactive={stats.inactive}
              pending={stats.pending}
              suspended={stats.suspended}
            />
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
                placeholder="Buscar usuários..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="relative px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px]"
              >
                <option value="all" className="bg-[#1a1f3a]">Todos os Status</option>
                <option value="active" className="bg-[#1a1f3a]">Ativo</option>
                <option value="inactive" className="bg-[#1a1f3a]">Inativo</option>
                <option value="suspended" className="bg-[#1a1f3a]">Suspenso</option>
                <option value="pending" className="bg-[#1a1f3a]">Pendente</option>
              </select>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4 ${showAdvancedFilters ? "bg-blue-500/20 border-blue-500/30" : ""
                  } ${hasActiveFilters ? "ring-2 ring-blue-500/50" : ""}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-400 text-xs">
                    {[filterDepartment, filterSector, filterPosition, filterDateFrom, filterDateTo].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </motion.div>
            <div className="flex gap-2 border border-white/20 rounded-lg p-1 bg-white/5 backdrop-blur-sm">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "grid"
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                    : "bg-transparent border-transparent text-white/60 hover:text-white"
                    }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Visualização em grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "list"
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                    : "bg-transparent border-transparent text-white/60 hover:text-white"
                    }`}
                  onClick={() => setViewMode("list")}
                  aria-label="Visualização em lista"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] px-4"
                onClick={() => router.push("/admin/users/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Filtros Avançados */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                </h4>
                <button
                  type="button"
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
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
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
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">Ordenar por</label>
                  <div className="relative group">
                    <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="name" className="bg-[#1a1f3a]">Nome</option>
                      <option value="email" className="bg-[#1a1f3a]">Email</option>
                      <option value="createdAt" className="bg-[#1a1f3a]">Data de Criação</option>
                      <option value="lastLogin" className="bg-[#1a1f3a]">Último Acesso</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">Ordem</label>
                  <div className="relative group">
                    <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                    <select
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value as typeof sortDir)}
                      className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="asc" className="bg-[#1a1f3a]">Crescente</option>
                      <option value="desc" className="bg-[#1a1f3a]">Decrescente</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                  onClick={clearFilters}
                >
                  Limpar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[36px] px-4"
                  onClick={() => {
                    setPage(1);
                    refetch();
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ações em Massa */}
      {selectedUserIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-white/90">
              {selectedUserIds.size} usuário{selectedUserIds.size > 1 ? "s" : ""} selecionado{selectedUserIds.size > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={() => setSelectedUserIds(new Set())}
            >
              Desmarcar
            </Button>
            <Button
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={() => activateUsers(Array.from(selectedUserIds))}
            >
              Ativar
            </Button>
            <Button
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={() => suspendUsers(Array.from(selectedUserIds))}
            >
              Suspender
            </Button>
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
              onClick={() => deleteUsers(Array.from(selectedUserIds))}
            >
              Excluir
            </Button>
          </div>
        </motion.div>
      )}

      {/* Lista de Usuários */}
      {loading ? (
        <UserSkeleton variant={viewMode} count={limit} />
      ) : error ? (
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error}</p>
          <Button
            className="mt-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => refetch()}
          >
            Tentar Novamente
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Users className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {search || hasActiveFilters
              ? "Nenhum usuário encontrado com os filtros aplicados."
              : "Nenhum usuário cadastrado. Clique em 'Novo Usuário' para começar."}
          </p>
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {users.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                viewMode={viewMode}
                isSelected={selectedUserIds.has(user.userId)}
                onSelect={() => toggleUserSelection(user.userId)}
                onView={() => router.push(`/admin/users/${user.userId}`)}
                onEdit={() => router.push(`/admin/users/${user.userId}/edit`)}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} usuários
              </p>
              <div className="flex gap-2">
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-white/80">
                  Página {page} de {totalPages}
                </span>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface UserCardProps {
  user: User;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
}

function UserCard({ user, viewMode, isSelected, onSelect, onView, onEdit }: UserCardProps) {
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
        />
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-white/90 truncate">{user.displayName}</h3>
            <UserStatusBadge status={user.status} />
          </div>
          <p className="text-sm text-white/60 truncate">{user.email}</p>
          {(user.departmentName || user.sectorName || user.positionName) && (
            <p className="text-xs text-white/50 mt-1">
              {[user.departmentName, user.sectorName, user.positionName].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
            onClick={onView}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-3"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all relative"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="absolute top-4 right-4 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
      />
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white/90 mb-1 truncate">{user.displayName}</h3>
          <p className="text-sm text-white/60 truncate mb-2">{user.email}</p>
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      {(user.departmentName || user.sectorName || user.positionName) && (
        <div className="space-y-1 mb-4 text-sm text-white/70">
          {user.departmentName && (
            <div className="flex items-center gap-2">
              <span className="text-white/50">Departamento:</span>
              <span className="font-medium">{user.departmentName}</span>
            </div>
          )}
          {user.sectorName && (
            <div className="flex items-center gap-2">
              <span className="text-white/50">Setor:</span>
              <span className="font-medium">{user.sectorName}</span>
            </div>
          )}
          {user.positionName && (
            <div className="flex items-center gap-2">
              <span className="text-white/50">Cargo:</span>
              <span className="font-medium">{user.positionName}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1 mb-4 text-xs text-white/60">
        <div className="flex justify-between">
          <span>Criado em:</span>
          <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        {user.lastLogin && (
          <div className="flex justify-between">
            <span>Último acesso:</span>
            <span>{new Date(user.lastLogin).toLocaleDateString("pt-BR")}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-white/10">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
          <Button
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px]"
            onClick={onView}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
          <Button
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px]"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}







