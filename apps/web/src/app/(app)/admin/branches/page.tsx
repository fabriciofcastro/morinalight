"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Building2, Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Branch, organizationalStructureApi } from "@/lib/api/organizational-structure";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const filteredBranches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (branch) => branch.name.toLowerCase().includes(q) || branch.code.toLowerCase().includes(q),
    );
  }, [branches, searchTerm]);

  const onDelete = useCallback(
    async (branchId: string) => {
      const ok = confirm("Tem certeza que deseja deletar esta filial?");
      if (!ok) return;
      try {
        setDeletingId(branchId);
        await organizationalStructureApi.deleteBranch(branchId);
        await loadBranches();
      } catch (error) {
        console.error("Failed to delete branch", error);
        alert("Erro ao deletar filial.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadBranches],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Filiais</h1>
          <p className="mt-1 text-sm text-white/50">Unidades (Company → Filial → …).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void loadBranches()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/branches/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Nova Filial
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
          <div className="p-8 text-center text-white/50">Carregando filiais…</div>
        ) : filteredBranches.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhuma filial encontrada.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredBranches.map((branch) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{branch.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {branch.code}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {branch.type}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {branch.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/branches/${branch.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === branch.id}
                    onClick={() => void onDelete(branch.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === branch.id ? "Deletando…" : "Deletar"}
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
