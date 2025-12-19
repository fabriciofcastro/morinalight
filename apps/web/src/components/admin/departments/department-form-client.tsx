"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, RefreshCw, Building2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type Department, type CreateDepartmentInput, type UpdateDepartmentInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";

interface DepartmentFormClientProps {
  departmentId?: string;
}

export function DepartmentFormClient({ departmentId }: DepartmentFormClientProps) {
  const router = useRouter();
  const isEditing = !!departmentId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        if (isEditing && departmentId) {
          const updateData: UpdateDepartmentInput = {
            id: departmentId,
            name: form.name.trim(),
            code: form.code.trim(),
            type: form.type,
            filialId: form.filialId || undefined,
            parentId: form.parentId || undefined,
            active: form.active,
            description: form.description.trim() || undefined,
          };
          await organizationalStructureApi.updateDepartment(updateData);
          router.push(`/admin/departments/${departmentId}`);
        } else {
          await organizationalStructureApi.createDepartment(form);
          router.push("/admin/departments");
        }
      } catch (error) {
        console.error("Failed to save department", error);
        alert("Erro ao salvar departamento.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, isEditing, departmentId, router],
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
              <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Departamento" : "Novo Departamento"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar informações do departamento ${department?.name}`
                    : "Cadastre um novo departamento no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && departmentId ? `/admin/departments/${departmentId}` : "/admin/departments"}>
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
              label="Nome"
              required
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
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
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="CORE" className="bg-slate-900">Core Business</option>
              <option value="SUPORTE" className="bg-slate-900">Suporte</option>
              <option value="GESTAO" className="bg-slate-900">Gestão</option>
            </FuturisticSelect>

            <FuturisticSelect
              label="Filial (Opcional)"
              value={form.filialId}
              onChange={(e) => setForm((p) => ({ ...p, filialId: e.target.value }))}
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
            onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
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
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Descrição das responsabilidades do departamento..."
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
              Departamento Ativo
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && department && (
                <>
                  ID: <span className="font-mono">{department.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Departamento"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

