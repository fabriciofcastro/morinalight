"use client";

import { GitBranch, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type WorkflowPolicy, type CreateWorkflowPolicyInput, type UpdateWorkflowPolicyInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { FuturisticTextarea } from "@/components/ui/futuristic-textarea";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";
import { AllowedGuard } from "@/components/auth/allowed-guard";

interface WorkflowFormClientProps {
  policyId?: string;
}

export function WorkflowFormClient({ policyId }: WorkflowFormClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = !!policyId;

  const [loading, setLoading] = useState(true);
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

  const canSave = useMemo(() => {
    try {
      JSON.parse(configJson);
      return form.module.trim().length >= 2 && configJson.trim().length >= 2;
    } catch {
      return false;
    }
  }, [form, configJson]);

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
          markClean();
        } catch (error) {
          console.error("Failed to load workflow", error);
          notificationCenter.add({
            type: "error",
            title: "Erro ao carregar dados",
            message: "Não foi possível carregar os dados da política de workflow",
          });
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
        markDirty();
      }
    };

    void loadData();
  }, [policyId, searchParams, templates, markClean, markDirty]);

  const handleSave = useCallback(async () => {
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
      if (isEditing && policyId) {
        const updateData: UpdateWorkflowPolicyInput = {
          id: policyId,
          module: form.module.trim(),
          flowType: form.flowType,
          config: parsedConfig,
          active: form.active,
        };
        await organizationalStructureApi.updateWorkflowPolicy(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Workflow atualizado",
          message: `Política de workflow foi atualizada com sucesso`,
        });
        router.push(`/admin/workflow-policies/${policyId}`);
      } else {
        await organizationalStructureApi.createWorkflowPolicy({
          ...form,
          config: parsedConfig,
        });
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Workflow criado",
          message: `Política de workflow foi criada com sucesso`,
        });
        router.push("/admin/workflow-policies");
      }
    } catch (error) {
      console.error("Failed to save workflow", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar workflow",
        message: "Não foi possível salvar a política de workflow. Tente novamente.",
      });
    }
  }, [canSave, form, configJson, isEditing, policyId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
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
    markDirty();
    notificationCenter.add({
      type: "success",
      title: "Template aplicado",
      message: "Template aplicado com sucesso. Revise e ajuste se necessário.",
    });
  };

  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="User" redirectTo="/admin/workflow-policies">
      <StandardFormPage
        title={isEditing ? "Editar Workflow" : "Novo Workflow"}
        subtitle={
          isEditing
            ? `Atualizar política de workflow`
            : "Configure uma nova política de workflow no sistema"
        }
        icon={<GitBranch className="h-8 w-8 text-[hsl(var(--primary))]" />}
        onSave={onSubmit}
        backUrl={isEditing && policyId ? `/admin/workflow-policies/${policyId}` : "/admin/workflow-policies"}
        isValid={canSave}
        loading={loading}
        loadingMessage="Carregando dados da política de workflow..."
        autoSaveStatus={status}
        hasUnsavedChanges={hasUnsavedChanges}
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
              markDirty();
            }}
            error={!!errors.module}
            errorMessage={errors.module}
            placeholder="Ex: RBAC, PURCHASING"
          />

          <FuturisticSelect
            label="Tipo de Fluxo"
            value={form.flowType}
            onChange={(e) => {
              setForm((p) => ({ ...p, flowType: e.target.value }));
              markDirty();
            }}
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
                markDirty();
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
              onChange={(e) => {
                setForm((p) => ({ ...p, active: e.target.checked }));
                markDirty();
              }}
              className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
              Workflow Ativo
            </label>
          </div>

          <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
            {isEditing && workflow && (
              <>
                ID: <span className="font-mono">{workflow.id}</span>
              </>
            )}
          </div>
        </form>
      </StandardFormPage>
    </AllowedGuard>
  );
}


