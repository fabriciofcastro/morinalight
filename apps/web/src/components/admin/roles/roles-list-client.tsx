"use client";

import { Button } from "@morina/ui";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  Grid,
  List as ListIcon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { type Role, permissionsApi } from "@/lib/api/permissions";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "active" | "inactive";

export function RolesListClient() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const filteredRoles = useMemo(() => {
    let filtered = roles;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(q) ||
          role.code.toLowerCase().includes(q) ||
          role.scope.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((role) =>
        statusFilter === "active" ? role.active : !role.active,
      );
    }

    return filtered;
  }, [roles, debouncedSearch, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: roles.length,
      active: roles.filter((r) => r.active).length,
      inactive: roles.filter((r) => !r.active).length,
    };
  }, [roles]);

  const handleDelete = useCallback((id: string, name: string) => {
    setRoleToDelete({ id, name });
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!roleToDelete) return;
    setDeleteLoading(true);
    try {
      await permissionsApi.deleteRole(roleToDelete.id);
      await loadRoles();
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error("Failed to delete role", error);
    } finally {
      setDeleteLoading(false);
    }
  }, [roleToDelete, loadRoles]);

  return (
    <AllowedGuard I="read" a="Role" redirectTo="/admin">
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
                <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Gerenciamento de Perfis de Acesso
                  </h1>
                  <p className="text-sm text-white/60 font-medium mt-1">
                    RBAC (Roles) com eventos, auditoria e consistência multiempresa
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-medium text-white/60">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-xs font-medium text-white/60">Ativos</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl border border-gray-500/30 bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-medium text-white/60">Inativos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md group">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
            <div className="relative flex items-center gap-3 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm focus-within:border-blue-500 hover:border-blue-500/50 transition-all">
              <Search className="h-5 w-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar perfis..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white text-sm focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>

            <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${viewMode === "grid"
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${viewMode === "list"
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="secondary"
              type="button"
              onClick={() => void loadRoles()}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>

            <Can I="create" a="Role">
              <Button
                onClick={() => router.push("/admin/roles/new")}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Perfil
              </Button>
            </Can>
          </div>
        </div>

        {/* Lista de Perfis */}
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando perfis…</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            <Shield className="h-12 w-12 mx-auto mb-4 text-white/20" />
            <p className="text-lg font-medium text-white/60 mb-2">
              {search ? "Nenhum perfil encontrado" : "Nenhum perfil cadastrado"}
            </p>
            <p className="text-sm text-white/40 mb-4">
              {search
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro perfil"}
            </p>
            {!search && (
              <Can I="create" a="Role">
                <Button
                  onClick={() => router.push("/admin/roles/new")}
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Perfil
                </Button>
              </Can>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                viewMode={viewMode}
                onView={() => router.push(`/admin/roles/${role.id}`)}
                onEdit={() => router.push(`/admin/roles/${role.id}/edit`)}
                onDelete={() => handleDelete(role.id, role.name)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setRoleToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={roleToDelete?.name || ""}
          itemType="perfil"
          isLoading={deleteLoading}
        />
      </div>
    </AllowedGuard>
  );
}

interface RoleCardProps {
  role: Role;
  viewMode: ViewMode;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RoleCard({
  role,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: RoleCardProps) {
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-white/90 truncate">{role.name}</h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${role.active
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}
            >
              {role.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5 rounded">
              {role.code}
            </span>
            <span className="border border-white/10 bg-black/20 px-2 py-0.5 rounded">
              {role.scope}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
            onClick={onView}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Can I="update" a="Role">
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-3"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can I="delete" a="Role">
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Can>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${role.active
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
            }`}
        >
          {role.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white/90 mb-2">{role.name}</h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="font-mono text-xs border border-white/10 bg-black/20 px-2 py-0.5 rounded">
            {role.code}
          </span>
          <span className="text-white/40">•</span>
          <span>{role.scope}</span>
        </div>
        {role.description && (
          <p className="text-sm text-white/50 line-clamp-2">{role.description}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-white/10">
        <Button
          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer"
          onClick={onView}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
        <Can I="update" a="Role">
          <Button
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Can>
        <Can I="delete" a="Role">
          <Button
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer px-3"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Can>
      </div>
    </motion.div>
  );
}

