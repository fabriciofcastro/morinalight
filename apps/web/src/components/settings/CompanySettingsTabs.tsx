"use client";

import { cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  FileText,
  Globe,
  History,
  MapPin,
  Phone,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { CompanyGeneralTab } from "./tabs/CompanyGeneralTab";
import { CompanyFiscalTab } from "./tabs/CompanyFiscalTab";
import { CompanyAddressesTab } from "./tabs/CompanyAddressesTab";
import { CompanyContactsTab } from "./tabs/CompanyContactsTab";
import { CompanyDocumentsTab } from "./tabs/CompanyDocumentsTab";
import { CompanyAuditTab } from "./tabs/CompanyAuditTab";

type TabId = "geral" | "fiscal" | "enderecos" | "contatos" | "documentos" | "auditoria";

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Building2;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "geral",
    label: "Geral",
    icon: Building2,
    description: "Dados cadastrais básicos e identidade visual",
  },
  {
    id: "fiscal",
    label: "Fiscal",
    icon: Receipt,
    description: "Configurações tributárias e fiscais",
  },
  {
    id: "enderecos",
    label: "Endereços",
    icon: MapPin,
    description: "Endereços da matriz e filiais",
  },
  {
    id: "contatos",
    label: "Contatos",
    icon: Phone,
    description: "E-mails, telefones e redes sociais",
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    description: "Documentos legais e certificados",
  },
  {
    id: "auditoria",
    label: "Auditoria",
    icon: History,
    description: "Histórico de alterações e auditoria",
  },
];

export function CompanySettingsTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("geral");

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab Navigation */}
      <div className="relative border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,var(--surface-veil,#020617)_88%,transparent_12%)] backdrop-blur-2xl">
        {/* HUD Overlays */}
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute inset-0 holo-grid" />
        </div>

        <div className="relative flex gap-1 overflow-x-auto px-4 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-white/60 hover:text-white/90",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[hsl(var(--primary))]"
                  />
                )}

                {/* Hover Effect */}
                {!isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-white/10 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "geral" && (
            <motion.div
              key="geral"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyGeneralTab />
            </motion.div>
          )}

          {activeTab === "fiscal" && (
            <motion.div
              key="fiscal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyFiscalTab />
            </motion.div>
          )}

          {activeTab === "enderecos" && (
            <motion.div
              key="enderecos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyAddressesTab />
            </motion.div>
          )}

          {activeTab === "contatos" && (
            <motion.div
              key="contatos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyContactsTab />
            </motion.div>
          )}

          {activeTab === "documentos" && (
            <motion.div
              key="documentos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyDocumentsTab />
            </motion.div>
          )}

          {activeTab === "auditoria" && (
            <motion.div
              key="auditoria"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyAuditTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

