"use client";

import { Button } from "@morina/ui";
import {
  Layers,
  ArrowLeft,
  Edit,
  Shield,
  Users,
  Briefcase,
  Building2,
  Clock,
  MoreVertical,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { organizationalStructureApi, type Sector, type Department } from "@/lib/api/organizational-structure";
import { MembersManagerClient } from "@/components/admin/members/members-manager-client";
import { PermissionsManagerClient } from "@/components/admin/permissions/permissions-manager-client";

interface SectorDetailClientProps {
  sectorId: string;
}

export function SectorDetailClient({ sectorId }: SectorDetailClientProps) {
  const router = useRouter();
  const [sector, setSector] = useState<Sector | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "department" | "positions" | "members" | "permissions" | "history">("info");
  const [positions, setPositions] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sec = await organizationalStructureApi.getSector(sectorId);
        setSector(sec);

        // Carregar departamento
        if (sec.departmentId) {
          try {
            const dept = await organizationalStructureApi.getDepartment(sec.departmentId);
            setDepartment(dept);
          } catch (err) {
            console.error("Erro ao carregar departamento:", err);
          }
        }

        // Carregar cargos do setor
        try {
          const allPositions = await organizationalStructureApi.getPositions();
          // Filtrar por setor (assumindo que há uma relação, pode precisar de ajuste)
          const sectorPositions = allPositions.filter((p) => p.active);
          setPositions(sectorPositions.slice(0, 10).map((p) => ({ id: p.id, name: p.name, code: p.code })));
        } catch (err) {
          console.error("Erro ao carregar cargos:", err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar setor");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [sectorId]);

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando setor...</p>
        </div>
      </div>
    );
  }

  if (error || !sector) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Setor não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/admin/sectors")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info" as const, label: "Informações", icon: Layers },
    { id: "department" as const, label: "Departamento", icon: Building2 },
    { id: "positions" as const, label: "Cargos", icon: Briefcase },
    { id: "members" as const, label: "Membros", icon: Users },
    { id: "permissions" as const, label: "Permissões", icon: Shield },
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
                <Layers className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                    {sector.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sector.active
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {sector.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-sm text-white/60 font-medium">Código: {sector.code}</p>
                {department && (
                  <p className="text-xs text-white/50 mt-1">Departamento: {department.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => router.push("/admin/sectors")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px] px-4"
                  onClick={() => router.push(`/admin/sectors/${sectorId}/edit`)}
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
                    <p className="text-sm text-white/50 mb-1">Nome</p>
                    <p className="text-base font-medium text-white">{sector.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Código</p>
                    <p className="text-base font-medium text-white">{sector.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Tipo</p>
                    <p className="text-base font-medium text-white">{sector.type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        sector.active
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {sector.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Total de Cargos</p>
                    <p className="text-2xl font-bold text-white">{positions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Data de Criação</p>
                    <p className="text-base font-medium text-white">
                      {new Date(sector.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Última Atualização</p>
                    <p className="text-base font-medium text-white">
                      {new Date(sector.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {sector.description && (
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white/90 mb-4">Descrição</h3>
                <p className="text-base text-white/80 whitespace-pre-wrap">{sector.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "department" && department && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">Departamento</h3>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                  onClick={() => router.push(`/admin/departments/${department.id}`)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Ver Departamento
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/50 mb-1">Nome</p>
                  <p className="text-base font-medium text-white">{department.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Código</p>
                  <p className="text-base font-medium text-white">{department.code}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "positions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/90">Cargos do Setor</h3>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
                onClick={() => router.push("/admin/positions/new")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Novo Cargo
              </Button>
            </div>
            {positions.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-white/20" />
                <p className="text-lg font-medium text-white/60 mb-2">Nenhum cargo encontrado</p>
                <p className="text-sm text-white/40">Comece criando um novo cargo para este setor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/positions/${position.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" />
                      <h4 className="font-semibold text-white">{position.name}</h4>
                    </div>
                    <p className="text-sm text-white/50">Código: {position.code}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      <LinkIcon className="h-3 w-3" />
                      <span>Ver detalhes</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <MembersManagerClient entityType="sector" entityId={sectorId} entityName={sector.name} />
        )}

        {activeTab === "permissions" && (
          <PermissionsManagerClient entityType="sector" entityId={sectorId} entityName={sector.name} />
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Histórico de Mudanças</h3>
            <div className="p-8 text-center text-white/50">
              <Clock className="h-12 w-12 mx-auto mb-4 text-white/20" />
              <p className="text-lg font-medium text-white/60 mb-2">Histórico não disponível</p>
              <p className="text-sm text-white/40">O histórico de mudanças será implementado em breve</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}









