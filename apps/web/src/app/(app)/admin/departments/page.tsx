"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Edit, Layers, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Department, organizationalStructureApi } from "@/lib/api/organizational-structure";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (dept) => dept.name.toLowerCase().includes(q) || dept.code.toLowerCase().includes(q),
    );
  }, [departments, searchTerm]);

  const onDelete = useCallback(
    async (departmentId: string) => {
      const ok = confirm("Tem certeza que deseja deletar este departamento?");
      if (!ok) return;
      try {
        setDeletingId(departmentId);
        await organizationalStructureApi.deleteDepartment(departmentId);
        await loadDepartments();
      } catch (error) {
        console.error("Failed to delete department", error);
        alert("Erro ao deletar departamento.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadDepartments],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Departamentos</h1>
          <p className="mt-1 text-sm text-white/50">Company → Departamento (sem atalhos).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void loadDepartments()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/departments/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Novo Departamento
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
          <div className="p-8 text-center text-white/50">Carregando departamentos…</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhum departamento encontrado.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredDepartments.map((dept) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{dept.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {dept.code}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {dept.type}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {dept.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/departments/${dept.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === dept.id}
                    onClick={() => void onDelete(dept.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === dept.id ? "Deletando…" : "Deletar"}
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
