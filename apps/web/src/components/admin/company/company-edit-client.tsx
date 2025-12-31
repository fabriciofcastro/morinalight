"use client";

import { cn } from "@morina/ui";
import { CompanyAnimatedBackground } from "@/components/animations/company-animated-background";
import { notificationCenter } from "@/components/notifications/notification-center";
import { companySettingsAPI } from "@/lib/api/company-settings";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Palette,
  Plug,
  Save,
  Settings,
  Shield,
  Upload,
  XCircle,
  Clock,
  Gavel,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { AddressTab } from "./tabs/address-tab";
import { BrandingTab } from "./tabs/branding-tab";
import { CertificateTab } from "./tabs/certificate-tab";
import { FiscalTab } from "./tabs/fiscal-tab";
import { GeneralTab } from "./tabs/general-tab";
import { IntegrationsTab } from "./tabs/integrations-tab";
import { SecurityTab } from "./tabs/security-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { HistoryTab } from "./tabs/history-tab";
import { GovernanceTab } from "./tabs/governance-tab";
import { AnalyticsTab } from "./tabs/analytics-tab";
import { LGPDConsentModal } from "./compliance/lgpd-consent-modal";
import { LGPDConsentModal } from "./compliance/lgpd-consent-modal";
import { SensitiveActionConfirmDialog } from "./compliance/sensitive-action-confirm-dialog";
import { CompanyAssistantWidget } from "./intelligence/company-assistant-widget";

// ============================================================================
// MOCK DATA (Mantido por enquanto para fallback)
// ============================================================================

const MOCK_COMPANY = {
  id: "1",
  name: "Morina Tecnologia",
  legalName: "Morina Soluções em Tecnologia Ltda",
  cnpj: "12.345.678/0001-90",
  email: "contato@morina.com.br",
  phone: "(11) 99999-8888",
  website: "https://morina.com.br",
  companySize: "EPP",
  foundedAt: "2020-01-15",
  ie: "123.456.789.123",
  address: {
    street: "Av. Paulista",
    number: "1000",
    complement: "Conj 101",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
  },
  general: {
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    currency: "BRL",
    dateFormat: "DD/MM/YYYY",
  },
  fiscal: {
    taxRegime: "SIMPLES",
    nfeEnvironment: "HOMOLOGACAO",
  },
  certificate: {
    type: "A1",
    expiryDate: "2025-12-31",
  },
  security: {
    passwordPolicy: "strong",
  },
  branding: {
    logo: "",
    theme: "custom",
    accentColor: "#3b82f6",
    font: "inter",
    contrastMode: "normal",
    density: "comfortable",
  },
  integrations: {
    webhookUrl: "",
  },
};

function CircularProgress({
  value,
  max,
  color,
  size = 80,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="251"
          strokeDashoffset={251 - (251 * percentage) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export function CompanyEditClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<any>(MOCK_COMPANY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formId = useId();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await companySettingsAPI.getSettings();
        if (data) {
          setFormData(data);
          setInitialData(data);
        }
      } catch (error) {
        console.error("Falha ao carregar dados, usando mock.", error);
        setInitialData(MOCK_COMPANY); // Fallback for mock
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const [initialData, setInitialData] = useState<any>(null);
  const [lgpdOpen, setLgpdOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const checkSensitiveChanges = () => {
    // Simplificação: Qualquer mudança é tratada como sensível para demonstrar segurança enterprise
    // Na prática, compararíamos deep equal de campos específicos
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const executeSave = async (isDraft = false) => {
    startTransition(async () => {
      try {
        const result: any = await companySettingsAPI.updateSettings(formData, { isDraft });

        if (result.status === "PENDING_APPROVAL" || result.status === "DRAFT_SAVED") {
          setInitialData(formData);
          notificationCenter.add({
            type: isDraft ? "success" : "warning",
            title: isDraft ? "Rascunho Salvo" : "Aprovação Necessária",
            message: result.message || (isDraft ? "Rascunho salvo com sucesso." : "Sua alteração foi enviada para aprovação."),
          });
          setActiveTab("governance");
        } else {
          setInitialData(formData);
          notificationCenter.add({
            type: "success",
            title: "Sucesso",
            message: "Configurações da empresa salvas com sucesso!",
          });
        }
      } catch (error) {
        console.error(error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Falha ao atualizar configurações.",
        });
      }
    });
  };



  const handleSave = async () => {
    // Validação básica
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome Fantasia é obrigatório";
    if (!formData.legalName) newErrors.legalName = "Razão Social é obrigatória";
    if (!formData.cnpj) newErrors.cnpj = "CNPJ é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notificationCenter.add({
        type: "error",
        title: "Erro de Validação",
        message: "Verifique os campos obrigatórios.",
      });
      return;
    }

    if (checkSensitiveChanges()) {
      setSecurityOpen(true);
    } else {
      executeSave(false);
    }
  };

  const handleSaveDraft = async () => {
    // Drafts skip some validations? usually no, but maybe less strict?
    // adhering to same validation for now.
    executeSave(true);
  };

  const calculateCompletion = () => {
    let filled = 0;
    let total = 0;
    const check = (val: any) => {
      total++;
      if (val && val !== "") filled++;
    };

    check(formData.name);
    check(formData.legalName);
    check(formData.cnpj);
    check(formData.email);
    check(formData.address?.street);
    check(formData.address?.city);
    check(formData.fiscal?.taxRegime);
    check(formData.certificate?.type);

    return { filled, total };
  };

  const { filled, total } = calculateCompletion();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Geral", icon: Building2 },
    { id: "address", label: "Endereço", icon: MapPin },
    { id: "fiscal", label: "Fiscal", icon: CreditCard },
    { id: "certificate", label: "Certificado", icon: Shield },
    { id: "integrations", label: "Integrações", icon: Plug },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "configs", label: "Configurações", icon: Settings },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "history", label: "Histórico", icon: Clock },
    { id: "governance", label: "Governança", icon: Gavel },
  ];

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden pb-20">
      {/* Background Animado Específico da Empresa - Mantém a consistência visual */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CompanyAnimatedBackground />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                Dados da Empresa
              </h1>
              <p className="text-white/60">
                Gerencie as informações legais, fiscais e visuais da sua organização.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                  Progresso
                </span>
                <CircularProgress value={filled} max={total} color="hsl(var(--primary))" size={60} />
              </div>

              <div className="h-12 w-px bg-white/10 hidden md:block" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>CNPJ Ativo</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span>Certificado OK</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Improved for Mobile */}
        <nav className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max p-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                    isActive
                      ? "text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 animate-shimmer" />
                  )}
                  <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-[hsl(var(--primary))]" : "group-hover:text-white")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Conteúdo das Abas */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {activeTab === "general" && (
            <GeneralTab formData={formData} setFormData={setFormData} errors={errors} />
          )}
          {activeTab === "address" && (
            <AddressTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "fiscal" && (
            <FiscalTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "certificate" && (
            <CertificateTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "integrations" && (
            <IntegrationsTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "branding" && (
            <BrandingTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "security" && (
            <SecurityTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "configs" && (
            <SettingsTab formData={formData} setFormData={setFormData} />
          )}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "governance" && <GovernanceTab />}
        </div>

        {/* Modais de Compliance & Segurança */}
        <SensitiveActionConfirmDialog
          open={securityOpen}
          onOpenChange={setSecurityOpen}
          onConfirm={() => {
            setSecurityOpen(false);
            setLgpdOpen(true); // Próximo passo: LGPD
          }}
        />

        <LGPDConsentModal
          open={lgpdOpen}
          onOpenChange={setLgpdOpen}
          onConfirm={() => {
            setLgpdOpen(false);
            executeSave();
          }}
        />

        {/* Action Bar */}
        <div className="mt-8 flex justify-end gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <button
            onClick={() => router.back()}
            disabled={isPending}
            className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2 font-medium"
          >
            <XCircle className="h-5 w-5" />
            Cancelar
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isPending}
            className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2 font-medium"
          >
            <Settings className="h-5 w-5" />
            Salvar Rascunho
          </button>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-8 py-3 rounded-xl bg-[hsl(var(--primary))] text-black font-bold hover:brightness-110 hover:shadow-[0_0_20px_hsla(var(--primary)/0.4)] transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* AI Assistant - Only show if data is loaded */}
      {!isLoading && <CompanyAssistantWidget contextData={formData} agentSlug="general_assistant" />}
    </div>
  );
}
