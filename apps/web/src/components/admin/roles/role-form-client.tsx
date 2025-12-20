"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { permissionsApi, type Role, type CreateRoleInput, type UpdateRoleInput } from "@/lib/api/permissions";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";

interface RoleFormClientProps {
  roleId?: string;
}

export function RoleFormClient({ roleId }: RoleFormClientProps) {
  const router = useRouter();
  const isEditing = !!roleId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleInput>({
    name: "",
    code: "",
    scope: "GLOBAL",
    active: true,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

  useEffect(() => {
    const loadData = async () => {
      if (roleId) {
        try {
          setLoading(true);
          const r = await permissionsApi.getRole(roleId);
          setRole(r);
          setForm({
            name: r.name,
            code: r.code,
            scope: r.scope,
            active: r.active,
            description: r.description || "",
          });
        } catch (error) {
          console.error("Failed to load role", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    void loadData();
  }, [roleId]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;

      const newErrors: Record<string, string> = {};
      if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
      if (!form.code.trim()) newErrors.code = "Código é obrigatório";
      if (newErrors.name || newErrors.code) {
        setErrors(newErrors);
        return;
      }

      try {
        setSaving(true);
        if (isEditing && roleId) {
          const updateData: UpdateRoleInput = {
            id: roleId,
            name: form.name.trim(),
            code: form.code.trim(),
            scope: form.scope,
            active: form.active,
            description: form.description.trim() || undefined,
          };
          await permissionsApi.updateRole(updateData);
          router.push(`/admin/roles/${roleId}`);
        } else {
          await permissionsApi.createRole(form);
          router.push("/admin/roles");
        }
      } catch (error) {
        console.error("Failed to save role", error);
        alert("Erro ao salvar perfil.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, isEditing, roleId, router],
  );

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

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
              <Shield className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Perfil" : "Novo Perfil"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar informações do perfil ${role?.name}`
                    : "Cadastre um novo perfil de acesso no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && roleId ? `/admin/roles/${roleId}` : "/admin/roles"}>
              <Button
                variant="secondary"
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FuturisticInput
              label="Nome do Perfil"
              required
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
              }}
              error={!!errors.name}
              errorMessage={errors.name}
              placeholder="Ex: Administrador Geral"
            />
            <FuturisticInput
              label="Código"
              required
              value={form.code}
              onChange={(e) => {
                setForm((p) => ({ ...p, code: e.target.value }));
                if (errors.code) setErrors((e) => ({ ...e, code: "" }));
              }}
              error={!!errors.code}
              errorMessage={errors.code}
              placeholder="Ex: ADMIN_GERAL"
            />
          </div>

          <FuturisticSelect
            label="Escopo"
            value={form.scope}
            onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}
          >
            <option value="GLOBAL" className="bg-slate-900">Global</option>
            <option value="FILIAL" className="bg-slate-900">Filial</option>
            <option value="DEPARTAMENTO" className="bg-slate-900">Departamento</option>
            <option value="SETOR" className="bg-slate-900">Setor</option>
          </FuturisticSelect>

          <FuturisticTextarea
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descrição do perfil e suas responsabilidades..."
            rows={4}
          />

          <div className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
              Perfil Ativo
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && role && (
                <>
                  ID: <span className="font-mono">{role.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Perfil"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


