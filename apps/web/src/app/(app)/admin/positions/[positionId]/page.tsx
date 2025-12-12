"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export default function PositionEditPage() {
  const params = useParams<{ positionId: string }>();
  const positionId = params.positionId;

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
        await load();
      } catch (error) {
        console.error("Failed to update position", error);
        alert("Erro ao salvar cargo.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, load, positionId],
  );

  const onDelete = useCallback(async () => {
    const ok = confirm("Tem certeza que deseja deletar este cargo?");
    if (!ok) return;
    try {
      setDeleting(true);
      await organizationalStructureApi.deletePosition(positionId);
      window.location.href = "/admin/positions";
    } catch (error) {
      console.error("Failed to delete position", error);
      alert("Erro ao deletar cargo.");
    } finally {
      setDeleting(false);
    }
  }, [positionId]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/positions">
            <Button variant="secondary" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Editar Cargo</h1>
            <p className="mt-1 text-sm text-white/50">
              Função/cargo com requisitos e responsabilidades.
            </p>
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
        ) : !position ? (
          <div className="p-8 text-center text-white/50">Cargo não encontrado.</div>
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
                <div className="text-xs font-medium text-white/60">Senioridade</div>
                <Input
                  value={form.seniority}
                  onChange={(e) => setForm((p) => ({ ...p, seniority: e.target.value }))}
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
                className="min-h-[100px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Responsabilidades</div>
                <textarea
                  value={form.responsabilidades}
                  onChange={(e) => setForm((p) => ({ ...p, responsabilidades: e.target.value }))}
                  className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Requisitos</div>
                <textarea
                  value={form.requisitos}
                  onChange={(e) => setForm((p) => ({ ...p, requisitos: e.target.value }))}
                  className="min-h-[120px] w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{position.id}</span>
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
