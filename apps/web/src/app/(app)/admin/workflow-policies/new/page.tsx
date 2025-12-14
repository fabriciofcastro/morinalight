"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageBackground } from "@/components/page-background";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";

export default function NewWorkflowPolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    module: "",
    flowType: "APPROVAL",
    config: "{}",
    active: true,
  });

  const template = searchParams.get("template");

  const templates = useMemo(() => {
    const rbacPermissionChange = {
      module: "RBAC",
      flowType: "PERMISSION_CHANGE",
      active: true,
      config: {
        enabled: true,
        // SLA e alertas
        slaMinutes: 60,
        notifyBeforeDueMinutes: 10,
        // Quando exigir aprovação
        requireApprovalFor: {
          entityTypes: ["user", "department", "sector", "position"],
          actions: ["deny"],
          permissionKeyPrefixes: ["settings:permissions", "admin:"],
        },
        // Quem pode aprovar (papel na organização)
        approverOrgRoles: ["owner", "admin"],
      },
    };

    const rbacStrict = {
      module: "RBAC",
      flowType: "PERMISSION_CHANGE",
      active: true,
      config: {
        enabled: true,
        slaMinutes: 30,
        notifyBeforeDueMinutes: 10,
        requireApprovalFor: {
          entityTypes: ["user", "department", "sector", "position"],
          actions: ["grant", "deny"],
          permissionKeyPrefixes: ["settings:", "admin:", "permissions:"],
        },
        approverOrgRoles: ["owner", "admin"],
      },
    };

    return {
      "rbac-permission-change": rbacPermissionChange,
      "rbac-strict": rbacStrict,
    } as const;
  }, []);

  useEffect(() => {
    if (!template) return;
    const t = template in templates ? templates[template as keyof typeof templates] : null;
    if (!t) return;
    setFormData({
      module: t.module,
      flowType: t.flowType,
      config: JSON.stringify(t.config, null, 2),
      active: Boolean(t.active),
    });
  }, [template, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedConfig: unknown;
      try {
        parsedConfig = JSON.parse(formData.config);
      } catch {
        alert("Configuração inválida. Certifique-se de que é um JSON válido.");
        return;
      }

      setLoading(true);
      await organizationalStructureApi.createWorkflowPolicy({
        ...formData,
        config: parsedConfig,
      });
      router.push("/admin/workflow-policies");
    } catch (error) {
      console.error("Failed to create workflow policy", error);
      alert("Erro ao criar workflow. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBackground variant="dashboard" />
      <div className="relative max-w-2xl mx-auto space-y-6 rounded-[var(--r-lg)] p-[var(--space-2)] overflow-hidden">
        {/* Overlays futuristas */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 holo-grid opacity-20" />
          <div className="beam-line absolute left-[10%] top-0 h-full w-[1px] opacity-35" />
          <div className="beam-line absolute right-[18%] top-0 h-full w-[1px] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(109,213,255,0.08),transparent_38%)]" />
        </div>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/workflow-policies">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Novo Workflow</h1>
            <p className="text-sm text-white/50">Configure uma nova política de workflow</p>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent_12%)] p-6 backdrop-blur-2xl shadow-[0_22px_90px_-32px_rgba(109,213,255,0.3)]"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] bg-black/20 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Templates prontos (RBAC)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        module: templates["rbac-permission-change"].module,
                        flowType: templates["rbac-permission-change"].flowType,
                        config: JSON.stringify(templates["rbac-permission-change"].config, null, 2),
                        active: templates["rbac-permission-change"].active,
                      })
                    }
                    className="flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.10)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[hsl(var(--primary)/0.16)] transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    RBAC (deny sensível)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        module: templates["rbac-strict"].module,
                        flowType: templates["rbac-strict"].flowType,
                        config: JSON.stringify(templates["rbac-strict"].config, null, 2),
                        active: templates["rbac-strict"].active,
                      })
                    }
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    RBAC (strict)
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/40">
                Dica: por padrão, este template exige aprovação para{" "}
                <span className="font-mono text-white/60">deny</span> em chaves sensíveis.
              </div>
            </div>

            <div>
              <label
                htmlFor="workflow-module"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Módulo
              </label>
              <input
                id="workflow-module"
                type="text"
                required
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                placeholder="Ex: PURCHASING"
              />
            </div>

            <div>
              <label
                htmlFor="workflow-flow-type"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Tipo de Fluxo
              </label>
              <select
                id="workflow-flow-type"
                value={formData.flowType}
                onChange={(e) => setFormData({ ...formData, flowType: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white focus:border-[hsl(var(--primary))] focus:outline-none appearance-none"
              >
                <option value="APPROVAL" className="bg-slate-900">
                  Aprovação
                </option>
                <option value="PERMISSION_CHANGE" className="bg-slate-900">
                  RBAC Permission Change
                </option>
                <option value="NOTIFICATION" className="bg-slate-900">
                  Notificação
                </option>
                <option value="AUTOMATION" className="bg-slate-900">
                  Automação
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="workflow-config"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Configuração (JSON)
              </label>
              <textarea
                id="workflow-config"
                required
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white font-mono text-sm placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none h-48 resize-none"
                placeholder='{"steps": [...]}'
              />
              <p className="mt-1 text-xs text-white/30">
                Insira a configuração do workflow em formato JSON.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
                Workflow Ativo
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Link href="/admin/workflow-policies">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--primary))/0.8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Workflow
            </button>
          </div>
        </motion.form>
      </div>
    </>
  );
}
