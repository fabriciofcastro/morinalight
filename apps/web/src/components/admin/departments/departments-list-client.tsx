"use client";

import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@morina/ui";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  MapPin,
  Plus,
  Search,
  Store,
  TrendingUp,
  XCircle,
  LayoutGrid,
  Map as MapIcon,
  BarChart3,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Users,
  Network
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationalStructureApi, Department } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

// Componente de Card de Departamento
const DepartmentCard = ({
  department,
  onEdit,
  onDelete,
  viewMode = "grid",
}: {
  department: Department;
  onEdit: () => void;
  onDelete: () => void;
  viewMode?: "grid" | "list";
}) => {
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center justify-between p-4 bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:border-blue-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
            department.active ? "bg-emerald-500/10" : "bg-orange-500/10"
          )}>
            <Network className={cn(
              "w-5 h-5",
              department.active ? "text-emerald-400" : "text-orange-400"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base leading-tight">{department.name}</h3>
              <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                {department.code}
              </span>
            </div>
            {department.description && (
              <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{department.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border hidden md:inline-flex",
            department.active
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-orange-500/10 border-orange-500/20 text-orange-400"
          )}>
            {department.active ? "Ativo" : "Inativo"}
          </span>

          <div className="flex gap-1">
            <Can I="update" a="Department">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={onEdit}>
                <Pencil className="w-4 h-4" />
              </Button>
            </Can>
            <Can I="delete" a="Department">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Status Line */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
        department.active ? "bg-emerald-500 text-emerald-500" : "bg-orange-500 text-orange-500"
      )} />

      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
              department.active ? "bg-emerald-500/10" : "bg-orange-500/10"
            )}>
              <Network className={cn(
                "w-5 h-5",
                department.active ? "text-emerald-400" : "text-orange-400"
              )} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{department.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                  {department.code}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border",
                  department.active
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  {department.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 min-h-[40px]">
          {department.description && (
            <p className="text-sm text-white/60 line-clamp-2">{department.description}</p>
          )}
          {department.filialId && (
            <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
              <Store className="w-3 h-3" />
              <span>Vinculado à Filial (ID: {department.filialId.substring(0, 8)}...)</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          <Can I="update" a="Department">
            <Button
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Editar
            </Button>
          </Can>
          <Can I="delete" a="Department">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Can>
        </div>
      </div>
    </motion.div>
  );
};

export function DepartmentsListClient() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationalStructureApi.getDepartments();
      // Adjust if response is array or object with data property
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setDepartments(data);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
      notificationCenter.add({
        type: "error", // Assuming notificationCenter supports 'error' type
        title: "Erro",
        message: "Não foi possível carregar os departamentos.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleDelete = (id: string, name: string) => {
    setDepartmentToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    setDeleteLoading(true);
    try {
      await organizationalStructureApi.deleteDepartment(departmentToDelete.id);
      notificationCenter.add({ type: "success", title: "Sucesso", message: "Departamento excluído." });
      loadDepartments();
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch (error) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir departamento." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return departments.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const stats = useMemo(() => {
    return {
      total: departments.length,
      active: departments.filter(d => d.active).length,
    };
  }, [departments]);

  return (
    <AllowedGuard I="read" a="Department" redirectTo="/admin">
      <div className="p-8 space-y-8 min-h-screen text-white pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Departamentos
            </h1>
            <p className="text-white/60 mt-1">Gerencie as áreas e centros de custo da organização</p>
          </div>
          <Can I="create" a="Department">
            <Button
              onClick={() => router.push("/admin/departments/new")}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </Button>
          </Can>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-[#09090b]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-white/40">Total de Departamentos</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Network className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-[#09090b]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-white/40">Ativos</p>
                <h3 className="text-3xl font-bold text-emerald-400 mt-1">{stats.active}</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters & Content */}
        <div className="space-y-4">
          <div className="flex gap-4 bg-[#09090b]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-white/40 mt-4">Carregando departamentos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#09090b]/20 rounded-xl border border-white/5 border-dashed">
              <Network className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">Nenhum departamento encontrado.</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
              {filtered.map(dept => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  viewMode={viewMode}
                  onEdit={() => router.push(`/admin/departments/${dept.id}/edit`)}
                  onDelete={() => handleDelete(dept.id, dept.name)}
                />
              ))}
            </div>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDepartmentToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={departmentToDelete?.name || ""}
          itemType="departamento"
          isLoading={deleteLoading}
        />
      </div>
    </AllowedGuard>
  );
}
