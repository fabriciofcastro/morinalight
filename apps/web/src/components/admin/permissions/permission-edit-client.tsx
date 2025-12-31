"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2, Key } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { type Permission, permissionsApi } from "@/lib/api/permissions";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";

type FormState = {
  name: string;
  module: string;
  resource: string;
  action: string;
  description: string;
};

export function PermissionEditClient() {
  const params = useParams<{ permissionId: string }>();
  const router = useRouter();
  const permissionId = params.permissionId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perm, setPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    module: "settings",
    resource: "",
    action: "",
    description: "",
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const code = useMemo(() => `${form.resource}:${form.action}`, [form.resource, form.action]);
  const canSave = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.module.trim() &&
      form.resource.trim() &&
      form.action.trim(),
    [form],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getPermission(permissionId);
      setPerm(data);
      const [resource, action] = data.code.includes(":")
        ? data.code.split(":", 2)
        : [data.code, data.level || ""];
      setForm({
        name: data.name,
        module: data.module,
        resource: resource || "",
        action: action || "",
        description: data.description ?? "",
      });
    } catch (error) {
      console.error("Failed to load permission", error);
      setPerm(null);
    } finally {
      setLoading(false);
    }
  }, [permissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await permissionsApi.updatePermission({
          id: permissionId,
          name: form.name.trim(),
          module: form.module.trim(),
          code,
          description: form.description.trim() || undefined,
        });
        router.push(`/admin/permissions/${permissionId}`);
      } catch (error) {
        console.error("Failed to update permission", error);
        alert("Erro ao salvar permissão.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, code, form, permissionId, router],
  );

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await permissionsApi.deletePermission(permissionId);
      router.push("/admin/permissions");
    } catch (error) {
      console.error("Failed to delete permission", error);
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }, [permissionId, router]);

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
              <Key className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Editar Permissão
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  permissionKey = <span className="font-mono text-[hsl(var(--primary))]">{code}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/permissions/${permissionId}`}>
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
              disabled={deleteLoading}
              onClick={handleDelete}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar
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
        ) : !perm ? (
          <div className="p-8 text-center text-white/50">Permissão não encontrada.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Nome <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Resource <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={form.resource}
                  onChange={(e) => setForm((p) => ({ ...p, resource: e.target.value }))}
                  placeholder="Ex: users"
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Action <span className="text-red-400">*</span>
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={form.action}
                  onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                  placeholder="Ex: create"
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
              <p className="text-sm text-white/60 mb-1">Permission Key (gerado automaticamente):</p>
              <p className="font-mono text-lg text-blue-400">{code}</p>
            </div>

            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">Descrição</label>
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[120px]"
                placeholder="Descrição da permissão..."
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{perm.id}</span>
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
        itemName={perm?.name || ""}
        itemType="permissão"
        isLoading={deleteLoading}
      />
    </div>
  );
}





