"use client";

import { Loader2, Building2, FileText, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationalStructureApi, type Branch, type CreateBranchInput, type UpdateBranchInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { notificationCenter } from "@/components/notifications/notification-center";

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
  const [activeTab, setActiveTab] = useState<"general" | "fiscal" | "address" | "contact">("general");

  const canSave = useMemo(
    () => form.name.trim().length >= 2 && form.code.trim().length >= 2,
    [form],
  );

  // Auto-save
  const { status, hasUnsavedChanges, markDirty, markClean, manualSave } = useAutoSave({
    onSave: async () => {
      if (!canSave) return;
      await handleSave();
    },
    intervalMs: 30000, // 30 segundos
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

    void loadData();
  }, [branchId, markClean, markDirty]);

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
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código é obrigatório";
    if (newErrors.name || newErrors.code) {
      setErrors(newErrors);
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
  }, [canSave, form, isEditing, branchId, router, markClean]);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!canSave) return;
      await handleSave();
    },
    [canSave, handleSave],
  );

  const tabs = [
    { id: "general" as const, label: "Geral", icon: Building2 },
    { id: "fiscal" as const, label: "Fiscal", icon: FileText },
    { id: "address" as const, label: "Endereço", icon: MapPin },
    { id: "contact" as const, label: "Contato", icon: Phone },
  ];

  return (
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
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
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

      <form onSubmit={onSubmit} className="space-y-6">
          {activeTab === "general" && (
            <div className="space-y-6">
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
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FuturisticSelect
                  label="Tipo"
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={form.active}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, active: e.target.checked }));
                        markDirty();
                      }}
                      className="rounded border-white/10 bg-black/20 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-white/70 cursor-pointer">
                      Filial Ativa
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "fiscal" && (
            <div className="space-y-6">
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
                  />
                  {fetchingCnpj && (
                    <div className="absolute right-3 top-[38px]">
                      <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-white/30">Digite o CNPJ para buscar dados automaticamente.</p>
                </div>

                <FuturisticInput
                  label="Inscrição Estadual"
                  value={form.stateRegistration}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, stateRegistration: e.target.value }));
                    markDirty();
                  }}
                  placeholder="Ex: 123.456.789.111"
                />
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="space-y-6">
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
                />
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FuturisticInput
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }));
                    markDirty();
                  }}
                  placeholder="contato@filial.com"
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

        <div className="text-xs text-white/40 mt-6 pt-6 border-t border-white/10">
          {isEditing && branch && (
            <>
              ID: <span className="font-mono">{branch.id}</span>
            </>
          )}
        </div>
      </form>
    </StandardFormPage>
  );
}


