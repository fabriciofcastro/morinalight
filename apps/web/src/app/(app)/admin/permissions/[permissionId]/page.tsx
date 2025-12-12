"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type Permission, permissionsApi } from "@/lib/api/permissions";

type FormState = {
  name: string;
  module: string;
  resource: string;
  action: string;
  description: string;
};

export default function PermissionEditPage() {
  const params = useParams<{ permissionId: string }>();
  const permissionId = params.permissionId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [perm, setPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    module: "settings",
    resource: "",
    action: "",
    description: "",
  });

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
        : [data.code, data.level];
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
        await load();
      } catch (error) {
        console.error("Failed to update permission", error);
        alert("Erro ao salvar permissão.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, code, form, load, permissionId],
  );

  const onDelete = useCallback(async () => {
    const ok = confirm(
      "Tem certeza que deseja deletar esta permissão? Isso pode afetar regras e perfis.",
    );
    if (!ok) return;
    try {
      setDeleting(true);
      await permissionsApi.deletePermission(permissionId);
      window.location.href = "/admin/permissions";
    } catch (error) {
      console.error("Failed to delete permission", error);
      alert("Erro ao deletar permissão.");
    } finally {
      setDeleting(false);
    }
  }, [permissionId]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/permissions">
            <Button variant="secondary" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Editar Permissão</h1>
            <p className="mt-1 text-sm text-white/50">
              permissionKey = <span className="font-mono">{code}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deletando…" : "Deletar"}
          </Button>
        </div>
      </div>

      <GlassCard>
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando…</div>
        ) : !perm ? (
          <div className="p-8 text-center text-white/50">Permissão não encontrada.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Nome</div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Módulo</div>
                <Input
                  value={form.module}
                  onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Resource</div>
                <Input
                  value={form.resource}
                  onChange={(e) => setForm((p) => ({ ...p, resource: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Action</div>
                <Input
                  value={form.action}
                  onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Descrição</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{perm.id}</span>
              </div>
              <Button type="submit" disabled={!canSave || saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
