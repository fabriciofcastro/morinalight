"use client";

import { Button } from "@morina/ui";
import {
  GitBranch,
  ArrowLeft,
  Edit,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Settings,
  FileCode,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { organizationalStructureApi, type WorkflowPolicy } from "@/lib/api/organizational-structure";

interface WorkflowDetailClientProps {
  policyId: string;
}

export function WorkflowDetailClient({ policyId }: WorkflowDetailClientProps) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "config" | "history">("info");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const wf = await organizationalStructureApi.getWorkflowPolicy(policyId);
        setWorkflow(wf);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar workflow");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [policyId]);

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Workflow não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/admin/workflow-policies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info" as const, label: "Informações", icon: GitBranch },
    { id: "config" as const, label: "Configuração", icon: Settings },
    { id: "history" as const, label: "Histórico", icon: Clock },
  ];

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
          {/* Bordas decorativas */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <GitBranch className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    Workflow Policy
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                      workflow.active
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {workflow.active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-white/60 font-medium">Módulo: {workflow.module}</p>
                <p className="text-xs text-white/50 mt-1">Tipo: {workflow.flowType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => router.push("/admin/workflow-policies")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px] px-4"
                  onClick={() => router.push(`/admin/workflow-policies/${policyId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </motion.div>
              <div className="relative">
                <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-white/60 hover:text-white/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Dados Básicos</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Módulo</p>
                    <p className="text-base font-medium text-white">{workflow.module}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Tipo de Fluxo</p>
                    <p className="text-base font-medium text-white">{workflow.flowType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Status</p>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        workflow.active
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {workflow.active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inativo
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Informações</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/50 mb-1">ID</p>
                    <p className="text-base font-medium text-white font-mono text-xs break-all">
                      {workflow.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Data de Criação</p>
                    <p className="text-base font-medium text-white">
                      {new Date(workflow.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(workflow.createdAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Última Atualização</p>
                    <p className="text-base font-medium text-white">
                      {new Date(workflow.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(workflow.updatedAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-white/60" />
                Configuração JSON
              </h3>
              <div className="p-4 rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm">
                <pre className="text-sm text-white/80 font-mono overflow-x-auto">
                  {JSON.stringify(workflow.config, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Histórico de Execuções</h3>
            <div className="p-8 text-center text-white/50">
              <Clock className="h-12 w-12 mx-auto mb-4 text-white/20" />
              <p className="text-lg font-medium text-white/60 mb-2">Histórico não disponível</p>
              <p className="text-sm text-white/40">
                O histórico de execuções do workflow será implementado em breve
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}


