"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Globe,
  History,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Search,
  Smartphone,
  AlertCircle,
  Zap,
  Shield,
  FileText,
  Clock,
  Eye,
  EyeOff,
  ArrowLeft,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, useState, useEffect, useCallback, useRef } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@morina/ui";
import { SectionCard } from "./SectionCard";
import { FormField } from "../../ui/form-field";
import { FuturisticInput } from "../../ui/futuristic-input";
import { FuturisticSelect } from "../../ui/futuristic-select";
import { FuturisticTextarea } from "../../ui/futuristic-textarea";
import { cn } from "../../../lib/utils";
import { companySettingsSchema, type CompanySettingsFormData } from "../../../schemas/company-settings-advanced";
import { buscarCnpj, formatarCnpj, validarCnpj } from "../../../lib/integrations/cnpj";
import { buscarEnderecoPorCep, formatarCep } from "../../../lib/integrations/viacep";
import { CompanyAuditTab } from "../../settings/tabs/CompanyAuditTab";
import { AdvancedLogoUpload } from "./AdvancedLogoUpload";
import { DigitalCertificateUpload } from "./DigitalCertificateUpload";
import { AdvancedThemeEditor } from "./AdvancedThemeEditor";
import { CompanyDocumentsManager } from "./CompanyDocumentsManager";
import { ThemeExportImport } from "./ThemeExportImport";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { Tooltip } from "./Tooltip";
import { notificationCenter } from "../../notifications/notification-center";
import { useUndoRedo } from "../../../hooks/use-undo-redo";
import { companySettingsAPI } from "../../../lib/api/company-settings";
import { StandardFormPage } from "../../templates";
import { useAutoSave } from "../../../hooks/useAutoSave";

// Mock Data (Simulando API)
const MOCK_COMPANY: CompanySettingsFormData = {
  id: "1",
  name: "Morina Tecnologia",
  legalName: "Morina Soluções em Tecnologia Ltda",
  cnpj: "12.345.678/0001-90",
  email: "contato@morina.com.br",
  financialEmail: "financeiro@morina.com.br",
  phone: "(11) 99999-8888",
  secondaryPhone: "(11) 3333-4444",
  whatsapp: "(11) 98888-7777",
  website: "https://morina.com.br",
  address: {
    street: "Av. Paulista",
    number: "1000",
    complement: "Conj 101",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    country: "Brasil",
  },
  companySize: "EPP",
  foundedAt: "2020-01-15",
  fiscal: {
    taxRegime: "SIMPLES",
    icmsRate: 18,
    issRate: 5,
    pisRate: 1.65,
    cofinsRate: 7.6,
    nfeEnvironment: "HOMOLOGACAO",
    substituteTax: false,
  },
  theme: {
    primaryColor: "#5b8aff",
    secondaryColor: "#9c27b0",
    logoUrl: null,
    videoUrl: null,
    darkMode: false,
  },
  logoUrl: null,
  active: true,
};

// Cálculo de completude do perfil
function calculateCompleteness(data: Partial<CompanySettingsFormData>): number {
  const fields = [
    data.name,
    data.legalName,
    data.cnpj,
    data.email,
    data.phone,
    data.address?.street,
    data.address?.city,
    data.address?.state,
    data.address?.zipCode,
    data.fiscal?.taxRegime,
    data.companySize,
    data.foundedAt,
  ];
  
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function CompanyEditClient() {
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; url: string; type: string }>>([]);

  const [loading, setLoading] = useState(true);
  
  const form = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: MOCK_COMPANY,
    mode: "onChange",
  });

  // Carregar dados da API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await companySettingsAPI.getSettings();
        form.reset(data, { keepValues: false });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao carregar",
          message: "Não foi possível carregar as configurações. Usando valores padrão.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const { watch, setValue, formState: { errors, isDirty } } = form;
  const formData = watch();
  
  // Auto-save usando hook padronizado
  const { status: autoSaveStatus, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
    onSave: async () => {
      if (!isDirty) return;
      const isValid = await form.trigger();
      if (!isValid) return;
      
      try {
        await companySettingsAPI.updateSettings(formData);
        form.reset(formData, { keepValues: true });
      } catch (error) {
        console.error("Erro no auto-save:", error);
        throw error;
      }
    },
    intervalMs: 30000, // 30 segundos
    requireValid: true,
    isValid: async () => {
      const isValid = await form.trigger();
      return isValid;
    },
    onAutoSaveComplete: () => {
      // Auto-save concluído
    },
  });
  
  // Marcar dirty quando formData muda
  useEffect(() => {
    if (isDirty) {
      markDirty();
    }
  }, [formData, isDirty, markDirty]);

  // Undo/Redo para alterações do formulário
  const undoRedo = useUndoRedo(MOCK_COMPANY, 50);
  const isUndoRedoRef = useRef(false);

  // Atualizar histórico quando formulário muda (apenas se não for undo/redo)
  useEffect(() => {
    if (!isUndoRedoRef.current && isDirty) {
      undoRedo.setValue(formData);
    }
    isUndoRedoRef.current = false;
  }, [formData, isDirty, undoRedo]);

  // Handlers de undo/redo
  const handleUndo = useCallback(() => {
    if (!undoRedo.canUndo) return;
    isUndoRedoRef.current = true;
    undoRedo.undo();
    // Aplicar valores ao formulário
    const values = undoRedo.value as CompanySettingsFormData;
    Object.keys(values).forEach((key) => {
      setValue(key as any, (values as any)[key], { shouldDirty: false });
    });
    form.reset(values, { keepValues: true });
  }, [undoRedo, setValue, form]);

  const handleRedo = useCallback(() => {
    if (!undoRedo.canRedo) return;
    isUndoRedoRef.current = true;
    undoRedo.redo();
    // Aplicar valores ao formulário
    const values = undoRedo.value as CompanySettingsFormData;
    Object.keys(values).forEach((key) => {
      setValue(key as any, (values as any)[key], { shouldDirty: false });
    });
    form.reset(values, { keepValues: true });
  }, [undoRedo, setValue, form]);

  const handleSave = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      notificationCenter.add({
        type: "error",
        title: "Validação falhou",
        message: "Por favor, corrija os erros antes de salvar.",
      });
      return;
    }

      setSaving(true);
    try {
      const savedData = await companySettingsAPI.updateSettings(formData);
      form.reset(savedData, { keepValues: true });
      markClean();
      notificationCenter.add({
        type: "success",
        title: "Configurações salvas",
        message: "As alterações foram salvas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar",
        message: error instanceof Error ? error.message : "Ocorreu um erro ao salvar as configurações.",
      });
    } finally {
      setSaving(false);
    }
  }, [form, formData]);

  // Calcular completude
  const completeness = calculateCompleteness(formData);

  // Busca CNPJ
  const handleSearchCnpj = async () => {
    const cnpj = form.getValues("cnpj");
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    if (!validarCnpj(cleanCnpj)) {
      form.setError("cnpj", { message: "CNPJ inválido" });
      return;
    }

    setSearchingCnpj(true);
    try {
      const data = await buscarCnpj(cleanCnpj);
      
      if (data) {
        setValue("legalName", data.razaoSocial);
        if (data.nomeFantasia) setValue("name", data.nomeFantasia);
        if (data.endereco.logradouro) setValue("address.street", data.endereco.logradouro);
        if (data.endereco.numero) setValue("address.number", data.endereco.numero);
        if (data.endereco.complemento) setValue("address.complement", data.endereco.complemento);
        if (data.endereco.bairro) setValue("address.neighborhood", data.endereco.bairro);
        if (data.endereco.cidade) setValue("address.city", data.endereco.cidade);
        if (data.endereco.estado) setValue("address.state", data.endereco.estado);
        if (data.endereco.cep) setValue("address.zipCode", formatarCep(data.endereco.cep));
        if (data.cnaePrincipal) setValue("cnaePrincipal", data.cnaePrincipal);
        if (data.porte) {
          const porteMap: Record<string, "MEI" | "ME" | "EPP" | "MEDIO" | "GRANDE"> = {
            "MICRO": "ME",
            "PEQUENO": "EPP",
            "MEDIO": "MEDIO",
            "DEMAIS": "GRANDE",
          };
          const porte = porteMap[data.porte.toUpperCase()] || "EPP";
          setValue("companySize", porte);
        }
        if (data.dataInicioAtividade) {
          setValue("foundedAt", data.dataInicioAtividade.split("T")[0]);
        }
        notificationCenter.add({
          type: "success",
          title: "CNPJ encontrado",
          message: "Dados da empresa preenchidos automaticamente.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar CNPJ";
      form.setError("cnpj", { message: errorMessage });
      notificationCenter.add({
        type: "error",
        title: "Erro ao buscar CNPJ",
        message: errorMessage,
      });
    } finally {
      setSearchingCnpj(false);
    }
  };

  // Busca CEP
  const handleSearchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setSearchingCep(true);
    try {
      const data = await buscarEnderecoPorCep(cleanCep);
      if (data) {
        setValue("address.street", data.logradouro || "");
        setValue("address.neighborhood", data.bairro || "");
        setValue("address.city", data.localidade || "");
        setValue("address.state", data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setSearchingCep(false);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mx-auto" />
          <p className="mt-4 text-white/50">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const handleOnSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      await handleSave();
    },
    [handleSave],
  );

  return (
    <StandardFormPage
      title="Configurações da Empresa"
      subtitle="Gerencie os dados, configurações fiscais, tema e identidade visual da sua organização."
      icon={<Building2 className="h-8 w-8" />}
      onSave={handleOnSubmit}
      backUrl="/admin/company"
      isValid={!Object.keys(errors).length}
      autoSaveStatus={autoSaveStatus}
      hasUnsavedChanges={hasUnsavedChanges}
      loading={loading || saving}
      headerActions={
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="hidden sm:flex items-center gap-1 border-r border-white/10 pr-3">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!undoRedo.canUndo}
              className={cn(
                "p-2 rounded-lg transition-all",
                undoRedo.canUndo
                  ? "hover:bg-white/10 text-white"
                  : "opacity-30 cursor-not-allowed text-zinc-400",
              )}
              title="Desfazer (Ctrl+Z)"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!undoRedo.canRedo}
              className={cn(
                "p-2 rounded-lg transition-all",
                undoRedo.canRedo
                  ? "hover:bg-white/10 text-white"
                  : "opacity-30 cursor-not-allowed text-zinc-400",
              )}
              title="Refazer (Ctrl+Shift+Z)"
            >
              <History className="h-4 w-4 rotate-180" />
            </button>
          </div>
          
          {/* Completude */}
          <div className="text-xs text-white/60">
            {completeness}% completo
          </div>
        </div>
      }
    >
      <div className="space-y-8">

      {/* Menu de Navegação Elevado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="sticky top-0 z-30 -mx-6 px-6 py-4 border-b border-white/10 bg-[#09090b]/95 backdrop-blur-xl shadow-lg"
      >
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "general", label: "Visão Geral", icon: Building2 },
            { id: "fiscal", label: "Fiscal & Tributário", icon: CreditCard },
            { id: "address", label: "Endereço", icon: MapPin },
            { id: "contact", label: "Contato", icon: Phone },
            { id: "documents", label: "Documentos", icon: FileText },
            { id: "theme", label: "Tema & Identidade", icon: Palette },
            { id: "advanced", label: "Avançado", icon: Zap },
            { id: "audit", label: "Auditoria", icon: History },
          ].map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all",
                  isActive
                    ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-white shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white hover:border-white/20",
                )}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <form className="space-y-6">
        <AnimatePresence mode="wait">
          {activeSection === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <SectionCard
                  title="Identidade Visual"
                  description="Logo e cores da sua marca exibidos no sistema."
                >
                  <AdvancedLogoUpload
                    value={logoPreview || formData.logoUrl || null}
                    onChange={(value, variants) => {
                      setLogoPreview(value);
                      setValue("logoUrl", value);
                      if (formData.theme) {
                        setValue("theme.logoUrl", value);
                        if (variants) {
                          setValue("theme.logos", {
                            ...formData.theme.logos,
                            main: value,
                            thumbnail: variants.thumbnail,
                            medium: variants.medium,
                            large: variants.large,
                          } as any);
                        }
                      }
                    }}
                    label="Logo Principal"
                    description="Upload de logo com processamento avançado, otimização automática e geração de múltiplas variantes (thumbnail, médio, grande)"
                  />
                </SectionCard>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                      Dados Corporativos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Nome Fantasia"
                          required
                          value={formData.name || ""}
                          onChange={(e) => setValue("name", e.target.value)}
                          placeholder="Ex: Morina Tech"
                          error={!!errors.name}
                          errorMessage={errors.name?.message}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Razão Social"
                          required
                          value={formData.legalName || ""}
                          onChange={(e) => setValue("legalName", e.target.value)}
                          placeholder="Ex: Morina Tecnologia Ltda"
                          error={!!errors.legalName}
                          errorMessage={errors.legalName?.message}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="group relative">
                          <label className="block text-sm font-semibold text-white/90 mb-2">
                            CNPJ <span className="text-red-400">*</span>
                          </label>
                          <div className="flex gap-2">
                            <FuturisticInput
                              label=""
                              value={formData.cnpj || ""}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                const formatted = formatarCnpj(value);
                                setValue("cnpj", formatted);
                              }}
                              placeholder="00.000.000/0000-00"
                              maxLength={18}
                              error={!!errors.cnpj}
                              errorMessage={errors.cnpj?.message}
                              className="flex-1"
                            />
                            <div className="flex items-end">
                              <Button
                                type="button"
                                onClick={handleSearchCnpj}
                                disabled={searchingCnpj}
                                variant="secondary"
                                className="h-[42px]"
                              >
                                {searchingCnpj ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Search className="h-4 w-4" />
                                )}
                                Buscar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <FuturisticSelect
                        label="Porte da Empresa"
                        required
                        value={formData.companySize || ""}
                        onChange={(e) => setValue("companySize", e.target.value as any)}
                        error={!!errors.companySize}
                        errorMessage={errors.companySize?.message}
                      >
                        <option value="" className="bg-[#1a1f3a]">Selecione o porte</option>
                        <option value="MEI" className="bg-[#1a1f3a]">MEI - Microempreendedor Individual</option>
                        <option value="ME" className="bg-[#1a1f3a]">ME - Microempresa</option>
                        <option value="EPP" className="bg-[#1a1f3a]">EPP - Empresa de Pequeno Porte</option>
                        <option value="MEDIO" className="bg-[#1a1f3a]">Médio Porte</option>
                        <option value="GRANDE" className="bg-[#1a1f3a]">Grande Porte</option>
                      </FuturisticSelect>

                      <FuturisticInput
                        label="Data de Fundação"
                        type="date"
                        value={formData.foundedAt || ""}
                        onChange={(e) => setValue("foundedAt", e.target.value)}
                        error={!!errors.foundedAt}
                        errorMessage={errors.foundedAt?.message}
                      />
                    </div>
                  </div>
                </motion.div>
            </motion.div>
          )}

          {activeSection === "fiscal" && (
            <motion.div
              key="fiscal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                      Configurações Fiscais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FuturisticSelect
                        label="Regime Tributário"
                        required
                        value={formData.fiscal?.taxRegime || ""}
                        onChange={(e) => setValue("fiscal.taxRegime", e.target.value as any)}
                        error={!!errors.fiscal?.taxRegime}
                        errorMessage={errors.fiscal?.taxRegime?.message}
                      >
                        <option value="" className="bg-[#1a1f3a]">Selecione o regime</option>
                        <option value="SIMPLES" className="bg-[#1a1f3a]">SIMPLES Nacional</option>
                        <option value="PRESUMIDO" className="bg-[#1a1f3a]">Lucro Presumido</option>
                        <option value="REAL" className="bg-[#1a1f3a]">Lucro Real</option>
                      </FuturisticSelect>

                      <FuturisticSelect
                        label="Ambiente NFe"
                        value={formData.fiscal?.nfeEnvironment || ""}
                        onChange={(e) => setValue("fiscal.nfeEnvironment", e.target.value as any)}
                      >
                        <option value="HOMOLOGACAO" className="bg-[#1a1f3a]">Homologação</option>
                        <option value="PRODUCAO" className="bg-[#1a1f3a]">Produção</option>
                      </FuturisticSelect>

                      <FuturisticInput
                        label="ICMS (%)"
                        type="number"
                        step="0.01"
                        value={formData.fiscal?.icmsRate?.toString() || ""}
                        onChange={(e) => setValue("fiscal.icmsRate", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />

                      <FuturisticInput
                        label="ISS (%)"
                        type="number"
                        step="0.01"
                        value={formData.fiscal?.issRate?.toString() || ""}
                        onChange={(e) => setValue("fiscal.issRate", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </motion.div>

                <SectionCard
                  title="Certificado Digital"
                  description="Gerencie o certificado digital para emissão de notas fiscais."
                >
                  <DigitalCertificateUpload
                    value={formData.digitalCertificate as any}
                    onChange={(value) => setValue("digitalCertificate", value as any)}
                  />
                </SectionCard>
            </motion.div>
          )}

          {activeSection === "address" && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                      Endereço Completo
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <div className="group relative">
                          <label className="block text-sm font-semibold text-white/90 mb-2">
                            CEP <span className="text-red-400">*</span>
                          </label>
                          <div className="flex gap-2">
                            <FuturisticInput
                              label=""
                              value={formData.address?.zipCode || ""}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                const formatted = formatarCep(value);
                                setValue("address.zipCode", formatted);
                                if (formatted.length === 9) {
                                  handleSearchCep(formatted);
                                }
                              }}
                              placeholder="00000-000"
                              maxLength={9}
                              error={!!errors.address?.zipCode}
                              errorMessage={errors.address?.zipCode?.message}
                              className="flex-1"
                            />
                            {searchingCep && (
                              <div className="flex items-end">
                                <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))] mb-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Logradouro"
                          required
                          value={formData.address?.street || ""}
                          onChange={(e) => setValue("address.street", e.target.value)}
                          placeholder="Rua, Avenida, etc."
                          error={!!errors.address?.street}
                          errorMessage={errors.address?.street?.message}
                        />
                      </div>

                      <FuturisticInput
                        label="Número"
                        required
                        value={formData.address?.number || ""}
                        onChange={(e) => setValue("address.number", e.target.value)}
                        placeholder="123"
                        error={!!errors.address?.number}
                        errorMessage={errors.address?.number?.message}
                      />

                      <FuturisticInput
                        label="Complemento"
                        value={formData.address?.complement || ""}
                        onChange={(e) => setValue("address.complement", e.target.value)}
                        placeholder="Apto, Sala, etc."
                      />

                      <FuturisticInput
                        label="Bairro"
                        required
                        value={formData.address?.neighborhood || ""}
                        onChange={(e) => setValue("address.neighborhood", e.target.value)}
                        placeholder="Bairro"
                        error={!!errors.address?.neighborhood}
                        errorMessage={errors.address?.neighborhood?.message}
                      />

                      <FuturisticInput
                        label="Cidade"
                        required
                        value={formData.address?.city || ""}
                        onChange={(e) => setValue("address.city", e.target.value)}
                        placeholder="Cidade"
                        error={!!errors.address?.city}
                        errorMessage={errors.address?.city?.message}
                      />

                      <FuturisticSelect
                        label="Estado"
                        required
                        value={formData.address?.state || ""}
                        onChange={(e) => setValue("address.state", e.target.value)}
                        error={!!errors.address?.state}
                        errorMessage={errors.address?.state?.message}
                      >
                        <option value="" className="bg-[#1a1f3a]">Selecione</option>
                        <option value="AC" className="bg-[#1a1f3a]">Acre</option>
                        <option value="AL" className="bg-[#1a1f3a]">Alagoas</option>
                        <option value="AP" className="bg-[#1a1f3a]">Amapá</option>
                        <option value="AM" className="bg-[#1a1f3a]">Amazonas</option>
                        <option value="BA" className="bg-[#1a1f3a]">Bahia</option>
                        <option value="CE" className="bg-[#1a1f3a]">Ceará</option>
                        <option value="DF" className="bg-[#1a1f3a]">Distrito Federal</option>
                        <option value="ES" className="bg-[#1a1f3a]">Espírito Santo</option>
                        <option value="GO" className="bg-[#1a1f3a]">Goiás</option>
                        <option value="MA" className="bg-[#1a1f3a]">Maranhão</option>
                        <option value="MT" className="bg-[#1a1f3a]">Mato Grosso</option>
                        <option value="MS" className="bg-[#1a1f3a]">Mato Grosso do Sul</option>
                        <option value="MG" className="bg-[#1a1f3a]">Minas Gerais</option>
                        <option value="PA" className="bg-[#1a1f3a]">Pará</option>
                        <option value="PB" className="bg-[#1a1f3a]">Paraíba</option>
                        <option value="PR" className="bg-[#1a1f3a]">Paraná</option>
                        <option value="PE" className="bg-[#1a1f3a]">Pernambuco</option>
                        <option value="PI" className="bg-[#1a1f3a]">Piauí</option>
                        <option value="RJ" className="bg-[#1a1f3a]">Rio de Janeiro</option>
                        <option value="RN" className="bg-[#1a1f3a]">Rio Grande do Norte</option>
                        <option value="RS" className="bg-[#1a1f3a]">Rio Grande do Sul</option>
                        <option value="RO" className="bg-[#1a1f3a]">Rondônia</option>
                        <option value="RR" className="bg-[#1a1f3a]">Roraima</option>
                        <option value="SC" className="bg-[#1a1f3a]">Santa Catarina</option>
                        <option value="SP" className="bg-[#1a1f3a]">São Paulo</option>
                        <option value="SE" className="bg-[#1a1f3a]">Sergipe</option>
                        <option value="TO" className="bg-[#1a1f3a]">Tocantins</option>
                      </FuturisticSelect>
                    </div>
                  </div>
                </motion.div>
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                      Informações de Contato
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Email Principal"
                          type="email"
                          required
                          value={formData.email || ""}
                          onChange={(e) => setValue("email", e.target.value)}
                          placeholder="contato@empresa.com.br"
                          error={!!errors.email}
                          errorMessage={errors.email?.message}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Email Financeiro"
                          type="email"
                          value={formData.financialEmail || ""}
                          onChange={(e) => setValue("financialEmail", e.target.value)}
                          placeholder="financeiro@empresa.com.br"
                          error={!!errors.financialEmail}
                          errorMessage={errors.financialEmail?.message}
                        />
                      </div>

                      <FuturisticInput
                        label="Telefone Principal"
                        required
                        value={formData.phone || ""}
                        onChange={(e) => setValue("phone", e.target.value)}
                        placeholder="(11) 99999-8888"
                        error={!!errors.phone}
                        errorMessage={errors.phone?.message}
                      />

                      <FuturisticInput
                        label="WhatsApp"
                        value={formData.whatsapp || ""}
                        onChange={(e) => setValue("whatsapp", e.target.value)}
                        placeholder="(11) 98888-7777"
                        error={!!errors.whatsapp}
                        errorMessage={errors.whatsapp?.message}
                      />

                      <FuturisticInput
                        label="Telefone Secundário"
                        value={formData.secondaryPhone || ""}
                        onChange={(e) => setValue("secondaryPhone", e.target.value)}
                        placeholder="(11) 3333-4444"
                      />

                      <div className="md:col-span-2">
                        <FuturisticInput
                          label="Website"
                          type="url"
                          value={formData.website || ""}
                          onChange={(e) => setValue("website", e.target.value)}
                          placeholder="https://www.empresa.com.br"
                          error={!!errors.website}
                          errorMessage={errors.website?.message}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full" />
                      Redes Sociais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: "linkedin", label: "LinkedIn", icon: "💼" },
                        { key: "instagram", label: "Instagram", icon: "📷" },
                        { key: "facebook", label: "Facebook", icon: "👥" },
                        { key: "twitter", label: "Twitter/X", icon: "🐦" },
                        { key: "youtube", label: "YouTube", icon: "📺" },
                        { key: "tiktok", label: "TikTok", icon: "🎵" },
                      ].map((social) => (
                        <FuturisticInput
                          key={social.key}
                          label={`${social.icon} ${social.label}`}
                          type="url"
                          value={(formData.socialMedia as any)?.[social.key] || ""}
                          onChange={(e) => setValue(`socialMedia.${social.key}` as any, e.target.value)}
                          placeholder={`https://${social.key === "linkedin" ? "linkedin.com/company" : social.key === "twitter" ? "twitter.com" : social.key}.com/empresa`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
            </motion.div>
          )}

          {activeSection === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <SectionCard
                  title="Documentos da Empresa"
                  description="Gerencie documentos importantes da empresa com controle de validade e histórico de versões."
                >
                  <CompanyDocumentsManager
                    documents={documents}
                    onDocumentsChange={setDocuments}
                  />
                </SectionCard>
            </motion.div>
          )}

          {activeSection === "theme" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <SectionCard
                  title="Editor de Tema Avançado"
                  description="Personalize completamente a identidade visual do sistema com cores, tipografia, efeitos e muito mais."
                >
                  <AdvancedThemeEditor
                    value={formData.theme as any}
                    onChange={(value) => {
                      setValue("theme", value as any);
                      undoRedo.setValue({ ...formData, theme: value as any });
                    }}
                  />
                </SectionCard>

                <SectionCard
                  title="Logo da Empresa"
                  description="Upload avançado de logo com processamento automático e múltiplas variantes."
                >
                  <AdvancedLogoUpload
                    value={formData.logoUrl || formData.theme?.logos?.main || null}
                    onChange={(value, variants) => {
                      setValue("logoUrl", value);
                      if (formData.theme) {
                        setValue("theme.logos", {
                          ...formData.theme.logos,
                          main: value,
                        } as any);
                      }
                    }}
                  />
                </SectionCard>

                <SectionCard
                  title="Exportar/Importar Tema"
                  description="Salve ou carregue configurações de tema para backup ou compartilhamento."
                >
                  <ThemeExportImport
                    theme={formData.theme as any}
                    onThemeImport={(importedTheme) => {
                      setValue("theme", importedTheme as any);
                      undoRedo.setValue({ ...formData, theme: importedTheme as any });
                      notificationCenter.add({
                        type: "success",
                        title: "Tema importado",
                        message: "O tema foi aplicado com sucesso!",
                      });
                    }}
                  />
                </SectionCard>
            </motion.div>
          )}

          {activeSection === "advanced" && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
                <SectionCard
                  title="Configurações Avançadas"
                  description="Configurações de segurança, integrações e backup."
                >
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Segurança
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 transition-colors group-hover:border-[hsl(var(--primary))]">
                            <input
                              type="checkbox"
                              className="peer absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <CheckCircle2 className="w-3 h-3 text-[hsl(var(--primary))] opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                            Autenticação de dois fatores (2FA)
                          </span>
                        </label>
                        <div className="pl-8">
                          <label className="block text-xs text-zinc-400 mb-2">
                            Timeout de sessão (minutos)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="480"
                            defaultValue="30"
                            className="w-32 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Integrações
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "NF-e", key: "nfe" },
                          { label: "NFC-e", key: "nfce" },
                          { label: "CT-e", key: "cte" },
                          { label: "MDF-e", key: "mdfe" },
                        ].map((integration) => (
                          <label
                            key={integration.key}
                            className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
                          >
                            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 transition-colors group-hover:border-[hsl(var(--primary))]">
                              <input
                                type="checkbox"
                                className="peer absolute opacity-0 w-full h-full cursor-pointer"
                              />
                              <CheckCircle2 className="w-3 h-3 text-[hsl(var(--primary))] opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                              {integration.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Backup e Versionamento
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 transition-colors group-hover:border-[hsl(var(--primary))]">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="peer absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <CheckCircle2 className="w-3 h-3 text-[hsl(var(--primary))] opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                            Backup automático
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 transition-colors group-hover:border-[hsl(var(--primary))]">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="peer absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <CheckCircle2 className="w-3 h-3 text-[hsl(var(--primary))] opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                            Versionamento de alterações
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </SectionCard>
            </motion.div>
          )}

          {activeSection === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyAuditTab />
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Atalhos de Teclado */}
      <KeyboardShortcuts />
      </div>
    </StandardFormPage>
  );
}

