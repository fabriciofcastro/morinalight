"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2, Briefcase } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type Position } from "@/lib/api/organizational-structure";

type FormState = {
  name: string;
  code: string;
  seniority: string;
  active: boolean;
  description: string;
  responsabilidades: string;
  requisitos: string;
};

export function PositionEditClient() {
  const params = useParams<{ positionId: string }>();
  const router = useRouter();
  const positionId = params.positionId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    code: "",
    seniority: "PLENO",
    active: true,
    description: "",
    responsabilidades: "",
    requisitos: "",
  });

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getPosition(positionId);
      setPosition(data);
      setForm({
        name: data.name,
        code: data.code,
        seniority: data.seniority,
        active: data.active,
        description: data.description ?? "",
        responsabilidades: data.responsabilidades ?? "",
        requisitos: data.requisitos ?? "",
      });
    } catch (error) {
      console.error("Failed to load position", error);
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await organizationalStructureApi.updatePosition({
          id: positionId,
          name: form.name.trim(),
          code: form.code.trim(),
          seniority: form.seniority,
          active: form.active,
          description: form.description.trim() || undefined,
          responsabilidades: form.responsabilidades.trim() || undefined,
          requisitos: form.requisitos.trim() || undefined,
        });
        router.push(`/admin/positions/${positionId}`);
      } catch (error) {
        console.error("Failed to update position", error);
        alert("Erro ao salvar cargo.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, positionId, router],
  );

  const onDelete = useCallback(async () => {
    const ok = confirm("Tem certeza que deseja deletar este cargo?");
    if (!ok) return;
    try {
      setDeleting(true);
      await organizationalStructureApi.deletePosition(positionId);
      router.push("/admin/positions");
    } catch (error) {
      console.error("Failed to delete position", error);
      alert("Erro ao deletar cargo.");
    } finally {
      setDeleting(false);
    }
  }, [positionId, router]);

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
                  Editar Cargo
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Função/cargo com requisitos e responsabilidades
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/positions/${positionId}`}>
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
              type="button"
              onClick={() => void load()}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </Button>
            <Button
              variant="secondary"
              type="button"
              disabled={deleting}
              onClick={() => void onDelete()}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deletando…" : "Deletar"}
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
        ) : !position ? (
          <div className="p-8 text-center text-white/50">Cargo não encontrado.</div>
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
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Senioridade
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <select
                  value={form.seniority}
                  onChange={(e) => setForm((p) => ({ ...p, seniority: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all"
                >
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="COORDENADOR">Coordenador</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="DIRETOR">Diretor</option>
                </select>
              </div>
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">Status</label>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    form.active
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
                className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[100px]"
                placeholder="Descrição do cargo..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Responsabilidades
                </label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <textarea
                  value={form.responsabilidades}
                  onChange={(e) => setForm((p) => ({ ...p, responsabilidades: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[120px]"
                  placeholder="Principais responsabilidades..."
                />
              </div>
              <div className="group relative">
                <label className="block text-sm font-semibold text-white/90 mb-2">Requisitos</label>
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <textarea
                  value={form.requisitos}
                  onChange={(e) => setForm((p) => ({ ...p, requisitos: e.target.value }))}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all min-h-[120px]"
                  placeholder="Requisitos para o cargo..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{position.id}</span>
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
  );
}





