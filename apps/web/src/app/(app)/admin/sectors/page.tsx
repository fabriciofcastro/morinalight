"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Edit, Grid, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Sector } from "@/lib/api/organizational-structure";

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSectors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getSectors();
      setSectors(data);
    } catch (error) {
      console.error("Failed to load sectors", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSectors();
  }, [loadSectors]);

  const filteredSectors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return sectors;
    return sectors.filter(
      (sector) => sector.name.toLowerCase().includes(q) || sector.code.toLowerCase().includes(q),
    );
  }, [sectors, searchTerm]);

  const onDelete = useCallback(
    async (sectorId: string) => {
      const ok = confirm("Tem certeza que deseja deletar este setor?");
      if (!ok) return;
      try {
        setDeletingId(sectorId);
        await organizationalStructureApi.deleteSector(sectorId);
        await loadSectors();
      } catch (error) {
        console.error("Failed to delete sector", error);
        alert("Erro ao deletar setor.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadSectors],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Setores</h1>
          <p className="mt-1 text-sm text-white/50">Departamento → Setor.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void loadSectors()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/sectors/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Novo Setor
            </Button>
          </Link>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou código…"
            className="flex-1"
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando setores…</div>
        ) : filteredSectors.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhum setor encontrado.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredSectors.map((sector) => (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Grid className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{sector.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {sector.code}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {sector.type}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {sector.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/sectors/${sector.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === sector.id}
                    onClick={() => void onDelete(sector.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === sector.id ? "Deletando…" : "Deletar"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
