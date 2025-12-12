"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { permissionsApi } from "@/lib/api/permissions";

type FormState = {
  name: string;
  module: string;
  resource: string;
  action: string;
  description: string;
};

export default function NewPermissionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    module: "settings",
    resource: "settings",
    action: "view",
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

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await permissionsApi.createPermission({
          name: form.name.trim(),
          code,
          module: form.module.trim(),
          level: form.action.trim(),
          description: form.description.trim() || undefined,
        });
        router.push("/admin/permissions");
      } catch (error) {
        console.error("Failed to create permission", error);
        alert("Erro ao criar permissão.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, code, form, router],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex items-start gap-3">
        <Link href="/admin/permissions">
          <Button variant="secondary" type="button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Nova Permissão</h1>
          <p className="mt-1 text-sm text-white/50">
            Padrão MORINA: permissionKey = <span className="font-mono">{code}</span>
          </p>
        </div>
      </div>

      <GlassCard>
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Nome</div>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Visualizar permissões"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Módulo</div>
              <Input
                value={form.module}
                onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))}
                placeholder="Ex: settings"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Resource</div>
              <Input
                value={form.resource}
                onChange={(e) => setForm((p) => ({ ...p, resource: e.target.value }))}
                placeholder="Ex: settings.permissions"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Action</div>
              <Input
                value={form.action}
                onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                placeholder="Ex: view"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-white/60">Descrição</div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Contexto e limites desta permissão…"
              className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-xs text-white/40">
              permissionKey: <span className="font-mono">{code}</span>
            </div>
            <Button type="submit" disabled={!canSave || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
