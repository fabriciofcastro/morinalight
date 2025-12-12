"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type Department, organizationalStructureApi } from "@/lib/api/organizational-structure";

type FormState = {
  name: string;
  code: string;
  type: string;
  active: boolean;
  description: string;
};

export default function DepartmentEditPage() {
  const params = useParams<{ departmentId: string }>();
  const departmentId = params.departmentId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dept, setDept] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    code: "",
    type: "OPERACIONAL",
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
      const data = await organizationalStructureApi.getDepartment(departmentId);
      setDept(data);
      setForm({
        name: data.name,
        code: data.code,
        type: data.type,
        active: data.active,
        description: data.description ?? "",
      });
    } catch (error) {
      console.error("Failed to load department", error);
      setDept(null);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await organizationalStructureApi.updateDepartment({
          id: departmentId,
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type,
          active: form.active,
          description: form.description.trim() || undefined,
        });
        await load();
      } catch (error) {
        console.error("Failed to update department", error);
        alert("Erro ao salvar departamento.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, departmentId, form, load],
  );

  const onDelete = useCallback(async () => {
    const ok = confirm("Tem certeza que deseja deletar este departamento?");
    if (!ok) return;
    try {
      setDeleting(true);
      await organizationalStructureApi.deleteDepartment(departmentId);
      window.location.href = "/admin/departments";
    } catch (error) {
      console.error("Failed to delete department", error);
      alert("Erro ao deletar departamento.");
    } finally {
      setDeleting(false);
    }
  }, [departmentId]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/departments">
            <Button variant="secondary" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Editar Departamento
            </h1>
            <p className="mt-1 text-sm text-white/50">Base organizacional (DDD + RBAC).</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deletando…" : "Deletar"}
          </Button>
        </div>
      </div>

      <GlassCard>
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando…</div>
        ) : !dept ? (
          <div className="p-8 text-center text-white/50">Departamento não encontrado.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Nome</div>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Código</div>
                <Input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Tipo</div>
                <Input
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Ativo?</div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className="w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                >
                  {form.active ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60">Descrição</div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{dept.id}</span>
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
