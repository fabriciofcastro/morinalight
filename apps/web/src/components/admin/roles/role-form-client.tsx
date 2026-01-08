"use client";

import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { permissionsApi, type Role, type CreateRoleInput, type UpdateRoleInput } from "@/lib/api/permissions";
import { FuturisticInput } from "@/shared/ui/base/futuristic-input";
import { FuturisticSelect } from "@/shared/ui/base/futuristic-select";
import { FuturisticTextarea } from "@/shared/ui/base/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/shared/ui/notification-center";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface RoleFormClientProps {
  roleId?: string;
}

export function RoleFormClient({ roleId }: RoleFormClientProps) {
  const router = useRouter();
  const isEditing = !!roleId;

  const [loading, setLoading] = useState(true);
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

  // Auto-save
  const { status, hasUnsavedChanges, markDirty, markClean, manualSave } = useAutoSave({
    onSave: async () => {
      if (!canSave) return;
      await handleSave();
    },
    intervalMs: 30000, // 30 segundos
    requireValid: true,
    isValid: () => canSave,
    onAutoSaveComplete: () => {
      markClean();
    },
  });

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
          markClean();
        } catch (error) {
          console.error("Failed to load role", error);
          notificationCenter.add({
            type: "error",
            title: "Erro ao carregar dados",
            message: "Não foi possível carregar os dados do perfil",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        markDirty();
      }
    };

    void loadData();
  }, [roleId, markClean, markDirty]);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (newErrors.name || newErrors.code) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && roleId) {
        const updateData: UpdateRoleInput = {
          id: roleId,
          name: form.name.trim(),
          code: form.code.trim(),
          scope: form.scope,
          active: form.active,
          description: (form.description || "").trim() || undefined,
        };
        await permissionsApi.updateRole(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Perfil atualizado",
          message: `Perfil ${form.name} foi atualizado com sucesso`,
        });
        router.push(`/admin/roles/${roleId}`);
      } else {
        await permissionsApi.createRole(form);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Perfil criado",
          message: `Perfil ${form.name} foi criado com sucesso`,
        });
        router.push("/admin/roles");
      }
    } catch (error) {
      console.error("Failed to save role", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar perfil",
        message: "Não foi possível salvar o perfil. Tente novamente.",
      });
    }
  }, [canSave, form, isEditing, roleId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );

  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="Role" redirectTo="/admin/roles">
      <StandardFormPage
        title={isEditing ? "Editar Perfil" : "Novo Perfil"}
        subtitle={
          isEditing
            ? `Atualizar informações do perfil ${role?.name}`
            : "Cadastre um novo perfil de acesso no sistema"
        }
        icon={<Shield className="h-8 w-8 text-[hsl(var(--primary))]" />}
        onSave={onSubmit}
        backUrl={isEditing && roleId ? `/admin/roles/${roleId}` : "/admin/roles"}
        isValid={canSave}
        loading={loading}
        loadingMessage="Carregando dados do perfil..."
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
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
                markDirty();
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
                markDirty();
              }}
              error={!!errors.code}
              errorMessage={errors.code}
              placeholder="Ex: ADMIN_GERAL"
            />
          </div>

          <FuturisticSelect
            label="Escopo"
            value={form.scope}
            onChange={(e) => {
              setForm((p) => ({ ...p, scope: e.target.value }));
              markDirty();
            }}
          >
            <option value="GLOBAL" className="bg-slate-900">Global</option>
            <option value="FILIAL" className="bg-slate-900">Filial</option>
            <option value="DEPARTAMENTO" className="bg-slate-900">Departamento</option>
            <option value="SETOR" className="bg-slate-900">Setor</option>
          </FuturisticSelect>

          <FuturisticTextarea
            label="Descrição"
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              markDirty();
            }}
            placeholder="Descrição do perfil e suas responsabilidades..."
            rows={4}
          />

          <div className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => {
                setForm((p) => ({ ...p, active: e.target.checked }));
                markDirty();
              }}
              className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
              Perfil Ativo
            </label>
          </div>

          <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
            {isEditing && role && (
              <>
                ID: <span className="font-mono">{role.id}</span>
              </>
            )}
          </div>
        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


