"use client";

import { notificationCenter } from "@/components/notifications/notification-center";
import { useCnpj } from "@/hooks/use-cnpj";
import { suppliersApi } from "@/lib/api/suppliers";
import { Button } from "@morina/ui";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Barcode,
  Building2,
  DollarSign,
  FileText,
  Package,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, useTransition } from "react";

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
        return orgs[0]!.organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }
  return null;
}

// Helper para inputs futuristas
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
} & React.ComponentPropsWithoutRef<"input">) => {
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
          {...(props as any)}
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
} & React.ComponentPropsWithoutRef<"select">) => {
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
          {...(props as any)}
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
} & React.ComponentPropsWithoutRef<"textarea">) => {
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
          {...(props as any)}
          className={`relative w-full px-4 py-3 rounded-lg border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/50 transition-all duration-300 resize-none`}
        />
      </div>
    </div>
  );
};

// Função para validar CNPJ
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length !== 14) return false;
  
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
  
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === Number(digitos.charAt(1));
};

// Função para formatar CNPJ
const formatarCNPJ = (cnpj: string): string => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  if (cnpjLimpo.length <= 14) {
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
};

// Função para formatar moeda
const formatCurrency = (value: number | null | undefined): string => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

type TipoInsumo = "aviamento" | "servico" | "terceirizacao" | "outros";

type UnidadeMedida = "unidade" | "metro" | "kg" | "litro" | "cm" | "grosa" | "jarda" | "milheiro";

interface InsumoFormData {
  descricao: string;
  categoria: TipoInsumo;
  codigoBarras: string;
  precoUnitario: number;
  precoTotal: number;
  fornecedorId?: string;
  fornecedorNome?: string;
  unidadeMedida: UnidadeMedida;
  quantidade: number;
  observacoes?: string;
}

export function InsumoFormClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [pending, startTransition] = useTransition();
  const { buscar: buscarCnpj, loading: buscandoCNPJ } = useCnpj();

  const [formData, setFormData] = useState<InsumoFormData>({
    descricao: "",
    categoria: "aviamento",
    codigoBarras: "",
    precoUnitario: 0,
    precoTotal: 0,
    fornecedorId: undefined,
    fornecedorNome: "",
    unidadeMedida: "unidade",
    quantidade: 1,
    observacoes: "",
  });

  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  // Calcular preço total quando quantidade ou preço unitário mudar
  useEffect(() => {
    const total = formData.precoUnitario * formData.quantidade;
    setFormData((prev) => ({ ...prev, precoTotal: total }));
  }, [formData.precoUnitario, formData.quantidade]);

  // Buscar fornecedor por CNPJ
  const buscarFornecedorPorCNPJ = useCallback(async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpjLimpo)) {
      return;
    }

    try {
      const response = await suppliersApi.list(orgId, { documento: cnpjLimpo });
      if (response?.itens && response.itens.length > 0) {
        const supplier = response.itens![0];
        if (!supplier) return;
        setFormData((prev) => ({
          ...prev,
          fornecedorId: supplier.id,
          fornecedorNome: supplier.name,
        }));
        notificationCenter.add({
          type: "success",
          title: "Fornecedor encontrado",
          message: `${supplier.name} foi selecionado.`,
        });
        return;
      }

      const resultado = await buscarCnpj(cnpj);
      if (resultado) {
        const nomeFornecedor = resultado.nomeFantasia || resultado.razaoSocial;
        setFormData((prev) => ({
          ...prev,
          fornecedorNome: nomeFornecedor,
        }));
        notificationCenter.add({
          type: "info",
          title: "CNPJ encontrado na SEFAZ",
          message: `Dados encontrados: ${nomeFornecedor}. Você pode criar o fornecedor clicando no botão "+".`,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedor por CNPJ:", error);
    }
  }, [orgId, buscarCnpj]);

  // Validar formulário
  const validarFormulario = useCallback((): { 
    valido: boolean; 
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      erros.push("Descrição do insumo é obrigatória");
      camposErro.descricao = "Descrição é obrigatória";
    }

    if (formData.precoUnitario <= 0) {
      erros.push("Preço unitário deve ser maior que zero");
      camposErro.precoUnitario = "Preço unitário inválido";
    }

    if (formData.quantidade <= 0) {
      erros.push("Quantidade deve ser maior que zero");
      camposErro.quantidade = "Quantidade inválida";
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData]);

  // Salvar insumo
  const salvarInsumo = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      setErrosValidacao(validacao.camposErro);
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: validacao.erros.length === 1 
          ? validacao.erros[0] || "" 
          : `${validacao.erros.length} erros encontrados: ${validacao.erros.slice(0, 3).join(", ")}${validacao.erros.length > 3 ? "..." : ""}`,
      });
      return;
    }

    startTransition(async () => {
      try {
        // TODO: Implementar API de criação de insumo
        notificationCenter.add({
          type: "success",
          title: "Insumo cadastrado",
          message: "O insumo foi cadastrado com sucesso.",
        });
        router.push("/insumos");
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Erro desconhecido ao salvar insumo";
        
        console.error("Erro ao salvar insumo:", error);
        
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar insumo",
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
          {/* Tech corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Package className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Cadastro de Insumo
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Completo de Gestão de Insumos e Aviamentos
                </p>
              </div>
            </div>
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
              label="Descrição do Insumo"
              required
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Zíper 20cm, Botão 4 furos, Linha 100% algodão"
              error={!!errosValidacao.descricao}
              errorMessage={errosValidacao.descricao}
            />
            <FuturisticSelect
              label="Categoria"
              required
              value={formData.categoria}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value as TipoInsumo }))}
            >
              <option value="aviamento" className="bg-[#1a1f3a]">Aviamento</option>
              <option value="servico" className="bg-[#1a1f3a]">Serviço</option>
              <option value="terceirizacao" className="bg-[#1a1f3a]">Terceirização</option>
              <option value="outros" className="bg-[#1a1f3a]">Outros</option>
            </FuturisticSelect>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="group relative">
              <label htmlFor="codigoBarras-input" className="block text-sm font-semibold text-white/90 mb-2">
                Código de Barras
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center">
                  <Barcode className="absolute left-4 h-5 w-5 text-white/60 z-10" />
                  <input
                    id="codigoBarras-input"
                    type="text"
                    value={formData.codigoBarras}
                    onChange={(e) => setFormData((prev) => ({ ...prev, codigoBarras: e.target.value }))}
                    placeholder="7891234567890"
                    className="relative w-full pl-12 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
            <FuturisticSelect
              label="Unidade de Medida"
              value={formData.unidadeMedida}
              onChange={(e) => setFormData((prev) => ({ ...prev, unidadeMedida: e.target.value as UnidadeMedida }))}
            >
              <option value="unidade" className="bg-[#1a1f3a]">Unidade</option>
              <option value="metro" className="bg-[#1a1f3a]">Metro</option>
              <option value="kg" className="bg-[#1a1f3a]">Quilograma (kg)</option>
              <option value="litro" className="bg-[#1a1f3a]">Litro</option>
              <option value="cm" className="bg-[#1a1f3a]">Centímetro (cm)</option>
              <option value="grosa" className="bg-[#1a1f3a]">Grosa</option>
              <option value="jarda" className="bg-[#1a1f3a]">Jarda</option>
              <option value="milheiro" className="bg-[#1a1f3a]">Milheiro</option>
            </FuturisticSelect>
          </div>
        </div>

        {/* FORNECEDOR */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[hsl(var(--accent))]" />
            Fornecedor
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="group relative">
              <label htmlFor="fornecedor-input" className="block text-sm font-semibold text-white/90 mb-2">
                Fornecedor
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <div className="relative flex items-center gap-2">
                  <Search className="absolute left-4 h-4 w-4 text-white/60 z-10" />
                  <input
                    id="fornecedor-input"
                    type="text"
                    value={formData.fornecedorNome || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const docLimpo = valor.replace(/[^\d]/g, "");
                      let formatado = valor;
                      if (docLimpo.length <= 14 && docLimpo.length > 0) {
                        formatado = formatarCNPJ(docLimpo);
                      }
                      setFormData((prev) => ({ ...prev, fornecedorNome: formatado }));
                    }}
                    onBlur={(e) => {
                      const docLimpo = e.target.value.replace(/[^\d]/g, "");
                      if (docLimpo.length === 14) {
                        void buscarFornecedorPorCNPJ(docLimpo);
                      }
                    }}
                    placeholder="Nome do fornecedor ou CNPJ (00.000.000/0000-00)"
                    className="relative flex-1 pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300"
                    maxLength={18}
                  />
                  {buscandoCNPJ && (
                    <div className="absolute right-4 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                  )}
                  {formData.fornecedorNome && !buscandoCNPJ && (formData.fornecedorNome.replace(/[^\d]/g, "").length === 14) && (
                    <button
                      type="button"
                      onClick={() => {
                        const docLimpo = formData.fornecedorNome?.replace(/[^\d]/g, "") || "";
                        if (docLimpo.length === 14) {
                          void buscarFornecedorPorCNPJ(docLimpo);
                        }
                      }}
                      className="absolute right-4 text-blue-400 hover:text-blue-300"
                      title="Buscar dados do CNPJ"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const fornecedorNome = formData.fornecedorNome || "";
                      const fornecedorDoc = fornecedorNome.replace(/[^\d]/g, "").length === 14 ? fornecedorNome : "";
                      const url = `/fornecedores/new${fornecedorNome ? `?nome=${encodeURIComponent(fornecedorNome)}${fornecedorDoc ? `&documento=${encodeURIComponent(fornecedorDoc)}` : ""}` : ""}`;
                      window.open(url, "_blank");
                    }}
                    className="px-3 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm transition-all flex items-center justify-center"
                    type="button"
                    title="Como cadastrar um novo fornecedor"
                    aria-label="Cadastrar novo fornecedor"
                  >
                    <Plus className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VALORES */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[hsl(var(--accent))]" />
            Valores
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <FuturisticInput
              label="Quantidade"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantidade.toString()}
              onChange={(e) => {
                const valor = parseFloat(e.target.value) || 0;
                setFormData((prev) => ({ ...prev, quantidade: valor }));
              }}
              placeholder="1"
              error={!!errosValidacao.quantidade}
              errorMessage={errosValidacao.quantidade}
            />
            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Preço Unitário <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={formData.precoUnitario ? formatCurrency(formData.precoUnitario) : ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                    const numero = valor ? parseFloat(valor) : 0;
                    setFormData((prev) => ({ ...prev, precoUnitario: numero }));
                  }}
                  placeholder="R$ 0,00"
                  className={`relative w-full px-4 py-3 rounded-lg border ${errosValidacao.precoUnitario ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
                />
              </div>
              {errosValidacao.precoUnitario && (
                <p className="mt-1 text-sm text-red-400">{errosValidacao.precoUnitario}</p>
              )}
            </div>
            <div className="group relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Preço Total
              </label>
              <div className="relative">
                <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                <input
                  type="text"
                  value={formatCurrency(formData.precoTotal)}
                  readOnly
                  className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 opacity-75 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-white/50">Calculado automaticamente</p>
            </div>
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="mb-8">
          <FuturisticTextarea
            label="Observações"
            rows={6}
            value={formData.observacoes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Informações adicionais sobre o insumo..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center gap-3 pt-6 border-t border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white backdrop-blur-sm cursor-pointer"
              onClick={() => router.push("/insumos")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar e Voltar
            </Button>
          </motion.div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={() => {
                  setFormData({
                    descricao: "",
                    categoria: "aviamento",
                    codigoBarras: "",
                    precoUnitario: 0,
                    precoTotal: 0,
                    fornecedorId: undefined,
                    fornecedorNome: "",
                    unidadeMedida: "unidade",
                    quantidade: 1,
                    observacoes: "",
                  });
                  setErrosValidacao({});
                }}
                type="button"
              >
                Limpar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                className={`bg-gradient-to-r from-[hsl(var(--primary)/0.85)] to-[hsl(var(--accent)/0.85)] hover:from-[hsl(var(--primary)/0.95)] hover:to-[hsl(var(--accent)/0.95)] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${pending ? "opacity-50 cursor-wait" : ""}`}
                onClick={salvarInsumo}
                disabled={!formularioValido || pending}
                type="button"
                title={!formularioValido ? "Preencha todos os campos obrigatórios" : "Salvar insumo"}
              >
                {pending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Insumo
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
