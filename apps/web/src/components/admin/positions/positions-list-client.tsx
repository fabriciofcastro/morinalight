"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  Info,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationalStructureApi, Position } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/shared/ui/notification-center";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

const PositionCard = ({
  position,
  onEdit,
  onDelete,
}: {
  position: Position;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className={cn(
        "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
        position.active ? "bg-emerald-500 text-emerald-500" : "bg-orange-500 text-orange-500"
      )} />

      <div className="p-5 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
            position.active ? "bg-emerald-500/10" : "bg-orange-500/10"
          )}>
            <Briefcase className={cn(
              "w-5 h-5",
              position.active ? "text-emerald-400" : "text-orange-400"
            )} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{position.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                {position.code}
              </span>
              <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {position.seniority}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 min-h-[40px] text-xs text-white/40">
          {position.description && (
            <p className="line-clamp-2 mb-2">{position.description}</p>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-500" />
            <span>Base: {position.baseSalary ? `R$ ${position.baseSalary.toLocaleString('pt-BR')}` : 'N/A'}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          <Can I="update" a="Position">
            <Button
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Editar
            </Button>
          </Can>
          <Can I="delete" a="Position">
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

export function PositionsListClient() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationalStructureApi.getPositions();
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setPositions(data);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar cargos." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const handleDelete = (id: string, name: string) => {
    setPositionToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!positionToDelete) return;
    setDeleteLoading(true);
    try {
      await organizationalStructureApi.deletePosition(positionToDelete.id);
      notificationCenter.add({ type: "success", title: "Sucesso", message: "Cargo excluído." });
      loadPositions();
      setDeleteDialogOpen(false);
      setPositionToDelete(null);
    } catch (error) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir cargo." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return positions.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [positions, search]);

  const stats = useMemo(() => {
    return {
      total: positions.length,
      active: positions.filter(p => p.active).length,
    };
  }, [positions]);

  return (
    <AllowedGuard I="read" a="Position" redirectTo="/admin">
      <div className="p-8 space-y-8 min-h-screen text-white pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Cargos
            </h1>
            <p className="text-white/60 mt-1">Gerencie as posições e hierarquias da empresa</p>
          </div>
          <Can I="create" a="Position">
            <Button
              onClick={() => router.push("/admin/positions/new")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
          </Can>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#09090b]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-white/40">Total de Cargos</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 bg-[#09090b]/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar cargo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-white/40">Carregando cargos...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum cargo encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(pos => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  onEdit={() => router.push(`/admin/positions/${pos.id}/edit`)}
                  onDelete={() => handleDelete(pos.id, pos.name)}
                />
              ))}
            </div>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setPositionToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={positionToDelete?.name || ""}
          itemType="cargo"
          isLoading={deleteLoading}
        />
      </div>
    </AllowedGuard>
  );
}
