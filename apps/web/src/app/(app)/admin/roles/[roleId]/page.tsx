"use client";

import { Button, cn, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { permissionsApi, type Role } from "@/lib/api/permissions";

type FormState = {
  name: string;
  code: string;
  scope: string;
  active: boolean;
  description: string;
};

export default function RoleEditPage() {
  const params = useParams<{ roleId: string }>();
  const router = useRouter();
  const roleId = params.roleId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    code: "",
    scope: "GLOBAL",
    active: true,
    description: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getRole(roleId);
      setRole(data);
      setForm({
        name: data.name,
        code: data.code,
        scope: data.scope,
        active: data.active,
        description: data.description ?? "",
      });
    } catch (error) {
      console.error("Failed to load role", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await permissionsApi.updateRole({
          id: roleId,
          name: form.name.trim(),
          code: form.code.trim(),
          scope: form.scope,
          active: form.active,
          description: form.description.trim() || undefined,
        });
        await load();
      } catch (error) {
        console.error("Failed to update role", error);
        alert("Erro ao salvar perfil.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, load, roleId],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/roles" className="mt-1 inline-flex">
            <Button variant="secondary" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Editar Perfil</h1>
            <p className="mt-1 text-sm text-white/50">
              Alterações publicam eventos e ficam rastreáveis no audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void load()} type="button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar
          </Button>
          <Button onClick={() => router.push("/admin/realtime-lab")} type="button">
            <Shield className="mr-2 h-4 w-4" />
            Abrir Realtime Lab
          </Button>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando…</div>
        ) : !role ? (
          <div className="p-8 text-center text-white/50">Perfil não encontrado.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Nome</div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Gerente de Loja"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Código</div>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="Ex: MGR_STORE"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Escopo</div>
                <div className="border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
                  <select
                    value={form.scope}
                    onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}
                    className="w-full bg-transparent outline-none"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="FILIAL">FILIAL</option>
                    <option value="DEPARTAMENTO">DEPARTAMENTO</option>
                    <option value="SETOR">SETOR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Status</div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className={cn(
                    "flex w-full items-center justify-between border px-3 py-2 text-sm transition",
                    "border-white/10 bg-black/20",
                    form.active ? "text-emerald-200" : "text-red-200",
                  )}
                >
                  <span>{form.active ? "Ativo" : "Inativo"}</span>
                  {form.active ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Descrição</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Contexto do perfil e limites de acesso…"
                className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{role.id}</span>
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


