"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2, GitMerge } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  organizationalStructureApi,
  type WorkflowPolicy,
} from "@/lib/api/organizational-structure";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";

type FormState = {
  module: string;
  flowType: string;
  active: boolean;
  config: string;
};

export function WorkflowEditClient() {
  const params = useParams<{ policyId: string }>();
  const router = useRouter();
  const policyId = params.policyId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [policy, setPolicy] = useState<WorkflowPolicy | null>(null);
  const [form, setForm] = useState<FormState>({
    module: "",
    flowType: "",
    active: true,
    config: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canSave = useMemo(
    () => form.module.trim().length >= 2 && form.flowType.trim().length >= 2,
    [form],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getWorkflowPolicy(policyId);
      setPolicy(data);
      setForm({
        module: data.module,
        flowType: data.flowType,
        active: data.active,
        config: JSON.stringify(data.config, null, 2),
      });
    } catch (error) {
      console.error("Failed to load workflow policy", error);
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        let config: Record<string, unknown> = {};
        try {
          config = JSON.parse(form.config);
        } catch {
          alert("Config inválido. Deve ser um JSON válido.");
          return;
        }
        await organizationalStructureApi.updateWorkflowPolicy({
          id: policyId,
          module: form.module.trim(),
          flowType: form.flowType.trim(),
          active: form.active,
          config,
        });
        router.push(`/admin/workflow-policies/${policyId}`);
      } catch (error) {
        console.error("Failed to update workflow policy", error);
        alert("Erro ao salvar workflow.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, policyId, router],
  );

  const onDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      setDeleting(true);
      await organizationalStructureApi.deleteWorkflowPolicy(policyId);
      router.push("/admin/workflow-policies");
    } catch (error) {
      console.error("Failed to delete workflow policy", error);
      alert("Erro ao deletar workflow.");
      setDeleting(false); // Only unset on error as success redirects
    }
  }, [policyId, router]);

  return (
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
              <GitMerge className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Editar Workflow
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Política de aprovação e workflow do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/workflow-policies/${policyId}`}>
              <Button
                variant="secondary"
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button
              variant="secondary"
              type="button"
              onClick={() => void load()}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={deleting}
              onClick={onDeleteClick}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deletando…" : "Deletar"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando…</div>
        ) : !policy ? (
          <div className="p-8 text-center text-white/50">Workflow não encontrado.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Módulo <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={form.module}
                  onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Tipo de Fluxo <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={form.flowType}
                  onChange={(e) => setForm((p) => ({ ...p, flowType: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">Status</label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className={`w-full px-4 py-3 rounded-lg border transition-all ${form.active
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                  }`}
              >
                {form.active ? "Ativo" : "Inativo"}
              </button>
            </div>

            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Configuração (JSON) <span className="text-red-400">*</span>
              </label>
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <textarea
                value={form.config}
                onChange={(e) => setForm((p) => ({ ...p, config: e.target.value }))}
                className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[200px] font-mono text-sm"
                placeholder='{"steps": [], "approvers": []}'
                required
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{policy.id}</span>
              </div>
              <Button
                type="submit"
                disabled={!canSave || saving}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Salvando…" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={policy?.module || "Workflow"}
        itemType="workflow"
        isLoading={deleting}
      />
    </div>
  );
}





