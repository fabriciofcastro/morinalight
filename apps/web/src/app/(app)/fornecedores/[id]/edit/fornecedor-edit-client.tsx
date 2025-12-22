"use client";

import { Button } from "@morina/ui";
import {
  Building2,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  History,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notificationCenter } from "@/components/notifications/notification-center";
import { useSupplier } from "@/hooks/use-suppliers";
import type { UpdateSupplierInput } from "@/lib/api/suppliers";
import { motion } from "framer-motion";
import { useViaCep } from "@/hooks/use-viacep";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

// Helper para inputs futuristas (reutilizado do form de criação)
const FuturisticInput = ({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  ...props
}: {
  label: string;
  required?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="group relative">
      <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <input
          id={inputId}
          {...props}
          onFocus={() => {
            setShowTooltip(error && !!errorMessage);
          }}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
        />
        {error && errorMessage && (
          <div
            id={`${inputId}-error`}
            role="tooltip"
            className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${showTooltip ? "opacity-100 visible" : "opacity-0 invisible"} transition-opacity duration-200`}
            style={{ bottom: "100%", left: 0 }}
          >
            {errorMessage}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
          </div>
        )}
      </div>
    </div>
  );
};

const FuturisticSelect = ({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  children,
  ...props
}: {
  label: string;
  required?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="group relative">
      <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <select
          id={selectId}
          {...props}
          onFocus={() => setShowTooltip(error && !!errorMessage)}
          onBlur={() => setShowTooltip(false)}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${selectId}-error` : undefined}
        >
          {children}
        </select>
        {error && errorMessage && (
          <div
            id={`${selectId}-error`}
            role="tooltip"
            className={`absolute z-50 mt-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-lg ${showTooltip ? "opacity-100 visible" : "opacity-0 invisible"} transition-opacity duration-200`}
            style={{ bottom: "100%", left: 0 }}
          >
            {errorMessage}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600" />
          </div>
        )}
      </div>
    </div>
  );
};

const FuturisticTextarea = ({
  label,
  required = false,
  id,
  error = false,
  errorMessage,
  ...props
}: {
  label: string;
  required?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  return (
    <div className="group">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <textarea
          id={textareaId}
          {...props}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 resize-none`}
        />
      </div>
    </div>
  );
};

// Funções de validação e formatação (reutilizadas)
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
  // Validação simplificada - implementar completa se necessário
  return true;
};

const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/[^\d]/g, "");
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;
  // Validação simplificada - implementar completa se necessário
  return true;
};

const formatarCNPJ = (cnpj: string): string => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length <= 14) {
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
};

const formatarCPF = (cpf: string): string => {
  const cpfLimpo = cpf.replace(/[^\d]/g, "");
  if (cpfLimpo.length <= 11) {
    return cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return cpf;
};

const formatarCEP = (cep: string): string => {
  const cepLimpo = cep.replace(/[^\d]/g, "");
  if (cepLimpo.length <= 8) {
    return cepLimpo.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }
  return cep;
};

const formatarTelefone = (telefone: string): string => {
  const telLimpo = telefone.replace(/[^\d]/g, "");
  if (telLimpo.length <= 10) {
    return telLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (telLimpo.length <= 11) {
    return telLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return telefone;
};

const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface FornecedorEditClientProps {
  supplierId: string;
}

export function FornecedorEditClient({ supplierId }: FornecedorEditClientProps) {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [pending, startTransition] = useTransition();
  const { supplier, loading, error, buscarPorId, atualizar } = useSupplier(orgId);
  const [hasChanges, setHasChanges] = useState(false);
  const { buscar: buscarCep, loading: buscandoCep } = useViaCep();

  // Form data
  const [formData, setFormData] = useState<UpdateSupplierInput>({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    status: "ativo",
    notes: "",
    website: "",
    contatoPrincipal: "",
    cargoContato: "",
    ramoAtividade: "",
    tipoFornecedor: "",
    prazoPagamento: null,
    condicaoPagamento: "",
    limiteCredito: null,
  });

  // Estado para erros de validação
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  // Carregar dados do fornecedor
  useEffect(() => {
    if (supplierId) {
      void buscarPorId(supplierId);
    }
  }, [supplierId, buscarPorId]);

  // Preencher formulário quando supplier for carregado
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        document: supplier.document || "",
        address: supplier.address || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zipCode: supplier.zipCode || "",
        status: supplier.status || "ativo",
        notes: supplier.notes || "",
        website: supplier.website || "",
        contatoPrincipal: supplier.contatoPrincipal || "",
        cargoContato: supplier.cargoContato || "",
        ramoAtividade: supplier.ramoAtividade || "",
        tipoFornecedor: supplier.tipoFornecedor || "",
        prazoPagamento: supplier.prazoPagamento ?? null,
        condicaoPagamento: supplier.condicaoPagamento || "",
        limiteCredito: supplier.limiteCredito ?? null,
      });
      setHasChanges(false);
    }
  }, [supplier]);

  // Detectar mudanças
  useEffect(() => {
    if (supplier) {
      const hasChangesDetected =
        formData.name !== (supplier.name || "") ||
        formData.email !== (supplier.email || "") ||
        formData.phone !== (supplier.phone || "") ||
        formData.document !== (supplier.document || "") ||
        formData.address !== (supplier.address || "") ||
        formData.city !== (supplier.city || "") ||
        formData.state !== (supplier.state || "") ||
        formData.zipCode !== (supplier.zipCode || "") ||
        formData.status !== (supplier.status || "ativo") ||
        formData.notes !== (supplier.notes || "") ||
        formData.website !== (supplier.website || "") ||
        formData.contatoPrincipal !== (supplier.contatoPrincipal || "") ||
        formData.cargoContato !== (supplier.cargoContato || "") ||
        formData.ramoAtividade !== (supplier.ramoAtividade || "") ||
        formData.tipoFornecedor !== (supplier.tipoFornecedor || "") ||
        formData.prazoPagamento !== (supplier.prazoPagamento ?? null) ||
        formData.condicaoPagamento !== (supplier.condicaoPagamento || "") ||
        formData.limiteCredito !== (supplier.limiteCredito ?? null);

      setHasChanges(hasChangesDetected);
    }
  }, [formData, supplier]);

  // Validar formulário
  const validarFormulario = useCallback((): {
    valido: boolean;
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    if (!formData.name?.trim()) {
      erros.push("Nome do fornecedor é obrigatório");
      camposErro.name = "Nome do fornecedor é obrigatório";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.push("Email inválido");
      camposErro.email = "Email inválido";
    }

    if (formData.document) {
      const docLimpo = formData.document.replace(/[^\d]/g, "");
      if (docLimpo.length === 11) {
        if (!validarCPF(docLimpo)) {
          erros.push("CPF inválido");
          camposErro.document = "CPF inválido";
        }
      } else if (docLimpo.length === 14) {
        if (!validarCNPJ(docLimpo)) {
          erros.push("CNPJ inválido");
          camposErro.document = "CNPJ inválido";
        }
      } else if (docLimpo.length > 0) {
        erros.push("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)");
        camposErro.document = "Documento inválido";
      }
    }

    if (formData.zipCode) {
      const cepLimpo = formData.zipCode.replace(/[^\d]/g, "");
      if (cepLimpo.length !== 8) {
        erros.push("CEP deve ter 8 dígitos");
        camposErro.zipCode = "CEP inválido";
      }
    }

    if (formData.state && formData.state.length !== 2) {
      erros.push("Estado deve ter 2 caracteres (UF)");
      camposErro.state = "Estado inválido";
    }

    // Website válido (se preenchido)
    if (formData.website && formData.website.trim()) {
      const url = formData.website.trim();
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(url) && !url.startsWith("http://") && !url.startsWith("https://")) {
        erros.push("Website inválido. Use formato: exemplo.com ou https://exemplo.com");
        camposErro.website = "Website inválido";
      }
    }

    // Prazo de pagamento válido (se preenchido)
    if (formData.prazoPagamento !== null && formData.prazoPagamento !== undefined) {
      if (formData.prazoPagamento < 0 || formData.prazoPagamento > 365) {
        erros.push("Prazo de pagamento deve estar entre 0 e 365 dias");
        camposErro.prazoPagamento = "Prazo inválido";
      }
    }

    // Limite de crédito válido (se preenchido)
    if (formData.limiteCredito !== null && formData.limiteCredito !== undefined) {
      if (formData.limiteCredito < 0) {
        erros.push("Limite de crédito não pode ser negativo");
        camposErro.limiteCredito = "Limite inválido";
      }
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData]);

  // Salvar fornecedor
  const salvarFornecedor = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      setErrosValidacao(validacao.camposErro);
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: validacao.erros.length === 1
          ? validacao.erros[0]
          : `${validacao.erros.length} erros encontrados: ${validacao.erros.slice(0, 3).join(", ")}${validacao.erros.length > 3 ? "..." : ""}`,
      });
      return;
    }

    startTransition(async () => {
      try {
        await atualizar(supplierId, {
          name: formData.name?.trim() || undefined,
          email: formData.email?.trim() || null,
          phone: formData.phone?.trim() || null,
          document: formData.document?.trim() || null,
          address: formData.address?.trim() || null,
          city: formData.city?.trim() || null,
          state: formData.state?.trim().toUpperCase() || null,
          zipCode: formData.zipCode?.trim() || null,
          status: formData.status || "ativo",
          notes: formData.notes?.trim() || null,
          website: formData.website?.trim() || null,
          contatoPrincipal: formData.contatoPrincipal?.trim() || null,
          cargoContato: formData.cargoContato?.trim() || null,
          ramoAtividade: formData.ramoAtividade?.trim() || null,
          tipoFornecedor: formData.tipoFornecedor?.trim() || null,
          prazoPagamento: formData.prazoPagamento ?? null,
          condicaoPagamento: formData.condicaoPagamento?.trim() || null,
          limiteCredito: formData.limiteCredito ?? null,
        });

        notificationCenter.add({
          type: "success",
          title: "Fornecedor atualizado com sucesso",
          message: `${formData.name} foi atualizado com sucesso.`,
        });

        setHasChanges(false);
        router.push(`/fornecedores/${supplierId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atualizar fornecedor";

        console.error("Erro ao atualizar fornecedor:", error);

        notificationCenter.add({
          type: "error",
          title: "Erro ao atualizar fornecedor",
          message: errorMessage,
        });
      }
    });
  };

  // Validar em tempo real
  useEffect(() => {
    const validacao = validarFormulario();
    setErrosValidacao(validacao.camposErro);
  }, [formData, validarFormulario]);

  const formularioValido = validarFormulario().valido;

  if (loading && !supplier) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Carregando fornecedor...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="p-12 text-center rounded-xl border border-red-500/20 bg-red-500/10">
          <p className="text-red-400 mb-4">{error || "Fornecedor não encontrado"}</p>
          <Button
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
            onClick={() => router.push("/fornecedores/list")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

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
                  Editar Fornecedor
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  {supplier.name}
                </p>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Você tem alterações não salvas</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Formulário Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl"
      >
        {/* DADOS BÁSICOS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[hsl(var(--primary))]" />
            Dados Básicos
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <FuturisticInput
              label="Nome do Fornecedor"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Razão Social ou Nome Completo"
              error={!!errosValidacao.name}
              errorMessage={errosValidacao.name}
            />
            <div className="group relative">
              <label htmlFor="document-input" className="block text-sm font-semibold text-white/90 mb-2">
                CPF/CNPJ
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  id="document-input"
                  type="text"
                  value={formData.document || ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d]/g, "");
                    let formatado = "";
                    if (valor.length <= 11) {
                      formatado = formatarCPF(valor);
                    } else {
                      formatado = formatarCNPJ(valor);
                    }
                    setFormData((prev) => ({ ...prev, document: formatado }));
                  }}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className={`relative flex-1 px-4 py-3 rounded-lg border ${errosValidacao.document ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                  maxLength={18}
                />
              </div>
              {errosValidacao.document && (
                <p className="mt-1 text-sm text-red-400">{errosValidacao.document}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FuturisticInput
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              error={!!errosValidacao.email}
              errorMessage={errosValidacao.email}
            />
            <FuturisticInput
              label="Telefone"
              value={formData.phone || ""}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^\d]/g, "");
                const formatado = formatarTelefone(valor);
                setFormData((prev) => ({ ...prev, phone: formatado }));
              }}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[hsl(var(--accent))]" />
            Endereço
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <FuturisticInput
              label="Endereço Completo"
              value={formData.address || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <FuturisticInput
              label="Cidade"
              value={formData.city || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="Cidade"
            />
            <FuturisticInput
              label="Estado (UF)"
              value={formData.state || ""}
              onChange={(e) => {
                const valor = e.target.value.toUpperCase().slice(0, 2);
                setFormData((prev) => ({ ...prev, state: valor }));
              }}
              placeholder="SP"
              maxLength={2}
              error={!!errosValidacao.state}
              errorMessage={errosValidacao.state}
            />
            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                CEP {errosValidacao.zipCode && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={formData.zipCode || ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
                    const formatado = formatarCEP(valor);
                    setFormData((prev) => ({ ...prev, zipCode: formatado }));
                  }}
                  onBlur={async () => {
                    const cepLimpo = formData.zipCode?.replace(/\D/g, "");
                    if (cepLimpo && cepLimpo.length === 8) {
                      const resultado = await buscarCep(cepLimpo);
                      if (resultado) {
                        setFormData((prev) => ({
                          ...prev,
                          address: resultado.logradouro || prev.address,
                          city: resultado.cidade || prev.city,
                          state: resultado.estado || prev.state,
                          zipCode: resultado.cep || prev.zipCode,
                        }));
                        notificationCenter.add({
                          type: "success",
                          title: "CEP encontrado",
                          message: "Endereço preenchido automaticamente",
                        });
                      }
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`relative w-full px-4 py-3 rounded-lg border ${errosValidacao.zipCode ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                />
                {buscandoCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </div>
                )}
              </div>
              {errosValidacao.zipCode && (
                <p className="mt-1 text-sm text-red-400">{errosValidacao.zipCode}</p>
              )}
            </div>
            <FuturisticSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="ativo" className="bg-[#1a1f3a]">Ativo</option>
              <option value="inativo" className="bg-[#1a1f3a]">Inativo</option>
              <option value="suspenso" className="bg-[#1a1f3a]">Suspenso</option>
            </FuturisticSelect>
          </div>
        </div>

        {/* INFORMAÇÕES COMERCIAIS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[hsl(var(--accent))]" />
            Informações Comerciais
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <FuturisticInput
              label="Website"
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://www.exemplo.com"
            />
            <FuturisticSelect
              label="Tipo de Fornecedor"
              value={formData.tipoFornecedor || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, tipoFornecedor: e.target.value }))}
            >
              <option value="" className="bg-[#1a1f3a]">Selecione...</option>
              <option value="matéria-prima" className="bg-[#1a1f3a]">Matéria-Prima</option>
              <option value="serviço" className="bg-[#1a1f3a]">Serviço</option>
              <option value="equipamento" className="bg-[#1a1f3a]">Equipamento</option>
              <option value="mão-de-obra" className="bg-[#1a1f3a]">Mão de Obra</option>
              <option value="outros" className="bg-[#1a1f3a]">Outros</option>
            </FuturisticSelect>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FuturisticInput
              label="Ramo de Atividade"
              value={formData.ramoAtividade || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, ramoAtividade: e.target.value }))}
              placeholder="Ex: Têxtil, Eletrônicos, Alimentício..."
            />
            <FuturisticInput
              label="Contato Principal"
              value={formData.contatoPrincipal || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, contatoPrincipal: e.target.value }))}
              placeholder="Nome do contato principal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FuturisticInput
              label="Cargo do Contato"
              value={formData.cargoContato || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, cargoContato: e.target.value }))}
              placeholder="Ex: Gerente, Diretor..."
            />
            <FuturisticInput
              label="Prazo de Pagamento (dias)"
              type="number"
              value={formData.prazoPagamento?.toString() || ""}
              onChange={(e) => {
                const valor = e.target.value ? parseInt(e.target.value, 10) : null;
                setFormData((prev) => ({ ...prev, prazoPagamento: valor }));
              }}
              placeholder="30"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FuturisticInput
              label="Condição de Pagamento"
              value={formData.condicaoPagamento || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, condicaoPagamento: e.target.value }))}
              placeholder="Ex: À vista, 30 dias, 60 dias..."
            />
            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Limite de Crédito
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={formData.limiteCredito ? formatCurrency(formData.limiteCredito) : ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                    const numero = valor ? parseFloat(valor) : null;
                    setFormData((prev) => ({ ...prev, limiteCredito: numero }));
                  }}
                  placeholder="R$ 0,00"
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="mb-8">
          <FuturisticTextarea
            label="Observações"
            rows={6}
            value={formData.notes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Informações adicionais sobre o fornecedor..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center gap-3 pt-6 border-t border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white backdrop-blur-sm cursor-pointer"
              onClick={() => {
                if (hasChanges) {
                  if (confirm("Você tem alterações não salvas. Deseja realmente cancelar?")) {
                    router.push(`/fornecedores/${supplierId}`);
                  }
                } else {
                  router.push(`/fornecedores/${supplierId}`);
                }
              }}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </motion.div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => router.push(`/fornecedores/${supplierId}`)}
                type="button"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                className={`bg-gradient-to-r from-[hsl(var(--primary)/0.85)] to-[hsl(var(--accent)/0.85)] hover:from-[hsl(var(--primary)/0.95)] hover:to-[hsl(var(--accent)/0.95)] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${pending ? "opacity-50 cursor-wait" : ""}`}
                onClick={salvarFornecedor}
                disabled={!formularioValido || pending || !hasChanges}
                type="button"
                title={!formularioValido ? "Preencha todos os campos obrigatórios" : !hasChanges ? "Nenhuma alteração para salvar" : "Salvar alterações"}
              >
                {pending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

