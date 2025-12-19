"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, Loader2, Settings, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  statusCustomizadoApi,
  type CreateStatusCustomizadoInput,
  type UpdateStatusCustomizadoInput,
  type StatusCustomizado,
} from "@/lib/api/status-customizado-ficha-custo";
import { notificationCenter } from "@/components/notifications/notification-center";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) return orgs[0].organizationId;
    } catch {
      // Ignorar erro
    }
  }
  return null;
}

export function StatusCustomizadoFormClient({ statusId }: { statusId?: string }) {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!statusId);
  const [formData, setFormData] = useState<CreateStatusCustomizadoInput>({
    nome: "",
    cor: "#3b82f6",
    descricao: null,
    ordem: 0,
    ativo: true,
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
    }
  }, [statusId, orgId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    try {
      setLoading(true);

      if (statusId) {
        const input: UpdateStatusCustomizadoInput = {
          nome: formData.nome,
          cor: formData.cor,
          descricao: formData.descricao,
          ordem: formData.ordem,
          ativo: formData.ativo,
        };
        await statusCustomizadoApi.atualizar(orgId, statusId, input);
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Status customizado atualizado com sucesso",
        });
      } else {
        await statusCustomizadoApi.criar(orgId, formData);
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Status customizado criado com sucesso",
        });
      }

      router.push("/admin/status-customizados-ficha-custo");
    } catch (error) {
      console.error("Failed to save status", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao salvar status customizado",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Carregando status customizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/admin/status-customizados-ficha-custo">
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {statusId ? "Editar Status Customizado" : "Novo Status Customizado"}
          </h1>
          <p className="text-sm text-white/50">
            {statusId
              ? "Atualize as informações do status customizado"
              : "Preencha os dados do novo status customizado"}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
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
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
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
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value || null })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })
                  }
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
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] w-5 h-5"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-white/70 cursor-pointer">
                Status Ativo
              </label>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <Link href="/admin/status-customizados-ficha-custo">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.nome.trim() || !/^#[0-9A-Fa-f]{6}$/.test(formData.cor)}
            className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {statusId ? "Atualizar Status" : "Criar Status"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}


