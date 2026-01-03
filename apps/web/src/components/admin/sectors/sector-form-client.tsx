"use client";

import { Button } from "@morina/ui";
import { Save, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Sector, type CreateSectorInput, type UpdateSectorInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface SectorFormClientProps {
  sectorId?: string;
}

export function SectorFormClient({ sectorId }: SectorFormClientProps) {
  const router = useRouter();
  const isEditing = !!sectorId;

  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<Sector | null>(null);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [sectors, setSectors] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<CreateSectorInput>({
    name: "",
    code: "",
    type: "OPERACIONAL",
    departmentId: "",
    filialId: "",
    parentId: "",
    active: true,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2 && !!form.departmentId,
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
        const [depts, brs, secs] = await Promise.all([
          organizationalStructureApi.getDepartments(),
          organizationalStructureApi.getBranches(),
          organizationalStructureApi.getSectors(),
        ]);
        setDepartments(depts.map((d) => ({ id: d.id, name: d.name })));
        setBranches(brs.map((b) => ({ id: b.id, name: b.name })));
        setSectors(secs.filter((s) => !sectorId || s.id !== sectorId).map((s) => ({ id: s.id, name: s.name })));

        if (sectorId) {
          const sec = await organizationalStructureApi.getSector(sectorId);
          setSector(sec);
          setForm({
            name: sec.name,
            code: sec.code,
            type: sec.type,
            departmentId: sec.departmentId,
            filialId: sec.filialId || "",
            parentId: sec.parentId || "",
            active: sec.active,
            description: sec.description || "",
          });
          markClean();
        } else {
          markDirty();
        }
      } catch (error) {
        console.error("Failed to load data", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao carregar dados",
          message: "Não foi possível carregar os dados do setor",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [sectorId, markClean, markDirty]);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (!form.departmentId) newErrors.departmentId = "Departamento é obrigatório";
    if (newErrors.name || newErrors.code || newErrors.departmentId) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && sectorId) {
        const updateData: UpdateSectorInput = {
          id: sectorId,
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type,
          departmentId: form.departmentId,
          filialId: form.filialId || undefined,
          parentId: form.parentId || undefined,
          active: form.active,
          description: (form.description || "").trim() || undefined,
        };
        await organizationalStructureApi.updateSector(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Setor atualizado",
          message: `Setor ${form.name} foi atualizado com sucesso`,
        });
        router.push(`/admin/sectors/${sectorId}`);
      } else {
        await organizationalStructureApi.createSector(form);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Setor criado",
          message: `Setor ${form.name} foi criado com sucesso`,
        });
        router.push("/admin/sectors");
      }
    } catch (error) {
      console.error("Failed to save sector", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar setor",
        message: "Não foi possível salvar o setor. Tente novamente.",
      });
    }
  }, [canSave, form, isEditing, sectorId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );


  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="Sector" redirectTo="/admin/sectors">
      <StandardFormPage
        title={isEditing ? "Editar Setor" : "Novo Setor"}
        subtitle={
          isEditing
            ? `Atualizar informações do setor ${sector?.name}`
            : "Cadastre um novo setor no sistema"
        }
        icon={<Layers className="h-8 w-8 text-[hsl(var(--primary))]" />}
        onSave={onSubmit}
        backUrl={isEditing && sectorId ? `/admin/sectors/${sectorId}` : "/admin/sectors"}
        isValid={canSave}
        loading={loading}
        loadingMessage="Carregando dados do setor..."
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <form onSubmit={onSubmit} className="space-y-6">
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
            <option value="" className="bg-slate-900">Selecione um departamento...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id} className="bg-slate-900">
                {dept.name}
              </option>
            ))}
          </FuturisticSelect>

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
              placeholder="Ex: Corte e Costura"
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
              placeholder="Ex: CORT"
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
              <option value="OPERACIONAL" className="bg-slate-900">Operacional</option>
              <option value="GESTAO" className="bg-slate-900">Gestão</option>
              <option value="ANALITICO" className="bg-slate-900">Analítico</option>
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
            label="Setor Pai (Opcional)"
            value={form.parentId}
            onChange={(e) => {
              setForm((p) => ({ ...p, parentId: e.target.value }));
              markDirty();
            }}
          >
            <option value="" className="bg-slate-900">Nenhum (Raiz)</option>
            {sectors.map((sec) => (
              <option key={sec.id} value={sec.id} className="bg-slate-900">
                {sec.name}
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
            placeholder="Descrição das atividades do setor..."
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
              Setor Ativo
            </label>
          </div>

          <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
            {isEditing && sector && (
              <>
                ID: <span className="font-mono">{sector.id}</span>
              </>
            )}
          </div>
        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


