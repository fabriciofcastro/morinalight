"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Network,
  Plus,
  Search,
  Trash2,
  Layers,
  Store
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { organizationalStructureApi, Sector } from "@/lib/api/organizational-structure";
import { notificationCenter } from "@/components/notifications/notification-center";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

// Componente de Card de Setor
const SectorCard = ({
  sector,
  onEdit,
  onDelete,
}: {
  sector: Sector;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className={cn(
        "absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_currentColor]",
        sector.active ? "bg-emerald-500 text-emerald-500" : "bg-orange-500 text-orange-500"
      )} />

      <div className="p-5 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 shadow-lg",
            sector.active ? "bg-emerald-500/10" : "bg-orange-500/10"
          )}>
            <Layers className={cn(
              "w-5 h-5",
              sector.active ? "text-emerald-400" : "text-orange-400"
            )} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{sector.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                {sector.code}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 min-h-[40px] text-xs text-white/40">
          {sector.description && (
            <p className="line-clamp-2 mb-2">{sector.description}</p>
          )}
          {sector.departmentId && (
            <div className="flex items-center gap-2">
              <Network className="w-3 h-3" />
              <span>Dep ID: {sector.departmentId.substring(0, 8)}...</span>
            </div>
          )}
          {sector.filialId && (
            <div className="flex items-center gap-2">
              <Store className="w-3 h-3" />
              <span>Filial ID: {sector.filialId.substring(0, 8)}...</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          <Button
            className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10"
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export function SectorsListClient() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadSectors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationalStructureApi.getSectors();
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setSectors(data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar setores." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSectors();
  }, [loadSectors]);

  const handleDelete = (id: string, name: string) => {
    setSectorToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!sectorToDelete) return;
    setDeleteLoading(true);
    try {
      await organizationalStructureApi.deleteSector(sectorToDelete.id);
      notificationCenter.add({ type: "success", title: "Sucesso", message: "Setor excluído." });
      loadSectors();
      setDeleteDialogOpen(false);
      setSectorToDelete(null);
    } catch (error) {
      notificationCenter.add({ type: "error", title: "Erro", message: "Erro ao excluir setor." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return sectors.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [sectors, search]);

  const stats = useMemo(() => {
    return {
      total: sectors.length,
      active: sectors.filter(s => s.active).length,
    };
  }, [sectors]);

  return (
    <div className="p-8 space-y-8 min-h-screen text-white pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Setores
          </h1>
          <p className="text-white/60 mt-1">Gerencie as divisões funcionais e operacionais</p>
        </div>
        <Button
          onClick={() => router.push("/admin/sectors/new")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-400/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Setor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[#09090b]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-white/40">Total de Setores</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-6 h-6" />
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
              placeholder="Buscar setor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/40">Carregando setores...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40 border border-white/5 border-dashed rounded-xl">Nenhum setor encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(sector => (
              <SectorCard
                key={sector.id}
                sector={sector}
                onEdit={() => router.push(`/admin/sectors/${sector.id}/edit`)}
                onDelete={() => handleDelete(sector.id, sector.name)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSectorToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={sectorToDelete?.name || ""}
        itemType="setor"
        isLoading={deleteLoading}
      />
    </div>
  );
}
