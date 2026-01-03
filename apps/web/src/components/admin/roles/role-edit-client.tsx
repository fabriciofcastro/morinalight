"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Shield } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { permissionsApi, type Role } from "@/lib/api/permissions";
import { AllowedGuard } from "@/components/auth/allowed-guard";

type FormState = {
  name: string;
  code: string;
  scope: string;
  active: boolean;
  description: string;
};

export function RoleEditClient() {
  const params = useParams<{ roleId: string }>();
  const router = useRouter();
  const roleId = params.roleId as string;

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

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

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
        router.push(`/admin/roles/${roleId}`);
      } catch (error) {
        console.error("Failed to update role", error);
        alert("Erro ao salvar perfil.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, roleId, router],
  );

  return (
    <AllowedGuard I="update" a="Role" redirectTo="/admin/roles">
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
                <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Editar Perfil de Acesso
                  </h1>
                  <p className="text-sm text-white/60 font-medium mt-1">
                    Alterações publicam eventos e ficam rastreáveis no audit trail
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/roles/${roleId}`}>
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
                onClick={() => void load()}
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
              <Button
                onClick={() => router.push("/admin/realtime-lab")}
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <Shield className="mr-2 h-4 w-4" />
                Realtime Lab
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
          ) : !role ? (
            <div className="p-8 text-center text-white/50">Perfil não encontrado.</div>
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
                    placeholder="Ex: Gerente de Loja"
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                    required
                  />
                </div>
                <div className="group relative">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Código <span className="text-red-400">*</span>
                  </label>
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="Ex: MGR_STORE"
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="group relative">
                  <label className="block text-sm font-semibold text-white/90 mb-2">Escopo</label>
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    value={form.scope}
                    onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="FILIAL">FILIAL</option>
                    <option value="DEPARTAMENTO">DEPARTAMENTO</option>
                    <option value="SETOR">SETOR</option>
                  </select>
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
                <label className="block text-sm font-semibold text-white/90 mb-2">Descrição</label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Contexto do perfil e limites de acesso…"
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[120px]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div className="text-xs text-white/40">
                  ID: <span className="font-mono">{role.id}</span>
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
      </div>
    </AllowedGuard>
  );
}





