"use client";

import { GlassCard, cn } from "@morina/ui";
import { X } from "lucide-react";
import { useState } from "react";
import { UserProfileTab } from "./user-profile-tab";
import { UserOrganizationTab } from "./user-organization-tab";
import { UserPermissionsTab } from "./user-permissions-tab";
import { UserActivityTab } from "./user-activity-tab";
import { UserAuditTab } from "./user-audit-tab";
import { UserSecurityTab } from "./user-security-tab";

type User = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended" | "inactive";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
  twoFactorEnabledAt?: string | null;
};

type UserDetailsPanelProps = {
  userId: string;
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
};

type TabId = "profile" | "organization" | "permissions" | "security" | "activity" | "audit";

export function UserDetailsPanel({ userId, user, onClose, onUserUpdated }: UserDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "Perfil" },
    { id: "organization", label: "Organização" },
    { id: "permissions", label: "Permissões" },
    { id: "security", label: "Segurança" },
    { id: "activity", label: "Atividade" },
    { id: "audit", label: "Auditoria" },
  ];

  return (
    <GlassCard className="fixed right-0 top-0 h-full w-[800px] overflow-y-auto border-l border-white/10">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[color-mix(in_oklab,var(--surface-veil,#020617)_95%,transparent_5%)] backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Detalhes do Usuário</h3>
            <p className="text-sm text-white/50">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "text-white/60 hover:text-white/90",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "profile" && (
          <UserProfileTab userId={userId} user={user} onUserUpdated={onUserUpdated} />
        )}

        {activeTab === "organization" && (
          <UserOrganizationTab userId={userId} onUserUpdated={onUserUpdated} />
        )}

        {activeTab === "permissions" && (
          <UserPermissionsTab userId={userId} onUserUpdated={onUserUpdated} />
        )}

        {activeTab === "security" && (
          <UserSecurityTab userId={userId} user={{
            twoFactorEnabled: !!user.twoFactorEnabled,
            twoFactorEnabledAt: user.twoFactorEnabledAt
          }} />
        )}

        {activeTab === "activity" && <UserActivityTab userId={userId} />}

        {activeTab === "audit" && <UserAuditTab userId={userId} />}
      </div>
    </GlassCard>
  );
}




