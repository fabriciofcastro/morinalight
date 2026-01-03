"use client";

import { Button } from "@morina/ui";
import {
  User,
  ArrowLeft,
  Edit,
  Shield,
  Clock,
  Activity,
  LogOut,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { UserStatusBadge } from "./user-status-badge";
import { UserTimeline } from "./UserTimeline";
import { UserQRCode } from "./UserQRCode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@morina/ui";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { Can } from "@/lib/auth";

interface UsersDetailClientProps {
  userId: string;
}

export function UsersDetailClient({ userId }: UsersDetailClientProps) {
  const router = useRouter();
  const { user, loading, error, fetchUser } = useUser(userId);
  const [activeTab, setActiveTab] = useState<"profile" | "permissions" | "activity" | "sessions" | "audit">("profile");

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Usuário não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "permissions" as const, label: "Permissões", icon: Shield },
    { id: "activity" as const, label: "Atividades", icon: Activity },
    { id: "sessions" as const, label: "Sessões", icon: LogOut },
    { id: "audit" as const, label: "Auditoria", icon: Clock },
  ];

  return (
    <AllowedGuard I="read" a="User" redirectTo="/admin/users">
      <div className="relative min-h-screen p-6 space-y-8">
        {/* Header Futurista */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

          <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-linear-to-br from-white/5 via-white/2 to-transparent backdrop-blur-xl shadow-2xl">
            {/* Bordas decorativas */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-3xl font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                      {user.displayName}
                    </h1>
                    <UserStatusBadge status={user.status} />
                  </div>
                  <p className="text-sm text-white/60 font-medium">{user.email}</p>
                  {(user.departmentName || user.sectorName || user.positionName) && (
                    <p className="text-xs text-white/50 mt-1">
                      {[user.departmentName, user.sectorName, user.positionName].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                    onClick={() => router.push("/admin/users")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </motion.div>
                <Can I="update" a="User">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px] px-4"
                      onClick={() => router.push(`/admin/users/${userId}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </motion.div>
                </Can>
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] w-[40px] p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0A0D14] border-white/10 text-white">
                      <Can I="update" a="User">
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                        </DropdownMenuItem>
                      </Can>
                      <Can I="update" a="Permission">
                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/permissions`)}>
                          <Shield className="mr-2 h-4 w-4" /> Gerenciar Permissões
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === tab.id
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
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                  Informações Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-xs text-white/50 mb-1">Email</p>
                      <p className="text-sm font-medium text-white/90">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-xs text-white/50 mb-1">Criado em</p>
                      <p className="text-sm font-medium text-white/90">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-white/60 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/50 mb-1">Último acesso</p>
                        <p className="text-sm font-medium text-white/90">
                          {new Date(user.lastLogin).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(user.departmentName || user.sectorName || user.positionName) && (
                <div>
                  <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                    Estrutura Organizacional
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {user.departmentName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-white/60 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/50 mb-1">Departamento</p>
                          <p className="text-sm font-medium text-white/90">{user.departmentName}</p>
                        </div>
                      </div>
                    )}
                    {user.sectorName && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-white/60 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/50 mb-1">Setor</p>
                          <p className="text-sm font-medium text-white/90">{user.sectorName}</p>
                        </div>
                      </div>
                    )}
                    {user.positionName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-white/60 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/50 mb-1">Cargo</p>
                          <p className="text-sm font-medium text-white/90">{user.positionName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              <div className="mt-6">
                <UserQRCode
                  userId={userId}
                  displayName={user.displayName}
                  email={user.email}
                />
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 mb-4">Gerenciamento de permissões</p>
              <Can I="update" a="Permission">
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}/permissions`)}
                >
                  Ver Permissões Completas
                </Button>
              </Can>
              <Can not I="update" a="Permission">
                <p className="text-xs text-white/40 italic">Acesso restrito para edição de permissões</p>
              </Can>
            </div>
          )}

          {activeTab === "activity" && (
            <UserTimeline userId={userId} />
          )}

          {activeTab === "sessions" && (
            <div className="text-center py-12">
              <LogOut className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 mb-4">Sessões ativas</p>
              <Can I="update" a="User">
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}/sessions`)}
                >
                  Gerenciar Sessões
                </Button>
              </Can>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 mb-4">Log de auditoria</p>
              <Can I="read" a="Report">
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer"
                  onClick={() => router.push(`/admin/users/${userId}/audit`)}
                >
                  Ver Audit Log Completo
                </Button>
              </Can>
            </div>
          )}
        </motion.div>
      </div>
    </AllowedGuard>
  );
}
