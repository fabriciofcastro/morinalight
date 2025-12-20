"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, Loader2, Building2, FileText, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { organizationalStructureApi, type Branch, type CreateBranchInput, type UpdateBranchInput } from "@/lib/api/organizational-structure";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { FuturisticSelect } from "@/components/ui/futuristic-select";

interface BranchFormClientProps {
  branchId?: string;
}

export function BranchFormClient({ branchId }: BranchFormClientProps) {
  const router = useRouter();
  const isEditing = !!branchId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        } catch (error) {
          console.error("Failed to load branch", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    void loadData();
  }, [branchId]);

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
      } catch (error) {
        console.error("Erro ao buscar CNPJ:", error);
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
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSave) return;

      const newErrors: Record<string, string> = {};
      if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
      if (!form.code.trim()) newErrors.code = "Código é obrigatório";
      if (newErrors.name || newErrors.code) {
        setErrors(newErrors);
        return;
      }

      try {
        setSaving(true);
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
          router.push(`/admin/branches/${branchId}`);
        } else {
          await organizationalStructureApi.createBranch(form);
          router.push("/admin/branches");
        }
      } catch (error) {
        console.error("Failed to save branch", error);
        alert("Erro ao salvar filial.");
      } finally {
        setSaving(false);
      }
    },
    [canSave, form, isEditing, branchId, router],
  );

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general" as const, label: "Geral", icon: Building2 },
    { id: "fiscal" as const, label: "Fiscal", icon: FileText },
    { id: "address" as const, label: "Endereço", icon: MapPin },
    { id: "contact" as const, label: "Contato", icon: Phone },
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
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {isEditing ? "Editar Filial" : "Nova Filial"}
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {isEditing
                    ? `Atualizar informações da filial ${branch?.name}`
                    : "Cadastre uma nova filial no sistema"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={isEditing && branchId ? `/admin/branches/${branchId}` : "/admin/branches"}>
              <Button
                variant="secondary"
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
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

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
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
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
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
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
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
                    onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))}
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
                  onChange={(e) => setForm((p) => ({ ...p, stateRegistration: e.target.value }))}
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
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, zipCode: e.target.value },
                      }))
                    }
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
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, street: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4">
                <div className="col-span-1">
                  <FuturisticInput
                    label="Número"
                    value={form.address?.number}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, number: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="col-span-3">
                  <FuturisticInput
                    label="Complemento"
                    value={form.address?.complement}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        address: { ...p.address!, complement: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FuturisticInput
                  label="Bairro"
                  value={form.address?.neighborhood}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      address: { ...p.address!, neighborhood: e.target.value },
                    }))
                  }
                />
                <FuturisticInput
                  label="Cidade"
                  value={form.address?.city}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      address: { ...p.address!, city: e.target.value },
                    }))
                  }
                />
                <FuturisticInput
                  label="Estado (UF)"
                  value={form.address?.state}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      address: { ...p.address!, state: e.target.value.toUpperCase() },
                    }))
                  }
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
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contato@filial.com"
                />
                <FuturisticInput
                  label="Telefone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">
              {isEditing && branch && (
                <>
                  ID: <span className="font-mono">{branch.id}</span>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Filial"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


