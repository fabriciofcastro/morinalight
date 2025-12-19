"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, Briefcase, FileText, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type Position, type CreatePositionInput, type UpdatePositionInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";

interface PositionFormClientProps {
  positionId?: string;
}

export function PositionFormClient({ positionId }: PositionFormClientProps) {
  const router = useRouter();
  const isEditing = !!positionId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [form, setForm] = useState<CreatePositionInput>({
    name: "",
    code: "",
    seniority: "JUNIOR",
    baseSalary: undefined,
    active: true,
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
            description: pos.description || "",
            responsabilidades: pos.responsabilidades || "",
            requisitos: pos.requisitos || "",
            salarioMin: pos.salarioMin,
            salarioMax: pos.salarioMax,
          });
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [positionId]);

  const handleNumberChange = (field: "baseSalary" | "salarioMin" | "salarioMax", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setForm((p) => ({ ...p, [field]: numValue }));
  };

  const filteredSectors = useMemo(() => {
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
        if (isEditing && positionId) {
          const updateData: UpdatePositionInput = {
            id: positionId,
            name: form.name.trim(),
            code: form.code.trim(),
            seniority: form.seniority,
            baseSalary: form.baseSalary,
            active: form.active,
            description: form.description.trim() || undefined,
            responsabilidades: form.responsabilidades.trim() || undefined,
            requisitos: form.requisitos.trim() || undefined,
            salarioMin: form.salarioMin,
            salarioMax: form.salarioMax,
          };
          await organizationalStructureApi.updatePosition(updateData);
          router.push(`/admin/positions/${positionId}`);
        } else {
          await organizationalStructureApi.createPosition(form);
          router.push("/admin/positions");
        }
      } catch (error) {
        console.error("Failed to save position", error);
        alert("Erro ao salvar cargo.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, isEditing, positionId, router],
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

  const tabs = [
    { id: "general" as const, label: "Geral", icon: Briefcase },
    { id: "details" as const, label: "Detalhes", icon: FileText },
    { id: "salary" as const, label: "Salarial", icon: DollarSign },
  ];

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
              <Briefcase className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Cargo" : "Novo Cargo"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar informações do cargo ${position?.name}`
                    : "Cadastre um novo cargo no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && positionId ? `/admin/positions/${positionId}` : "/admin/positions"}>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
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

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
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
                  onChange={(e) => setForm((p) => ({ ...p, seniority: e.target.value }))}
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
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
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
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Breve descrição do cargo..."
                rows={4}
              />
              <FuturisticTextarea
                label="Responsabilidades"
                value={form.responsabilidades}
                onChange={(e) => setForm((p) => ({ ...p, responsabilidades: e.target.value }))}
                placeholder="Liste as principais responsabilidades..."
                rows={6}
              />
              <FuturisticTextarea
                label="Requisitos"
                value={form.requisitos}
                onChange={(e) => setForm((p) => ({ ...p, requisitos: e.target.value }))}
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

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && position && (
                <>
                  ID: <span className="font-mono">{position.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Cargo"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

