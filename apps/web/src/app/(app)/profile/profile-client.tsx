"use client";

import { Button, GlassCard, cn } from "@morina/ui";
import {
  Activity,
  BarChart3,
  Camera,
  Lock,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { ProfileTab } from "./tabs/profile-tab";
import { SecurityTab } from "./tabs/security-tab";
import { PreferencesTab } from "./tabs/preferences-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { StatisticsTab } from "./tabs/statistics-tab";

type TabId = "profile" | "security" | "preferences" | "activity" | "statistics";

const TABS: Array<{ id: TabId; label: string; icon: typeof User }> = [
  { id: "profile", label: "Meu Perfil", icon: User },
  { id: "security", label: "Segurança", icon: Lock },
  { id: "preferences", label: "Preferências", icon: Settings },
  { id: "activity", label: "Atividade", icon: Activity },
  { id: "statistics", label: "Estatísticas", icon: BarChart3 },
];

export function ProfileClient() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Usuário");
  const [position, setPosition] = useState<string>("Cargo");
  const [status, setStatus] = useState<"active" | "pending" | "suspended">("active");

  // TODO: Carregar dados reais do usuário
  // useEffect(() => {
  //   loadUserProfile();
  // }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="relative h-32 w-32 overflow-hidden border-4 border-white/20 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-[hsl(var(--surface))] text-white hover:bg-white/10 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
                    status === "active" &&
                      "bg-green-500/20 text-green-400 border border-green-500/30",
                    status === "pending" &&
                      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                    status === "suspended" &&
                      "bg-red-500/20 text-red-400 border border-red-500/30",
                  )}
                >
                  {status === "active"
                    ? "Ativo"
                    : status === "pending"
                      ? "Pendente"
                      : "Suspenso"}
                </span>
              </div>
              <p className="mb-1 text-lg text-white/70">{position}</p>
              <p className="text-sm text-white/50">usuario@morina.com.br</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[hsl(var(--primary))] text-white"
                      : "border-transparent text-white/60 hover:text-white hover:border-white/20",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "preferences" && <PreferencesTab />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "statistics" && <StatisticsTab />}
      </div>
    </div>
  );
}




