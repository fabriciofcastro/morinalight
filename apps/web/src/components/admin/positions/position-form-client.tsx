"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { StandardFormPage } from "@/components/templates";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { useAutoSave } from "@/hooks/useAutoSave";
import { organizationalStructureApi, type CreatePositionInput, type Position, type UpdatePositionInput } from "@/lib/api/organizational-structure";
import { Briefcase, DollarSign, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PositionFormClientProps {
  positionId?: string;
}

export function PositionFormClient({ positionId }: PositionFormClientProps) {
  const router = useRouter();
  const isEditing = !!positionId;

  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<Position | null>(null);
  const [form, setForm] = useState<CreatePositionInput>({
    name: "",
    code: "",
    seniority: "JUNIOR",
    baseSalary: undefined,
    active: true,
    sectorId: "",
    description: "",
    responsabilidades: "",
    requisitos: "",
    salarioMin: undefined,
    salarioMax: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"general" | "details" | "salary">("general");

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

        if (positionId) {
          const pos = await organizationalStructureApi.getPosition(positionId);
          setPosition(pos);
          setForm({
            name: pos.name,
            code: pos.code,
            seniority: pos.seniority || "JUNIOR",
            baseSalary: pos.baseSalary,
            active: pos.active,
            sectorId: pos.sectorId || "",
            description: pos.description || "",
            responsabilidades: pos.responsabilidades || "",
            requisitos: pos.requisitos || "",
            salarioMin: pos.salarioMin,
            salarioMax: pos.salarioMax,
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
          message: "Não foi possível carregar os dados do cargo",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [positionId, markClean, markDirty]);

  const handleNumberChange = (field: "baseSalary" | "salarioMin" | "salarioMax", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setForm((p) => ({ ...p, [field]: numValue }));
    markDirty();
  };

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (newErrors.name || newErrors.code) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && positionId) {
        const updateData: UpdatePositionInput = {
          id: positionId,
          name: form.name.trim(),
          code: form.code.trim(),
          seniority: form.seniority,
          baseSalary: form.baseSalary,
          active: form.active,
          description: (form.description || "").trim() || undefined,
          responsabilidades: (form.responsabilidades || "").trim() || undefined,
          requisitos: (form.requisitos || "").trim() || undefined,
          salarioMin: form.salarioMin,
          salarioMax: form.salarioMax,
        };
        await organizationalStructureApi.updatePosition(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Cargo atualizado",
          message: `Cargo ${form.name} foi atualizado com sucesso`,
        });
        router.push(`/admin/positions/${positionId}`);
      } else {
        await organizationalStructureApi.createPosition(form);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Cargo criado",
          message: `Cargo ${form.name} foi criado com sucesso`,
        });
        router.push("/admin/positions");
      }
    } catch (error) {
      console.error("Failed to save position", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar cargo",
        message: "Não foi possível salvar o cargo. Tente novamente.",
      });
    }
  }, [canSave, form, isEditing, positionId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );

  const tabs = [
    { id: "general" as const, label: "Geral", icon: Briefcase },
    { id: "details" as const, label: "Detalhes", icon: FileText },
    { id: "salary" as const, label: "Salarial", icon: DollarSign },
  ];

  return (
    <StandardFormPage
      title={isEditing ? "Editar Cargo" : "Novo Cargo"}
      subtitle={
        isEditing
          ? `Atualizar informações do cargo ${position?.name}`
          : "Cadastre um novo cargo no sistema"
      }
      icon={<Briefcase className="h-8 w-8 text-[hsl(var(--primary))]" />}
      onSave={onSubmit}
      backUrl={isEditing && positionId ? `/admin/positions/${positionId}` : "/admin/positions"}
      isValid={canSave}
      loading={loading}
      loadingMessage="Carregando dados do cargo..."
      autoSaveStatus={status}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === tab.id
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "border-transparent text-white/60 hover:text-white/80"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FuturisticInput
                label="Nome do Cargo"
                required
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                  markDirty();
                }}
                error={!!errors.name}
                errorMessage={errors.name}
                placeholder="Ex: Desenvolvedor Full Stack"
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
                placeholder="Ex: DEV-FS"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FuturisticSelect
                label="Senioridade"
                value={form.seniority}
                onChange={(e) => {
                  setForm((p) => ({ ...p, seniority: e.target.value }));
                  markDirty();
                }}
              >
                <option value="JUNIOR" className="bg-slate-900">Júnior</option>
                <option value="PLENO" className="bg-slate-900">Pleno</option>
                <option value="SENIOR" className="bg-slate-900">Sênior</option>
                <option value="ESPECIALISTA" className="bg-slate-900">Especialista</option>
                <option value="GERENTE" className="bg-slate-900">Gerente</option>
                <option value="DIRETOR" className="bg-slate-900">Diretor</option>
              </FuturisticSelect>

              <div className="flex items-center pt-6">
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
                    Cargo Ativo
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            <FuturisticTextarea
              label="Descrição"
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                markDirty();
              }}
              placeholder="Breve descrição do cargo..."
              rows={4}
            />
            <FuturisticTextarea
              label="Responsabilidades"
              value={form.responsabilidades}
              onChange={(e) => {
                setForm((p) => ({ ...p, responsabilidades: e.target.value }));
                markDirty();
              }}
              placeholder="Liste as principais responsabilidades..."
              rows={6}
            />
            <FuturisticTextarea
              label="Requisitos"
              value={form.requisitos}
              onChange={(e) => {
                setForm((p) => ({ ...p, requisitos: e.target.value }));
                markDirty();
              }}
              placeholder="Liste os requisitos necessários..."
              rows={6}
            />
          </div>
        )}

        {activeTab === "salary" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <FuturisticInput
                  label="Salário Mínimo"
                  type="number"
                  step="0.01"
                  value={form.salarioMin || ""}
                  onChange={(e) => handleNumberChange("salarioMin", e.target.value)}
                  placeholder="0,00"
                />
                <p className="mt-1 text-xs text-white/30">Valor mínimo da faixa salarial</p>
              </div>
              <div>
                <FuturisticInput
                  label="Salário Base"
                  type="number"
                  step="0.01"
                  value={form.baseSalary || ""}
                  onChange={(e) => handleNumberChange("baseSalary", e.target.value)}
                  placeholder="0,00"
                />
                <p className="mt-1 text-xs text-white/30">Valor de referência do cargo</p>
              </div>
              <div>
                <FuturisticInput
                  label="Salário Máximo"
                  type="number"
                  step="0.01"
                  value={form.salarioMax || ""}
                  onChange={(e) => handleNumberChange("salarioMax", e.target.value)}
                  placeholder="0,00"
                />
                <p className="mt-1 text-xs text-white/30">Valor máximo da faixa salarial</p>
              </div>
            </div>
            <p className="text-sm text-white/50">
              Defina a faixa salarial para este cargo. O salário base é o valor de referência.
            </p>
          </div>
        )}

        <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
          {isEditing && position && (
            <>
              ID: <span className="font-mono">{position.id}</span>
            </>
          )}
        </div>
      </form>
    </StandardFormPage>
  );
}
