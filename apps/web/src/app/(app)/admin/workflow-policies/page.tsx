"use client";

import { motion } from "framer-motion";
import { Edit, GitMerge, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageBackground } from "@/components/page-background";
import {
  organizationalStructureApi,
  type WorkflowPolicy,
} from "@/lib/api/organizational-structure";

export default function WorkflowPoliciesPage() {
  const [policies, setPolicies] = useState<WorkflowPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getWorkflowPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to load workflow policies", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  const filteredPolicies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (policy) =>
        policy.module.toLowerCase().includes(q) || policy.flowType.toLowerCase().includes(q),
    );
  }, [policies, searchTerm]);

  return (
    <>
      <PageBackground variant="dashboard" />
      <div className="relative space-y-6 rounded-[var(--r-lg)] p-[var(--space-2)] overflow-hidden">
        {/* Overlays futuristas */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 holo-grid opacity-20" />
          <div className="beam-line absolute left-[7%] top-0 h-full w-[1px] opacity-35" />
          <div className="beam-line absolute right-[15%] top-0 h-full w-[1px] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(109,213,255,0.08),transparent_38%)]" />
        </div>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Workflows</h1>
            <p className="mt-1 text-sm text-white/50">
              Gerencie as políticas de aprovação e workflows
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/workflow-policies/new?template=rbac-permission-change">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.10)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary)/0.16)]"
              >
                <Sparkles className="h-4 w-4" />
                Template RBAC (aprovação)
              </button>
            </Link>
            <Link href="/admin/workflow-policies/new">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8]"
              >
                <Plus className="h-4 w-4" />
                Novo Workflow
              </button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 rounded-xl border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent_12%)] p-4 backdrop-blur-2xl shadow-[0_18px_80px_-32px_rgba(109,213,255,0.25)]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Buscar por módulo ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent_10%)] backdrop-blur-2xl overflow-hidden shadow-[0_24px_96px_-32px_rgba(109,213,255,0.28)]">
          {loading ? (
            <div className="p-8 text-center text-white/50">Carregando workflows...</div>
          ) : filteredPolicies.length === 0 ? (
            <div className="p-8 text-center text-white/50">Nenhum workflow encontrado.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredPolicies.map((policy) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                      <GitMerge className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{policy.module}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <span className="font-mono bg-white/10 px-1 rounded">
                            {policy.flowType}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${policy.active ? "bg-emerald-400" : "bg-red-400"}`}
                          />
                          {policy.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
