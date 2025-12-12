"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Briefcase, Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Position } from "@/lib/api/organizational-structure";

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getPositions();
      setPositions(data);
    } catch (error) {
      console.error("Failed to load positions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPositions();
  }, [loadPositions]);

  const filteredPositions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter(
      (pos) => pos.name.toLowerCase().includes(q) || pos.code.toLowerCase().includes(q),
    );
  }, [positions, searchTerm]);

  const onDelete = useCallback(
    async (positionId: string) => {
      const ok = confirm("Tem certeza que deseja deletar este cargo?");
      if (!ok) return;
      try {
        setDeletingId(positionId);
        await organizationalStructureApi.deletePosition(positionId);
        await loadPositions();
      } catch (error) {
        console.error("Failed to delete position", error);
        alert("Erro ao deletar cargo.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadPositions],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Cargos</h1>
          <p className="mt-1 text-sm text-white/50">Setor → Cargo (Position).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void loadPositions()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/positions/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cargo
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
          <div className="p-8 text-center text-white/50">Carregando cargos…</div>
        ) : filteredPositions.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhum cargo encontrado.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredPositions.map((pos) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{pos.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {pos.code}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {pos.seniority}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {pos.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/positions/${pos.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === pos.id}
                    onClick={() => void onDelete(pos.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === pos.id ? "Deletando…" : "Deletar"}
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
