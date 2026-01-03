"use client";

import { Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type BusinessSegment, type CreateBusinessSegmentInput, type UpdateBusinessSegmentInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface SegmentFormClientProps {
  segmentId?: string;
}

export function SegmentFormClient({ segmentId }: SegmentFormClientProps) {
  const router = useRouter();
  const isEditing = !!segmentId;

  const [loading, setLoading] = useState(true);
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
          markClean();
        } catch (error) {
          console.error("Failed to load segment", error);
          notificationCenter.add({
            type: "error",
            title: "Erro ao carregar dados",
            message: "Não foi possível carregar os dados do segmento",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        markDirty();
      }
    };

    void loadData();
  }, [segmentId, markClean, markDirty]);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";
    if (newErrors.code || newErrors.description) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && segmentId) {
        const updateData: UpdateBusinessSegmentInput = {
          id: segmentId,
          code: form.code.trim(),
          description: form.description.trim(),
          active: form.active,
        };
        await organizationalStructureApi.updateBusinessSegment(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Segmento atualizado",
          message: `Segmento ${form.code} foi atualizado com sucesso`,
        });
        router.push(`/admin/business-segments/${segmentId}`);
      } else {
        await organizationalStructureApi.createBusinessSegment(form);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Segmento criado",
          message: `Segmento ${form.code} foi criado com sucesso`,
        });
        router.push("/admin/business-segments");
      }
    } catch (error) {
      console.error("Failed to save segment", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar segmento",
        message: "Não foi possível salvar o segmento. Tente novamente.",
      });
    }
  }, [canSave, form, isEditing, segmentId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );

  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="BusinessSegment" redirectTo="/admin/business-segments">
      <StandardFormPage
        title={isEditing ? "Editar Segmento" : "Novo Segmento"}
        subtitle={
          isEditing
            ? `Atualizar informações do segmento ${segment?.code}`
            : "Cadastre um novo segmento de negócio no sistema"
        }
        icon={<Tag className="h-8 w-8 text-[hsl(var(--primary))]" />}
        onSave={onSubmit}
        backUrl={isEditing && segmentId ? `/admin/business-segments/${segmentId}` : "/admin/business-segments"}
        isValid={canSave}
        loading={loading}
        loadingMessage="Carregando dados do segmento..."
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <form onSubmit={onSubmit} className="space-y-6">
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
            placeholder="Ex: VAREJO"
          />

          <FuturisticTextarea
            label="Descrição"
            required
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              if (errors.description) setErrors((e) => ({ ...e, description: "" }));
              markDirty();
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
              onChange={(e) => {
                setForm((p) => ({ ...p, active: e.target.checked }));
                markDirty();
              }}
              className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
              Segmento Ativo
            </label>
          </div>

          <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
            {isEditing && segment && (
              <>
                ID: <span className="font-mono">{segment.id}</span>
              </>
            )}
          </div>
        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


