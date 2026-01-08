"use client";

import { AllowedGuard } from "@/components/auth/allowed-guard";
import { notificationCenter } from "@/shared/ui/notification-center";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  statusCustomizadoApi,
  type CreateStatusCustomizadoInput,
  type UpdateStatusCustomizadoInput,
} from "@/lib/api/status-customizado-ficha-custo";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) return orgs[0]!.organizationId;
    } catch {
      // Ignorar erro
    }
  }
  return null;
}

export function StatusCustomizadoFormClient({ statusId }: { statusId?: string }) {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [loadingData, setLoadingData] = useState(!!statusId);
  const [formData, setFormData] = useState<CreateStatusCustomizadoInput>({
    nome: "",
    cor: "#3b82f6",
    descricao: null,
    ordem: 0,
    ativo: true,
  });

  const canSave = useMemo(
    () => formData.nome.trim().length >= 2 && /^#[0-9A-Fa-f]{6}$/.test(formData.cor),
    [formData],
  );

  // Auto-save
  const { status, hasUnsavedChanges, markDirty, markClean, manualSave } = useAutoSave({
    onSave: async () => {
      if (!canSave || !orgId) return;
      await handleSave();
    },
    intervalMs: 30000, // 30 segundos
    requireValid: true,
    isValid: () => canSave && !!orgId,
    onAutoSaveComplete: () => {
      markClean();
    },
  });

  useEffect(() => {
    if (statusId && orgId) {
      const loadStatus = async () => {
        try {
          setLoadingData(true);
          const status = await statusCustomizadoApi.buscar(orgId, statusId);
          setFormData({
            nome: status.nome,
            cor: status.cor,
            descricao: status.descricao,
            ordem: status.ordem,
            ativo: status.ativo,
          });
          markClean();
        } catch (error) {
          console.error("Failed to load status", error);
          notificationCenter.add({
            type: "error",
            title: "Erro",
            message: "Erro ao carregar status customizado",
          });
          router.push("/admin/status-customizados-ficha-custo");
        } finally {
          setLoadingData(false);
        }
      };
      void loadStatus();
    } else {
      markDirty();
    }
  }, [statusId, orgId, router, markClean, markDirty]);

  const handleSave = useCallback(async () => {
    if (!orgId || !canSave) return;

    try {
      if (statusId) {
        const input: UpdateStatusCustomizadoInput = {
          nome: formData.nome,
          cor: formData.cor,
          descricao: formData.descricao,
          ordem: formData.ordem,
          ativo: formData.ativo,
        };
        await statusCustomizadoApi.atualizar(orgId, statusId, input);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Status customizado atualizado com sucesso",
        });
        router.push("/admin/status-customizados-ficha-custo");
      } else {
        await statusCustomizadoApi.criar(orgId, formData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Status customizado criado com sucesso",
        });
        router.push("/admin/status-customizados-ficha-custo");
      }
    } catch (error) {
      console.error("Failed to save status", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao salvar status customizado",
      });
    }
  }, [orgId, canSave, formData, statusId, router, markClean]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );

  return (
    <AllowedGuard I={statusId ? "update" : "create"} a={"StatusCustomizado" as any} redirectTo="/admin/status-customizados-ficha-custo">
      <StandardFormPage
        title={statusId ? "Editar Status Customizado" : "Novo Status Customizado"}
        subtitle={
          statusId
            ? "Atualize as informações do status customizado"
            : "Preencha os dados do novo status customizado"
        }
        icon={<Settings className="h-8 w-8 text-[hsl(var(--primary))]" />}
        onSave={handleSubmit}
        backUrl="/admin/status-customizados-ficha-custo"
        isValid={canSave}
        loading={loadingData}
        loadingMessage="Carregando status customizado..."
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Nome */}
            <div className="group">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Nome do Status <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value });
                    markDirty();
                  }}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                  placeholder="Ex: Em Produção"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Cor */}
            <div className="group">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Cor <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => {
                      setFormData({ ...formData, cor: e.target.value });
                      markDirty();
                    }}
                    className="w-16 h-16 rounded-lg border border-white/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={formData.cor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setFormData({ ...formData, cor: value });
                        markDirty();
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 font-mono"
                    placeholder="#3b82f6"
                    maxLength={7}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <div
                    className="w-12 h-12 rounded-lg border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: formData.cor || "#3b82f6" }}
                    title="Preview da cor"
                  />
                </div>
                {formData.cor && !/^#[0-9A-Fa-f]{6}$/.test(formData.cor) && (
                  <p className="mt-2 text-xs text-red-400">
                    Cor deve ser um código hexadecimal válido (ex: #3b82f6)
                  </p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="group">
              <label className="block text-sm font-semibold text-white/90 mb-2">Descrição</label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <textarea
                  value={formData.descricao || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, descricao: e.target.value || null });
                    markDirty();
                  }}
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 resize-none h-24"
                  placeholder="Descrição do status (opcional)"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Ordem e Ativo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-white/90 mb-2">Ordem</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <input
                    type="number"
                    min="0"
                    value={formData.ordem}
                    onChange={(e) => {
                      setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 });
                      markDirty();
                    }}
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                <p className="mt-1 text-xs text-white/40">Ordem de exibição (menor = primeiro)</p>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => {
                    setFormData({ ...formData, ativo: e.target.checked });
                    markDirty();
                  }}
                  className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] w-5 h-5"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-white/70 cursor-pointer">
                  Status Ativo
                </label>
              </div>
            </div>
          </div>

        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


