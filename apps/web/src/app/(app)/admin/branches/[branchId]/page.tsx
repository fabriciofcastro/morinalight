"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { ArrowLeft, RefreshCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type Branch, organizationalStructureApi } from "@/lib/api/organizational-structure";

type FormState = {
  name: string;
  code: string;
  type: string;
  active: boolean;
  phone: string;
  email: string;
  cnpj: string;
  stateRegistration: string;
};

export default function BranchEditPage() {
  const params = useParams<{ branchId: string }>();
  const branchId = params.branchId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    code: "",
    type: "MATRIZ",
    active: true,
    phone: "",
    email: "",
    cnpj: "",
    stateRegistration: "",
  });

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationalStructureApi.getBranch(branchId);
      setBranch(data);
      setForm({
        name: data.name,
        code: data.code,
        type: data.type,
        active: data.active,
        phone: data.phone ?? "",
        email: data.email ?? "",
        cnpj: data.cnpj ?? "",
        stateRegistration: data.stateRegistration ?? "",
      });
    } catch (error) {
      console.error("Failed to load branch", error);
      setBranch(null);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;
      try {
        setSaving(true);
        await organizationalStructureApi.updateBranch({
          id: branchId,
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type,
          active: form.active,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          cnpj: form.cnpj.trim() || undefined,
          stateRegistration: form.stateRegistration.trim() || undefined,
        });
        await load();
      } catch (error) {
        console.error("Failed to update branch", error);
        alert("Erro ao salvar filial.");
      } finally {
        setSaving(false);
      }
    },
    [branchId, canSave, form, load],
  );

  const onDelete = useCallback(async () => {
    const ok = confirm("Tem certeza que deseja deletar esta filial?");
    if (!ok) return;
    try {
      setDeleting(true);
      await organizationalStructureApi.deleteBranch(branchId);
      window.location.href = "/admin/branches";
    } catch (error) {
      console.error("Failed to delete branch", error);
      alert("Erro ao deletar filial.");
    } finally {
      setDeleting(false);
    }
  }, [branchId]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/branches">
            <Button variant="secondary" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Editar Filial</h1>
            <p className="mt-1 text-sm text-white/50">
              Dados cadastrais e operacionais da unidade.
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
        ) : !branch ? (
          <div className="p-8 text-center text-white/50">Filial não encontrada.</div>
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
                <div className="text-xs font-medium text-white/60">Ativa?</div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                  className="w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                >
                  {form.active ? "Ativa" : "Inativa"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Telefone</div>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Email</div>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">CNPJ</div>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-white/60">Inscrição Estadual</div>
                <Input
                  value={form.stateRegistration}
                  onChange={(e) => setForm((p) => ({ ...p, stateRegistration: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-white/40">
                ID: <span className="font-mono">{branch.id}</span>
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
