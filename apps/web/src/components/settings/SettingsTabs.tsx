"use client";

import { cn } from "@morina/ui";
import { type LucideIcon } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
  disabled?: boolean;
};

type SettingsTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export function SettingsTabs({ tabs, activeTab, onTabChange, className }: SettingsTabsProps) {
  return (
    <div className={cn("border-b border-white/10 bg-white/5", className)}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  isActive
                    ? "border-[hsl(var(--primary))] text-white"
                    : "border-transparent text-white/60 hover:text-white hover:border-white/20",
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-white">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


