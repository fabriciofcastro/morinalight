"use client";

import { Button } from "@morina/ui";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Department, type CreateDepartmentInput, type UpdateDepartmentInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface DepartmentFormClientProps {
  departmentId?: string;
}

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

export function DepartmentFormClient({ departmentId }: DepartmentFormClientProps) {
  const router = useRouter();
  const isEditing = !!departmentId;

  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<Department | null>(null);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<CreateDepartmentInput>({
    name: "",
    code: "",
    type: "CORE",
    filialId: "",
    parentId: "",
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
      try {
        setLoading(true);
        const [branchesData, departmentsData] = await Promise.all([
          organizationalStructureApi.getBranches(),
          organizationalStructureApi.getDepartments(),
        ]);
        setBranches(branchesData.map((b) => ({ id: b.id, name: b.name })));
        setDepartments(departmentsData.filter((d) => !departmentId || d.id !== departmentId).map((d) => ({ id: d.id, name: d.name })));

        if (departmentId) {
          const dept = await organizationalStructureApi.getDepartment(departmentId);
          setDepartment(dept);
          setForm({
            name: dept.name,
            code: dept.code,
            type: dept.type,
            filialId: dept.filialId || "",
            parentId: dept.parentId || "",
            active: dept.active,
            description: dept.description || "",
          });
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [departmentId]);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (newErrors.name || newErrors.code) {
      setErrors(newErrors);
      throw new Error("Formulário inválido");
    }

    const orgId = getCurrentOrgId();
    if (!orgId) {
      throw new Error("Organização não encontrada");
    }

    if (isEditing && departmentId) {
      const updateData: UpdateDepartmentInput = {
        id: departmentId,
        orgId,
        name: form.name.trim(),
        code: form.code.trim(),
        type: form.type,
        filialId: form.filialId || undefined,
        parentId: form.parentId || undefined,
        active: form.active,
        description: form.description.trim() || undefined,
      };
      await organizationalStructureApi.updateDepartment(updateData);
      notificationCenter.add({
        type: "success",
        title: "Departamento atualizado",
        message: "As alterações foram salvas com sucesso.",
      });
    } else {
      await organizationalStructureApi.createDepartment({ ...form, orgId });
      notificationCenter.add({
        type: "success",
        title: "Departamento criado",
        message: "O departamento foi criado com sucesso.",
      });
      router.push("/admin/departments");
    }
  }, [form, isEditing, departmentId, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        await handleSave();
        markClean();
        if (isEditing && departmentId) {
          router.push(`/admin/departments/${departmentId}`);
        } else {
          router.push("/admin/departments");
        }
      } catch (error) {
        console.error("Failed to save department", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar",
          message: error instanceof Error ? error.message : "Erro ao salvar departamento.",
        });
      }
    },
    [canSave, handleSave, markClean, isEditing, departmentId, router],
  );

  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="Department" redirectTo="/admin/departments">
      <StandardFormPage
        title={isEditing ? "Editar Departamento" : "Novo Departamento"}
        subtitle={
          isEditing
            ? `Atualizar informações do departamento ${department?.name}`
            : "Cadastre um novo departamento no sistema"
        }
        icon={<Building2 className="h-8 w-8" />}
        onSave={handleSubmit}
        backUrl={isEditing && departmentId ? `/admin/departments/${departmentId}` : "/admin/departments"}
        isValid={canSave}
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
        loading={loading}
        onSave={handleSubmit}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FuturisticInput
              label="Nome"
              required
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                markDirty();
              }}
              error={!!errors.name}
              errorMessage={errors.name}
              placeholder="Ex: Comercial"
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
              placeholder="Ex: COM"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FuturisticSelect
              label="Tipo"
              value={form.type}
              onChange={(e) => {
                setForm((p) => ({ ...p, type: e.target.value }));
                markDirty();
              }}
            >
              <option value="CORE" className="bg-slate-900">Core Business</option>
              <option value="SUPORTE" className="bg-slate-900">Suporte</option>
              <option value="GESTAO" className="bg-slate-900">Gestão</option>
            </FuturisticSelect>

            <FuturisticSelect
              label="Filial (Opcional)"
              value={form.filialId}
              onChange={(e) => {
                setForm((p) => ({ ...p, filialId: e.target.value }));
                markDirty();
              }}
            >
              <option value="" className="bg-slate-900">Todas as Filiais (Global)</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id} className="bg-slate-900">
                  {branch.name}
                </option>
              ))}
            </FuturisticSelect>
          </div>

          <FuturisticSelect
            label="Departamento Pai (Opcional)"
            value={form.parentId}
            onChange={(e) => {
              setForm((p) => ({ ...p, parentId: e.target.value }));
              markDirty();
            }}
          >
            <option value="" className="bg-slate-900">Nenhum (Raiz)</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id} className="bg-slate-900">
                {dept.name}
              </option>
            ))}
          </FuturisticSelect>

          <FuturisticTextarea
            label="Descrição"
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              markDirty();
            }}
            placeholder="Descrição das responsabilidades do departamento..."
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
              Departamento Ativo
            </label>
          </div>

          {isEditing && department && (
            <div className="text-xs text-white/40 pt-4 border-t border-white/10">
              ID: <span className="font-mono">{department.id}</span>
            </div>
          )}
        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


