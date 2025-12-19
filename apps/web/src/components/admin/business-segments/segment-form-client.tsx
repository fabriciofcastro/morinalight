"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type BusinessSegment, type CreateBusinessSegmentInput, type UpdateBusinessSegmentInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";

interface SegmentFormClientProps {
  segmentId?: string;
}

export function SegmentFormClient({ segmentId }: SegmentFormClientProps) {
  const router = useRouter();
  const isEditing = !!segmentId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [segment, setSegment] = useState<BusinessSegment | null>(null);
  const [form, setForm] = useState<CreateBusinessSegmentInput>({
    code: "",
    description: "",
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSave = useMemo(
    () => form.code.trim().length >= 2 && form.description.trim().length >= 2,
    [form],
  );

  useEffect(() => {
    const loadData = async () => {
      if (segmentId) {
        try {
          setLoading(true);
          const seg = await organizationalStructureApi.getBusinessSegment(segmentId);
          setSegment(seg);
          setForm({
            code: seg.code,
            description: seg.description,
            active: seg.active,
          });
        } catch (error) {
          console.error("Failed to load segment", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    void loadData();
  }, [segmentId]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;

      const newErrors: Record<string, string> = {};
      if (!form.code.trim()) newErrors.code = "Código é obrigatório";
      if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";
      if (newErrors.code || newErrors.description) {
        setErrors(newErrors);
        return;
      }

      try {
        setSaving(true);
        if (isEditing && segmentId) {
          const updateData: UpdateBusinessSegmentInput = {
            id: segmentId,
            code: form.code.trim(),
            description: form.description.trim(),
            active: form.active,
          };
          await organizationalStructureApi.updateBusinessSegment(updateData);
          router.push(`/admin/business-segments/${segmentId}`);
        } else {
          await organizationalStructureApi.createBusinessSegment(form);
          router.push("/admin/business-segments");
        }
      } catch (error) {
        console.error("Failed to save segment", error);
        alert("Erro ao salvar segmento.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, isEditing, segmentId, router],
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
              <Tag className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Segmento" : "Novo Segmento"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar informações do segmento ${segment?.code}`
                    : "Cadastre um novo segmento de negócio no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && segmentId ? `/admin/business-segments/${segmentId}` : "/admin/business-segments"}>
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
            placeholder="Ex: VAREJO"
          />

          <FuturisticTextarea
            label="Descrição"
            required
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              if (errors.description) setErrors((e) => ({ ...e, description: "" }));
            }}
            error={!!errors.description}
            errorMessage={errors.description}
            placeholder="Descrição do segmento de negócio..."
            rows={6}
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
              Segmento Ativo
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && segment && (
                <>
                  ID: <span className="font-mono">{segment.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Segmento"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

