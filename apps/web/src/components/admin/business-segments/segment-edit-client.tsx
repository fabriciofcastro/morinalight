"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2, PieChart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  organizationalStructureApi,
  type BusinessSegment,
} from "@/lib/api/organizational-structure";
import { DeleteConfirmDialog } from "@/shared/ui/base/confirm-dialog";
import { Can } from "@/lib/auth";
import { AllowedGuard } from "@/components/auth/allowed-guard";

type FormState = {
  code: string;
  description: string;
  active: boolean;
};

export function SegmentEditClient() {
  const params = useParams<{ segmentId: string }>();
  const router = useRouter();
  const segmentId = params.segmentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [segment, setSegment] = useState<BusinessSegment | null>(null);
  const [form, setForm] = useState<FormState>({
    code: "",
    description: "",
    active: true,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canSave = useMemo(() => form.code.trim().length >= 2 && form.description.trim().length >= 2, [form]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getBusinessSegment(segmentId);
      setSegment(data);
      setForm({
        code: data.code,
        description: data.description,
        active: data.active,
      });
    } catch (error) {
      console.error("Failed to load segment", error);
      setSegment(null);
    } finally {
      setLoading(false);
    }
  }, [segmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await organizationalStructureApi.updateBusinessSegment({
          id: segmentId,
          code: form.code.trim(),
          description: form.description.trim(),
          active: form.active,
        });
        router.push(`/admin/business-segments/${segmentId}`);
      } catch (error) {
        console.error("Failed to update segment", error);
        alert("Erro ao salvar segmento.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, segmentId, router],
  );

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await organizationalStructureApi.deleteBusinessSegment(segmentId);
      router.push("/admin/business-segments");
    } catch (error) {
      console.error("Failed to delete segment", error);
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }, [segmentId, router]);

  return (
    <AllowedGuard I="update" a="Organization" redirectTo="/admin/business-segments">
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
                <PieChart className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Editar Segmento
                  </h1>
                  <p className="text-sm text-white/60 font-medium mt-1">
                    Segmento de negócio da empresa
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/business-segments/${segmentId}`}>
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
              <Can I="delete" a="Organization">
                <Button
                  variant="secondary"
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDelete}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </Button>
              </Can>
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
          ) : !segment ? (
            <div className="p-8 text-center text-white/50">Segmento não encontrado.</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="group relative">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Código <span className="text-red-400">*</span>
                  </label>
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                    required
                  />
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
              </div>

              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[120px]"
                  placeholder="Descrição do segmento..."
                  required
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div className="text-xs text-white/40">
                  ID: <span className="font-mono">{segment.id}</span>
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          itemName={segment?.description || segment?.code || ""}
          itemType="segmento"
          isLoading={deleteLoading}
        />
      </div>
    </AllowedGuard>
  );
}





