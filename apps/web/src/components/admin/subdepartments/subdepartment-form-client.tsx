"use client";

import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Subdepartment, type CreateSubdepartmentInput, type UpdateSubdepartmentInput, type Department } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";

interface SubdepartmentFormClientProps {
  subdepartmentId?: string;
  departmentId?: string;
}

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) return orgs[0].organizationId;
    } catch {}
  }
  return null;
}

export function SubdepartmentFormClient({ subdepartmentId, departmentId: initialDepartmentId }: SubdepartmentFormClientProps) {
  const router = useRouter();
  const isEditing = !!subdepartmentId;

  const [loading, setLoading] = useState(true);
  const [subdepartment, setSubdepartment] = useState<Subdepartment | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subdepartments, setSubdepartments] = useState<Subdepartment[]>([]);
  const [form, setForm] = useState<CreateSubdepartmentInput>({
    name: "",
    code: "",
    departmentId: initialDepartmentId || "",
    parentId: "",
    description: "",
    status: "ativo",
    ordem: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2 && !!form.departmentId,
    [form],
  );

  const { status, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
    onSave: async () => {
      if (!canSave) return;
      await handleSave();
    },
    intervalMs: 30000,
    requireValid: true,
    isValid: () => canSave,
    onAutoSaveComplete: () => markClean(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptsData, subdeptsData] = await Promise.all([
          organizationalStructureApi.getDepartments(),
          organizationalStructureApi.getSubdepartments(),
        ]);
        setDepartments(deptsData);
        setSubdepartments(subdeptsData.filter((s) => !subdepartmentId || s.subdepartmentId !== subdepartmentId));

        if (subdepartmentId) {
          const subdept = await organizationalStructureApi.getSubdepartment(subdepartmentId);
          setSubdepartment(subdept);
          setForm({
            name: subdept.name,
            code: subdept.code,
            departmentId: subdept.departmentId,
            parentId: subdept.parentId || "",
            description: subdept.description || "",
            status: subdept.status,
            ordem: subdept.ordem,
          });
        } else if (initialDepartmentId) {
          setForm((p) => ({ ...p, departmentId: initialDepartmentId }));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [subdepartmentId, initialDepartmentId]);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (!form.departmentId) newErrors.departmentId = "Departamento é obrigatório";
    if (newErrors.name || newErrors.code || newErrors.departmentId) {
      setErrors(newErrors);
      throw new Error("Formulário inválido");
    }

    const orgId = getCurrentOrgId();
    if (!orgId) throw new Error("Organização não encontrada");

    if (isEditing && subdepartmentId) {
      const updateData: UpdateSubdepartmentInput = {
        subdepartmentId,
        name: form.name.trim(),
        code: form.code.trim(),
        departmentId: form.departmentId,
        parentId: form.parentId || undefined,
        description: form.description?.trim() || undefined,
        status: form.status,
        ordem: form.ordem,
      };
      await organizationalStructureApi.updateSubdepartment(updateData);
      notificationCenter.add({ type: "success", title: "Subdepartamento atualizado", message: "Alterações salvas com sucesso." });
    } else {
      await organizationalStructureApi.createSubdepartment({ ...form, orgId });
      notificationCenter.add({ type: "success", title: "Subdepartamento criado", message: "Subdepartamento criado com sucesso." });
      router.push(initialDepartmentId ? `/admin/departments/${initialDepartmentId}` : "/admin/departments");
    }
  }, [form, isEditing, subdepartmentId, initialDepartmentId, router]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      try {
        await handleSave();
        markClean();
        if (isEditing && subdepartmentId) {
          router.push(`/admin/subdepartments/${subdepartmentId}`);
        } else {
          router.push(initialDepartmentId ? `/admin/departments/${initialDepartmentId}` : "/admin/departments");
        }
      } catch (error) {
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar",
          message: error instanceof Error ? error.message : "Erro ao salvar subdepartamento.",
        });
      }
    },
    [canSave, handleSave, markClean, isEditing, subdepartmentId, initialDepartmentId, router],
  );

  const filteredSubdepartments = useMemo(() => {
    if (!form.departmentId) return [];
    return subdepartments.filter((s) => s.departmentId === form.departmentId);
  }, [subdepartments, form.departmentId]);

  return (
    <StandardFormPage
      title={isEditing ? "Editar Subdepartamento" : "Novo Subdepartamento"}
      subtitle={isEditing ? `Atualizar ${subdepartment?.name}` : "Cadastre um novo subdepartamento"}
      icon={<Layers className="h-8 w-8" />}
      onSave={handleSubmit}
      backUrl={isEditing && subdepartmentId ? `/admin/subdepartments/${subdepartmentId}` : initialDepartmentId ? `/admin/departments/${initialDepartmentId}` : "/admin/departments"}
      isValid={canSave}
      autoSaveStatus={status}
      hasUnsavedChanges={hasUnsavedChanges}
      loading={loading}
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
            placeholder="Ex: Vendas"
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
            placeholder="Ex: VEN"
          />
        </div>

        <FuturisticSelect
          label="Departamento"
          required
          value={form.departmentId}
          onChange={(e) => {
            setForm((p) => ({ ...p, departmentId: e.target.value, parentId: "" }));
            if (errors.departmentId) setErrors((e) => ({ ...e, departmentId: "" }));
            markDirty();
          }}
          error={!!errors.departmentId}
          errorMessage={errors.departmentId}
        >
          <option value="" className="bg-slate-900">Selecione um departamento</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id} className="bg-slate-900">
              {dept.name}
            </option>
          ))}
        </FuturisticSelect>

        {form.departmentId && filteredSubdepartments.length > 0 && (
          <FuturisticSelect
            label="Subdepartamento Pai (Opcional)"
            value={form.parentId}
            onChange={(e) => {
              setForm((p) => ({ ...p, parentId: e.target.value }));
              markDirty();
            }}
          >
            <option value="" className="bg-slate-900">Nenhum (Raiz)</option>
            {filteredSubdepartments.map((subdept) => (
              <option key={subdept.subdepartmentId} value={subdept.subdepartmentId} className="bg-slate-900">
                {subdept.name}
              </option>
            ))}
          </FuturisticSelect>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <FuturisticSelect
            label="Status"
            value={form.status}
            onChange={(e) => {
              setForm((p) => ({ ...p, status: e.target.value as "ativo" | "inativo" | "arquivado" }));
              markDirty();
            }}
          >
            <option value="ativo" className="bg-slate-900">Ativo</option>
            <option value="inativo" className="bg-slate-900">Inativo</option>
            <option value="arquivado" className="bg-slate-900">Arquivado</option>
          </FuturisticSelect>

          <FuturisticInput
            label="Ordem"
            type="number"
            value={form.ordem}
            onChange={(e) => {
              setForm((p) => ({ ...p, ordem: parseInt(e.target.value) || 0 }));
              markDirty();
            }}
            placeholder="0"
          />
        </div>

        <FuturisticTextarea
          label="Descrição"
          value={form.description}
          onChange={(e) => {
            setForm((p) => ({ ...p, description: e.target.value }));
            markDirty();
          }}
          placeholder="Descrição do subdepartamento..."
          rows={4}
        />
      </form>
    </StandardFormPage>
  );
}






