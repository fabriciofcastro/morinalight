"use client";

import { Loader2, Building2, FileText, MapPin, Phone, Info, CheckCircle2, FolderOpen, History, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { organizationalStructureApi, type Branch, type CreateBranchInput, type UpdateBranchInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";
import { AnimatedNetworkBackground } from "@/components/ui/animated-network-background";
import { Button } from "@/components/ui/button";
import { AllowedGuard } from "@/components/auth/allowed-guard";
import { DocumentsTab } from "@/components/admin/branches/documents-tab";
import { AuditLogModal } from "@/components/ui/audit-log-modal";
import { DuplicateBranchModal, type DuplicateOptions } from "@/components/ui/duplicate-branch-modal";
import { BusinessHoursEditor } from "@/components/admin/branches/business-hours-editor";
import type { BusinessHours } from "@/types/business-hours";
import { BUSINESS_HOURS_TEMPLATES } from "@/types/business-hours";
import { MapPicker } from "@/components/ui/map-picker";
import { useGeocoding } from "@/hooks/use-geocoding";
import type { Coordinates } from "@/lib/google-maps";
import { BranchSelector } from "@/components/admin/branches/branch-selector";
import { CapacityEditor } from "@/components/admin/branches/capacity-editor";
import { CostsEditor } from "@/components/admin/branches/costs-editor";
import { CustomFieldsBuilder } from "@/components/admin/branches/custom-fields-builder";
import { CustomFieldsRenderer } from "@/components/admin/branches/custom-fields-renderer";
import type { BranchCustomFieldsConfig, CustomFieldsValues } from "@/types/custom-fields";
import { useState as useReactState } from "react";
import { Settings2, TrendingUp, DollarSign } from "lucide-react";

// Zod Schema Validation
const branchSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  code: z.string().min(2, "Código deve ter pelo menos 2 caracteres"),
  type: z.string(),
  active: z.boolean(),
  cnpj: z.string().optional().refine(val => !val || val.length === 18 || val.length === 14, "CNPJ inválido"),
  stateRegistration: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.object({
    zipCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().max(2).optional(),
  }).optional(),
});

interface BranchFormClientProps {
  branchId?: string;
}

export function BranchFormClient({ branchId }: BranchFormClientProps) {
  const router = useRouter();
  const isEditing = !!branchId;

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  const [form, setForm] = useState<CreateBranchInput>({
    name: "",
    code: "",
    type: "LOJA",
    active: true,
    cnpj: "",
    stateRegistration: "",
    email: "",
    phone: "",
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"general" | "fiscal" | "address" | "contact" | "documents" | "hours" | "capacity" | "costs" | "custom_fields">("general");
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(BUSINESS_HOURS_TEMPLATES.custom.hours);
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(undefined);
  const [parentBranchId, setParentBranchId] = useState<string | undefined>(undefined);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  // Capacity & Costs State
  const [capacity, setCapacity] = useState({
    productionLines: 0,
    maxDailyProduction: 0,
    maxMonthlyProduction: 0,
    currentUtilization: 0,
    goals: { monthly: 0, quarterly: 0, annual: 0 }
  });
  const [costs, setCosts] = useState<Record<string, number>>({});

  // Custom Fields State
  const [customFieldsConfig, setCustomFieldsConfig] = useState<BranchCustomFieldsConfig>({ sections: [], fields: [] });
  const [customFieldsValues, setCustomFieldsValues] = useState<CustomFieldsValues>({});
  const [isConfiguringFields, setIsConfiguringFields] = useState(false);

  const { geocode, loading: geocoding } = useGeocoding();

  // Validate form using Zod
  const validateForm = useCallback(() => {
    const result = branchSchema.safeParse(form);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
        // Also map nested address errors to simple keys if needed or handle in UI
      });
      setErrors(formattedErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [form]);

  const canSave = useMemo(() => {
    const result = branchSchema.safeParse(form);
    return result.success;
  }, [form]);

  // Auto-save
  const { status, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
    onSave: async () => {
      if (!canSave) return;
      await handleSave();
    },
    intervalMs: 30000,
    requireValid: true,
    isValid: () => canSave,
    onAutoSaveComplete: () => {
      markClean();
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (branchId) {
        try {
          setLoading(true);
          const br = await organizationalStructureApi.getBranch(branchId);
          setBranch(br);
          setForm({
            name: br.name,
            code: br.code,
            type: br.type,
            active: br.active,
            cnpj: br.cnpj || "",
            stateRegistration: br.stateRegistration || "",
            email: br.email || "",
            phone: br.phone || "",
            address: br.address || {
              zipCode: "",
              street: "",
              number: "",
              complement: "",
              neighborhood: "",
              city: "",
              state: "",
            },
          });
          markClean();
        } catch (error) {
          console.error("Failed to load branch", error);
          notificationCenter.add({
            type: "error",
            title: "Erro ao carregar dados",
            message: "Não foi possível carregar os dados da filial",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        markDirty();
      }
    };

    loadData();

    // Carregar lista de filiais para seletor de pai
    const loadAllBranches = async () => {
      try {
        const branches = await organizationalStructureApi.getBranches();
        setAllBranches(branches);
      } catch (error) {
        console.error("Erro ao carregar filiais:", error);
      }
    };

    loadAllBranches();
  }, [branchId, isEditing, markClean, markDirty]);

  const handleCnpjBlur = async () => {
    const cnpj = form.cnpj?.replace(/\D/g, "");
    if (cnpj?.length === 14) {
      try {
        setFetchingCnpj(true);
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        setForm((prev) => ({
          ...prev,
          name: data.razao_social || prev.name,
          email: data.email || prev.email,
          phone: data.ddd_telefone_1 || prev.phone,
          address: {
            ...prev.address!,
            zipCode: data.cep || prev.address?.zipCode,
            street: data.logradouro || prev.address?.street,
            number: data.numero || prev.address?.number,
            complement: data.complemento || prev.address?.complement,
            neighborhood: data.bairro || prev.address?.neighborhood,
            city: data.municipio || prev.address?.city,
            state: data.uf || prev.address?.state,
          },
        }));
        markDirty();
        notificationCenter.add({
          type: "success",
          title: "Dados preenchidos",
          message: "Dados do CNPJ foram preenchidos automaticamente",
        });
      } catch (error) {
        console.error("Erro ao buscar CNPJ:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao buscar CNPJ",
          message: "Não foi possível buscar os dados do CNPJ",
        });
      } finally {
        setFetchingCnpj(false);
      }
    }
  };

  const handleCepBlur = async () => {
    const cep = form.address?.zipCode.replace(/\D/g, "");
    if (cep?.length === 8) {
      try {
        setFetchingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) throw new Error("CEP não encontrado");

        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address!,
            street: data.logradouro || prev.address?.street,
            neighborhood: data.bairro || prev.address?.neighborhood,
            city: data.localidade || prev.address?.city,
            state: data.uf || prev.address?.state,
          },
        }));
        markDirty();
        notificationCenter.add({
          type: "success",
          title: "Endereço preenchido",
          message: "Endereço foi preenchido automaticamente",
        });
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao buscar CEP",
          message: "Não foi possível buscar o endereço do CEP",
        });
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: "Verifique os campos obrigatórios.",
      });
      return;
    }

    try {
      if (isEditing && branchId) {
        const updateData: UpdateBranchInput = {
          id: branchId,
          ...form,
          cnpj: form.cnpj || undefined,
          stateRegistration: form.stateRegistration || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
        };
        await organizationalStructureApi.updateBranch(updateData);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Filial atualizada",
          message: `Filial ${form.name} foi atualizada com sucesso`,
        });
        router.push(`/admin/branches/${branchId}`);
      } else {
        await organizationalStructureApi.createBranch(form);
        markClean();
        notificationCenter.add({
          type: "success",
          title: "Filial criada",
          message: `Filial ${form.name} foi criada com sucesso`,
        });
        router.push("/admin/branches");
      }
    } catch (error) {
      console.error("Failed to save branch", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao salvar filial",
        message: "Não foi possível salvar a filial. Tente novamente.",
      });
    }
  }, [form, isEditing, branchId, router, markClean, validateForm]);

  // Auto-geocode quando o endereço completo estiver preenchido
  useEffect(() => {
    const address = form.address;
    if (!address || geocoding) return;

    const fullAddress = [
      address.street,
      address.number,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    if (
      address.street &&
      address.city &&
      address.state &&
      fullAddress.length > 20
    ) {
      const timeoutId = setTimeout(async () => {
        const coords = await geocode(fullAddress);
        if (coords) {
          setCoordinates(coords);
        }
      }, 1000); // Debounce de 1s

      return () => clearTimeout(timeoutId);
    }
  }, [
    form.address?.street,
    form.address?.number,
    form.address?.city,
    form.address?.state,
    form.address?.zipCode,
    geocode,
    geocoding,
  ]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      await handleSave();
    },
    [handleSave],
  );

  const handleDuplicate = useCallback(
    async (options: DuplicateOptions) => {
      if (!branchId) return;

      try {
        const newBranch = await organizationalStructureApi.duplicateBranch(branchId, {
          name: options.newName,
          code: options.newCode,
          copyDocuments: options.copyDocuments,
          copyBusinessHours: options.copyBusinessHours,
          maintainHierarchy: options.maintainHierarchy
        });

        notificationCenter.add({
          type: "success",
          title: "Filial duplicada",
          message: `Filial "${options.newName}" criada com sucesso`,
        });

        setShowDuplicateModal(false);

        // Navegar para a nova filial
        router.push(`/admin/branches/${newBranch.id}`);
      } catch (error) {
        console.error("Erro ao duplicar filial:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Não foi possível duplicar a filial",
        });
      }
    },
    [branchId, router],
  );

  const tabs = [
    { id: "general" as const, label: "Geral", icon: Building2 },
    { id: "fiscal" as const, label: "Fiscal", icon: FileText },
    { id: "address" as const, label: "Endereço", icon: MapPin },
    { id: "contact" as const, label: "Contato", icon: Phone },
    { id: "hours" as const, label: "Horários", icon: Info },
    { id: "documents" as const, label: "Documentos", icon: FolderOpen },
    { id: "capacity" as const, label: "Capacidade", icon: TrendingUp },
    { id: "costs" as const, label: "Custos", icon: DollarSign },
    { id: "custom_fields" as const, label: "Extras", icon: Settings2 },
  ];

  return (
    <AllowedGuard I={isEditing ? "update" : "create"} a="Branch" redirectTo="/admin/branches">
      <AnimatedNetworkBackground className="text-white">
        <StandardFormPage
          title={isEditing ? "Editar Filial" : "Nova Filial"}
          subtitle={
            isEditing
              ? `Atualizar informações da filial ${branch?.name}`
              : "Cadastre uma nova filial no sistema"
          }
          icon={<Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />}
          onSave={onSubmit}
          backUrl={isEditing && branchId ? `/admin/branches/${branchId}` : "/admin/branches"}
          isValid={canSave}
          loading={loading}
          loadingMessage="Carregando dados da filial..."
          autoSaveStatus={status}
          hasUnsavedChanges={hasUnsavedChanges}
          headerActions={
            isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDuplicateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  type="button"
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
                <button
                  onClick={() => setShowAuditLog(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  type="button"
                >
                  <History className="w-4 h-4" />
                  Ver Histórico
                </button>
              </div>
            )
          }
        >
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer hover:bg-white/5 rounded-t-lg ${activeTab === tab.id
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

          <form onSubmit={onSubmit} className="space-y-6">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6 md:grid-cols-2">
                  <FuturisticInput
                    label="Nome da Filial"
                    required
                    value={form.name}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, name: e.target.value }));
                      if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                      markDirty();
                    }}
                    error={!!errors.name}
                    errorMessage={errors.name}
                    placeholder="Ex: Matriz São Paulo"
                    helperText="Nome identificador da unidade."
                  />
                  <FuturisticInput
                    label="Código Interno"
                    required
                    value={form.code}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, code: e.target.value }));
                      if (errors.code) setErrors((e) => ({ ...e, code: "" }));
                      markDirty();
                    }}
                    error={!!errors.code}
                    errorMessage={errors.code}
                    placeholder="Ex: MTZ-01"
                    tooltip="Código único para identificação da filial no sistema ERP."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FuturisticSelect
                    label="Tipo de Unidade"
                    value={form.type}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, type: e.target.value }));
                      markDirty();
                    }}
                  >
                    <option value="LOJA" className="bg-slate-900">Loja</option>
                    <option value="FABRICA" className="bg-slate-900">Fábrica</option>
                    <option value="CD" className="bg-slate-900">Centro de Distribuição</option>
                    <option value="ESCRITORIO" className="bg-slate-900">Escritório</option>
                  </FuturisticSelect>

                  <div className="flex items-center pt-6">
                    <div
                      onClick={() => {
                        setForm((p) => ({ ...p, active: !p.active }));
                        markDirty();
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all w-full md:w-auto ${form.active
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        }`}
                    >
                      <div className={`p-2 rounded-full ${form.active ? "bg-emerald-500/20" : "bg-white/10"}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{form.active ? "Ativa" : "Inativa"}</p>
                        <p className="text-xs opacity-70">Status operacional</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 mt-6">
                  <BranchSelector
                    branches={allBranches}
                    value={parentBranchId}
                    onChange={(id) => {
                      setParentBranchId(id);
                      markDirty();
                    }}
                    currentBranchId={branchId}
                    label="Filial Pai (Hierarquia)"
                    helperText="Selecione a unidade superior caso esta seja uma sub-filial."
                  />
                </div>
              </div>
            )}

            {activeTab === "fiscal" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative">
                    <FuturisticInput
                      label="CNPJ"
                      value={form.cnpj}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, cnpj: e.target.value }));
                        markDirty();
                      }}
                      onBlur={handleCnpjBlur}
                      placeholder="00.000.000/0000-00"
                      error={!!errors.cnpj}
                      errorMessage={errors.cnpj}
                      helperText="Digite para buscar dados automaticamente."
                      tooltip="Cadastro Nacional de Pessoa Jurídica da filial."
                    />
                    {fetchingCnpj && (
                      <div className="absolute right-3 top-[38px]">
                        <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                      </div>
                    )}
                  </div>

                  <FuturisticInput
                    label="Inscrição Estadual"
                    value={form.stateRegistration}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, stateRegistration: e.target.value }));
                      markDirty();
                    }}
                    placeholder="Ex: 123.456.789.111"
                    tooltip="Número de inscrição na Secretaria da Fazenda Estadual."
                  />
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="relative col-span-1">
                    <FuturisticInput
                      label="CEP"
                      value={form.address?.zipCode}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          address: { ...p.address!, zipCode: e.target.value },
                        }));
                        markDirty();
                      }}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                    />
                    {fetchingCep && (
                      <div className="absolute right-3 top-[38px]">
                        <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                      </div>
                    )}
                  </div>
                  <div className="col-span-3">
                    <FuturisticInput
                      label="Logradouro"
                      value={form.address?.street}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          address: { ...p.address!, street: e.target.value },
                        }));
                        markDirty();
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                  <div className="col-span-1">
                    <FuturisticInput
                      label="Número"
                      value={form.address?.number}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          address: { ...p.address!, number: e.target.value },
                        }));
                        markDirty();
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <FuturisticInput
                      label="Complemento"
                      value={form.address?.complement}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          address: { ...p.address!, complement: e.target.value },
                        }));
                        markDirty();
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FuturisticInput
                    label="Bairro"
                    value={form.address?.neighborhood}
                    onChange={(e) => {
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, neighborhood: e.target.value },
                      }));
                      markDirty();
                    }}
                  />
                  <FuturisticInput
                    label="Cidade"
                    value={form.address?.city}
                    onChange={(e) => {
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, city: e.target.value },
                      }));
                      markDirty();
                    }}
                  />
                  <FuturisticInput
                    label="Estado (UF)"
                    value={form.address?.state}
                    onChange={(e) => {
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, state: e.target.value.toUpperCase() },
                      }));
                      markDirty();
                    }}
                    maxLength={2}
                    error={!!errors['address.state']}
                  />
                </div>

                {/* Mapa de localização */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white/90 mb-3">Localização no Mapa</h4>
                  <MapPicker
                    value={coordinates}
                    onChange={(coords) => {
                      setCoordinates(coords);
                      markDirty();
                    }}
                    height="450px"
                    zoom={16}
                  />
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6 md:grid-cols-2">
                  <FuturisticInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                      markDirty();
                    }}
                    placeholder="contato@filial.com"
                    error={!!errors.email}
                    errorMessage={errors.email}
                  />
                  <FuturisticInput
                    label="Telefone"
                    value={form.phone}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, phone: e.target.value }));
                      markDirty();
                    }}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>
            )}

            {activeTab === "hours" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BusinessHoursEditor
                  value={businessHours}
                  onChange={(hours) => {
                    setBusinessHours(hours);
                    markDirty();
                  }}
                />
              </div>
            )}

            {activeTab === "documents" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DocumentsTab branchId={branchId} isNewBranch={!isEditing} />
              </div>
            )}



            {activeTab === "capacity" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CapacityEditor
                  value={capacity}
                  onChange={(val) => {
                    setCapacity(val);
                    markDirty();
                  }}
                />
              </div>
            )}

            {activeTab === "costs" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CostsEditor
                  value={costs}
                  onChange={(val) => {
                    setCosts(val);
                    markDirty();
                  }}
                />
              </div>
            )}

            {activeTab === "custom_fields" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant={isConfiguringFields ? "default" : "outline"}
                    onClick={() => setIsConfiguringFields(!isConfiguringFields)}
                    className="gap-2"
                  >
                    <Settings2 className="w-4 h-4" />
                    {isConfiguringFields ? "Voltar para Dados" : "Configurar Campos"}
                  </Button>
                </div>

                {isConfiguringFields ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">Construtor de Campos</h3>
                      <p className="text-white/60">
                        Defina os campos personalizados que estarão disponíveis para preenchimento nesta e em outras filiais.
                      </p>
                    </div>
                    <CustomFieldsBuilder
                      config={customFieldsConfig}
                      onChange={(cfg) => {
                        setCustomFieldsConfig(cfg);
                        // Reset values for removed fields if needed, or keep for history
                        markDirty();
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">Campos Adicionais</h3>
                      <p className="text-white/60">
                        Preencha as informações complementares definidas para esta unidade.
                      </p>
                    </div>
                    <CustomFieldsRenderer
                      config={customFieldsConfig}
                      values={customFieldsValues}
                      onChange={(vals) => {
                        setCustomFieldsValues(vals);
                        markDirty();
                      }}
                      errors={errors}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
              <span>Os campos marcados com * são obrigatórios.</span>
              {isEditing && branch && (
                <span className="font-mono">ID: {branch.id}</span>
              )}
            </div>
          </form>
        </StandardFormPage>

        {/* Audit Log Modal */}
        {showAuditLog && isEditing && branchId && (
          <AuditLogModal
            entityType="branch"
            entityId={branchId}
            entityName={branch?.name}
            onClose={() => setShowAuditLog(false)}
          />
        )}

        {/* Duplicate Branch Modal */}
        {showDuplicateModal && isEditing && branch && (
          <DuplicateBranchModal
            branchName={branch.name}
            onConfirm={handleDuplicate}
            onCancel={() => setShowDuplicateModal(false)}
          />
        )}
      </AnimatedNetworkBackground>
    </AllowedGuard>
  );
}



