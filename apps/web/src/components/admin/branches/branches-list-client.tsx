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
  Copy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationsApi, Organization } from "@/lib/api/organizations";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { Can } from "@/lib/auth";
import { AllowedGuard } from "@/components/auth/allowed-guard";

// Componente de Card de Filial
const BranchCard = ({
  organization,
  onEdit,
  onDelete,
  onClone,
}: {
  organization: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}) => {
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
        organization.isActive ? "bg-emerald-500 text-emerald-500" : "bg-orange-500 text-orange-500"
      )} />

      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
              organization.isActive ? "bg-emerald-500/10" : "bg-orange-500/10"
            )}>
              <Store className={cn(
                "w-5 h-5",
                organization.isActive ? "text-emerald-400" : "text-orange-400"
              )} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{organization.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                  {organization.code}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border",
                  organization.isActive
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  {organization.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <Can I="update" a="Branch">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={onEdit}>
                <Pencil className="w-4 h-4" />
              </Button>
            </Can>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {organization.city && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MapPin className="w-4 h-4 text-blue-400/70" />
              <span>{organization.city}, {organization.state}</span>
            </div>
          )}
          {organization.phone && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="w-4 h-4 flex items-center justify-center text-xs font-mono bg-white/10 rounded">T</span>
              <span>{organization.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          <Can I="update" a="Branch">
            <Button
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Editar
            </Button>
          </Can>
          <Can I="create" a="Branch">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 border-white/10 hover:bg-white/10 text-white/60 hover:text-white"
              onClick={onClone}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </Can>
          <Can I="delete" a="Branch">
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

export function BranchesListClient() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      // Simulação de delay para ver o skeleton/loading state
      await new Promise(resolve => setTimeout(resolve, 600));

      const response = await organizationsApi.findAll();
      setOrganizations(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar filiais:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar",
        message: "Não foi possível carregar a lista de filiais."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleDelete = (id: string, name: string) => {
    setOrgToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orgToDelete) return;
    setDeleteLoading(true);
    try {
      await organizationsApi.remove(orgToDelete.id);
      notificationCenter.add({
        type: "success",
        title: "Filial removida",
        message: "A filial foi excluída com sucesso."
      });
      loadOrganizations();
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao excluir",
        message: "Não foi possível excluir a filial."
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  return (
    <AllowedGuard I="read" a="Branch" redirectTo="/admin">
      <div className="relative min-h-screen p-8 text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            >
              Filiais
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 mt-1"
            >
              Gerenciamento das unidades operacionais
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3"
          >
            <Can I="create" a="Branch">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity" />
                <Button
                  onClick={() => router.push("/admin/branches/new")}
                  className="relative bg-[#09090b] text-white border border-white/10 hover:bg-white/5"
                >
                  <Plus className="w-4 h-4 mr-2 text-blue-400" />
                  Nova Filial
                </Button>
              </div>
            </Can>
          </motion.div>
        </div>

        {/* Stats e Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Card: Total */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Store className="w-12 h-12" />
            </div>
            <p className="text-sm text-white/40 font-medium uppercase tracking-wider">Total de Unidades</p>
            <h4 className="text-3xl font-bold mt-1 text-white">{organizations.length}</h4>
          </motion.div>

          {/* Stats Card: Ativas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity text-emerald-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <p className="text-sm text-emerald-400/60 font-medium uppercase tracking-wider">Ativas</p>
            <h4 className="text-3xl font-bold mt-1 text-emerald-400">
              {organizations.filter(o => o.isActive).length}
            </h4>
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 backdrop-blur-sm focus-within:border-blue-500/50 transition-colors"
          >
            <Search className="w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou cidade..."
              className="w-full bg-transparent border-none py-4 text-white placeholder:text-white/20 focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Tabs Layout */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <ViewModeToggle
            viewMode={viewMode}
            onChange={(mode) => setViewMode(mode as "grid" | "map")}
            modes={["grid", "map"]}
          />
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : viewMode === "grid" ? (
            filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org, i) => (
                  <BranchCard
                    key={org.id}
                    organization={org}
                    onEdit={() => router.push(`/admin/branches/${org.id}/edit`)}
                    onDelete={() => handleDelete(org.id, org.name)}
                    onClone={() => { }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <Store className="w-20 h-20 mb-4 opacity-20" />
                <p className="text-lg">Nenhuma filial encontrada.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
              <MapIcon className="w-20 h-20 mb-4 text-blue-500/40" />
              <h3 className="text-xl font-bold text-white mb-2">Visualização de Mapa</h3>
              <p className="text-white/40 max-w-md text-center">
                A visualização geoespacial das filiais estará disponível na próxima atualização do sistema.
              </p>
            </div>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setOrgToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={orgToDelete?.name || ""}
          itemType="filial"
          isLoading={deleteLoading}
        />
      </div>
    </AllowedGuard>
  );
}
