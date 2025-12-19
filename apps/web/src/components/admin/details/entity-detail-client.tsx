"use client";

import { Button } from "@morina/ui";
import {
  ArrowLeft,
  Edit,
  Users,
  Shield,
  Info,
  Settings,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MembersManagerClient } from "../members/members-manager-client";
import { PermissionsManagerClient } from "../permissions/permissions-manager-client";
import { type Department, organizationalStructureApi } from "@/lib/api/organizational-structure";
import { type Branch } from "@/lib/api/organizational-structure";
import { type Sector } from "@/lib/api/organizational-structure";
import { type Position } from "@/lib/api/organizational-structure";
import { type Role, permissionsApi } from "@/lib/api/permissions";
import { type Permission } from "@/lib/api/permissions";
import {
  type BusinessSegment,
  type WorkflowPolicy,
} from "@/lib/api/organizational-structure";

type EntityType = "branch" | "department" | "sector" | "position" | "role" | "permission" | "segment" | "workflow";

type EntityDetailClientProps = {
  entityType: EntityType;
  entityId: string;
};

export function EntityDetailClient({ entityType, entityId }: EntityDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "permissions">("overview");
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState<any>(null);

  const loadEntity = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      switch (entityType) {
        case "branch":
          data = await organizationalStructureApi.getBranch(entityId);
          break;
        case "department":
          data = await organizationalStructureApi.getDepartment(entityId);
          break;
        case "sector":
          data = await organizationalStructureApi.getSector(entityId);
          break;
        case "position":
          data = await organizationalStructureApi.getPosition(entityId);
          break;
        case "role":
          data = await permissionsApi.getRole(entityId);
          break;
        case "permission":
          data = await permissionsApi.getPermission(entityId);
          break;
        case "segment":
          data = await organizationalStructureApi.getBusinessSegment(entityId);
          break;
        case "workflow":
          data = await organizationalStructureApi.getWorkflowPolicy(entityId);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      setEntity(data);
    } catch (error) {
      console.error("Failed to load entity", error);
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    void loadEntity();
  }, [loadEntity]);

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

  if (!entity) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">Entidade não encontrada</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const getEntityName = () => {
    if (entityType === "branch") return (entity as Branch).name;
    if (entityType === "department") return (entity as Department).name;
    if (entityType === "sector") return (entity as Sector).name;
    if (entityType === "position") return (entity as Position).name;
    if (entityType === "role") return (entity as Role).name;
    if (entityType === "permission") return (entity as Permission).name;
    if (entityType === "segment") return (entity as BusinessSegment).code;
    if (entityType === "workflow") return (entity as WorkflowPolicy).module;
    return "Entidade";
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case "branch":
        return "🏢";
      case "department":
        return "📁";
      case "sector":
        return "📂";
      case "position":
        return "💼";
      case "role":
        return "🛡️";
      case "permission":
        return "🔑";
      case "segment":
        return "📊";
      case "workflow":
        return "🔄";
      default:
        return "📋";
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: Info },
    ...(entityType === "branch" || entityType === "department" || entityType === "sector" || entityType === "position"
      ? [{ id: "members" as const, label: "Membros", icon: Users }]
      : []),
    ...(entityType === "department" || entityType === "sector" || entityType === "position" || entityType === "role"
      ? [{ id: "permissions" as const, label: "Permissões", icon: Shield }]
      : []),
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
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-4xl">
                {getEntityIcon()}
              </div>
              <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {getEntityName()}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {entityType === "branch" && "Filial"}
                  {entityType === "department" && "Departamento"}
                  {entityType === "sector" && "Setor"}
                  {entityType === "position" && "Cargo"}
                  {entityType === "role" && "Perfil de Acesso"}
                  {entityType === "permission" && "Permissão"}
                  {entityType === "segment" && "Segmento de Negócio"}
                  {entityType === "workflow" && "Política de Workflow"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={() => {
                  const editPath = entityType === "permission" 
                    ? `/admin/permissions/${entityId}/edit`
                    : entityType === "segment"
                    ? `/admin/business-segments/${entityId}/edit`
                    : entityType === "workflow"
                    ? `/admin/workflow-policies/${entityId}/edit`
                    : `/admin/${entityType}s/${entityId}/edit`;
                  router.push(editPath);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
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
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Informações Gerais</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(entity).map(([key, value]) => {
                if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "metadata") return null;
                if (typeof value === "object" && value !== null) return null;
                return (
                  <div key={key} className="group relative">
                    <label className="block text-sm font-semibold text-white/60 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <div className="px-4 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white">
                      {String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <MembersManagerClient
            entityType={entityType as "branch" | "department" | "sector" | "position"}
            entityId={entityId}
            entityName={getEntityName()}
          />
        )}

        {activeTab === "permissions" && (
          <PermissionsManagerClient
            entityType={entityType as "department" | "sector" | "position" | "role"}
            entityId={entityId}
            entityName={getEntityName()}
          />
        )}
      </motion.div>
    </div>
  );
}


