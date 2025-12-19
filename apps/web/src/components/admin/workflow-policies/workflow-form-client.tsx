"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, GitBranch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type WorkflowPolicy, type CreateWorkflowPolicyInput, type UpdateWorkflowPolicyInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";

interface WorkflowFormClientProps {
  policyId?: string;
}

export function WorkflowFormClient({ policyId }: WorkflowFormClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = !!policyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowPolicy | null>(null);
  const [form, setForm] = useState<CreateWorkflowPolicyInput>({
    module: "",
    flowType: "APPROVAL",
    config: {},
    active: true,
  });
  const [configJson, setConfigJson] = useState("{}");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const templates = useMemo(() => {
    const rbacPermissionChange = {
      module: "RBAC",
      flowType: "PERMISSION_CHANGE",
      active: true,
      config: {
        enabled: true,
        slaMinutes: 60,
        notifyBeforeDueMinutes: 10,
        requireApprovalFor: {
          entityTypes: ["user", "department", "sector", "position"],
          actions: ["deny"],
          permissionKeyPrefixes: ["settings:permissions", "admin:"],
        },
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
    const loadData = async () => {
      if (policyId) {
        try {
          setLoading(true);
          const wf = await organizationalStructureApi.getWorkflowPolicy(policyId);
          setWorkflow(wf);
          setForm({
            module: wf.module,
            flowType: wf.flowType,
            config: wf.config,
            active: wf.active,
          });
          setConfigJson(JSON.stringify(wf.config, null, 2));
        } catch (error) {
          console.error("Failed to load workflow", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Aplicar template se fornecido via query param
        const template = searchParams?.get("template");
        if (template && template in templates) {
          const t = templates[template as keyof typeof templates];
          setForm({
            module: t.module,
            flowType: t.flowType,
            config: t.config,
            active: Boolean(t.active),
          });
          setConfigJson(JSON.stringify(t.config, null, 2));
        }
        setLoading(false);
      }
    };

    void loadData();
  }, [policyId, searchParams, templates]);

  const canSave = useMemo(
    () => form.module.trim().length >= 2 && configJson.trim().length >= 2,
    [form, configJson],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;

      let parsedConfig: Record<string, unknown>;
      try {
        parsedConfig = JSON.parse(configJson);
      } catch (err) {
        setErrors({ config: "Configuração inválida. Certifique-se de que é um JSON válido." });
        return;
      }

      const newErrors: Record<string, string> = {};
      if (!form.module.trim()) newErrors.module = "Módulo é obrigatório";
      if (newErrors.module) {
        setErrors(newErrors);
        return;
      }

      try {
        setSaving(true);
        if (isEditing && policyId) {
          const updateData: UpdateWorkflowPolicyInput = {
            id: policyId,
            module: form.module.trim(),
            flowType: form.flowType,
            config: parsedConfig,
            active: form.active,
          };
          await organizationalStructureApi.updateWorkflowPolicy(updateData);
          router.push(`/admin/workflow-policies/${policyId}`);
        } else {
          await organizationalStructureApi.createWorkflowPolicy({
            ...form,
            config: parsedConfig,
          });
          router.push("/admin/workflow-policies");
        }
      } catch (error) {
        console.error("Failed to save workflow", error);
        alert("Erro ao salvar workflow.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, configJson, isEditing, policyId, router],
  );

  const applyTemplate = (templateKey: keyof typeof templates) => {
    const t = templates[templateKey];
    setForm({
      module: t.module,
      flowType: t.flowType,
      config: t.config,
      active: Boolean(t.active),
    });
    setConfigJson(JSON.stringify(t.config, null, 2));
    if (errors.config) setErrors((e) => ({ ...e, config: "" }));
  };

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
              <GitBranch className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Workflow" : "Novo Workflow"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar política de workflow`
                    : "Configure uma nova política de workflow no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && policyId ? `/admin/workflow-policies/${policyId}` : "/admin/workflow-policies"}>
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
          {!isEditing && (
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Templates Prontos (RBAC)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate("rbac-permission-change")}
                    className="flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.10)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[hsl(var(--primary)/0.16)] transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    RBAC (deny sensível)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("rbac-strict")}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    RBAC (strict)
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/40">
                Dica: por padrão, estes templates exigem aprovação para ações sensíveis em RBAC.
              </p>
            </div>
          )}

          <FuturisticInput
            label="Módulo"
            required
            value={form.module}
            onChange={(e) => {
              setForm((p) => ({ ...p, module: e.target.value }));
              if (errors.module) setErrors((e) => ({ ...e, module: "" }));
            }}
            error={!!errors.module}
            errorMessage={errors.module}
            placeholder="Ex: RBAC, PURCHASING"
          />

          <FuturisticSelect
            label="Tipo de Fluxo"
            value={form.flowType}
            onChange={(e) => setForm((p) => ({ ...p, flowType: e.target.value }))}
          >
            <option value="APPROVAL" className="bg-slate-900">Aprovação</option>
            <option value="PERMISSION_CHANGE" className="bg-slate-900">RBAC Permission Change</option>
            <option value="NOTIFICATION" className="bg-slate-900">Notificação</option>
            <option value="AUTOMATION" className="bg-slate-900">Automação</option>
          </FuturisticSelect>

          <div>
            <FuturisticTextarea
              label="Configuração (JSON)"
              required
              value={configJson}
              onChange={(e) => {
                setConfigJson(e.target.value);
                if (errors.config) setErrors((e) => ({ ...e, config: "" }));
              }}
              error={!!errors.config}
              errorMessage={errors.config}
              placeholder='{"enabled": true, ...}'
              rows={12}
            />
            <p className="mt-1 text-xs text-white/30">Insira a configuração do workflow em formato JSON válido.</p>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
              Workflow Ativo
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && workflow && (
                <>
                  ID: <span className="font-mono">{workflow.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Workflow"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

