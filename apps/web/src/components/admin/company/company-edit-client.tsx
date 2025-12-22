"use client";

import { Button, cn } from "@morina/ui";
import {
  Building2,
  Save,
  FileText,
  MapPin,
  CreditCard,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Shield,
  XCircle,
  AlertTriangle,
  Plug,
  Palette,
  Lock,
  Webhook,
  Upload,
  Percent,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { notificationCenter } from "@/components/notifications/notification-center";
import { motion } from "framer-motion";
import { buscarCnpj, formatarCnpj, validarCnpj } from "@/lib/integrations/cnpj";
import { buscarEnderecoPorCep, formatarCep } from "@/lib/integrations/viacep";
import { companySettingsAPI } from "@/lib/api/company-settings";
import { CompanyAnimatedBackground } from "@/components/animations/company-animated-background";

// ============================================================================
// COMPONENTES FUTURISTAS (SEM ARREDONDAMENTO - DESIGN SYSTEM QUADRADO)
// ============================================================================

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

  return (
    <div className="group relative">
      <label htmlFor={inputId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <input
          id={inputId}
          {...props}
          className={`relative w-full px-4 py-3 border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300`}
          aria-invalid={error}
        />
        {error && errorMessage && (
          <div className="text-xs text-red-400 mt-1">{errorMessage}</div>
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

  return (
    <div className="group relative">
      <label htmlFor={selectId} className="block text-sm font-semibold text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <select
          id={selectId}
          {...props}
          className={`relative w-full px-4 py-3 border ${error ? "border-red-500 border-2" : "border-white/20"} bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer`}
        >
          {children}
        </select>
        {error && errorMessage && (
          <div className="text-xs text-red-400 mt-1">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

// Circular Progress (para stats)
function CircularProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// Tech Corner Component (QUADRADO - sem arredondamento)
const TechCorner = ({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) => {
  const classes = {
    "top-left": "top-0 left-0 border-t-2 border-l-2",
    "top-right": "top-0 right-0 border-t-2 border-r-2",
    "bottom-left": "bottom-0 left-0 border-b-2 border-l-2",
    "bottom-right": "bottom-0 right-0 border-b-2 border-r-2",
  };

  return <div className={`absolute w-6 h-6 border-[hsl(var(--primary)/0.6)] ${classes[position]}`} />;
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COMPANY = {
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
  companySize: "EPP",
  foundedAt: "2020-01-15",

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
    darkMode: false,
  },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CompanyEditClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formData, setFormData] = useState<any>(MOCK_COMPANY);
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Carregar dados
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setCarregando(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = await companySettingsAPI.getSettings();
        setFormData(data);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setCarregando(false);
      }
    };

    loadSettings();
  }, []);

  // Calcular progresso do formulário
  const calcularProgresso = useCallback(() => {
    const camposObrigatorios = ['name', 'legalName', 'cnpj', 'email'];
    const camposPreenchidos = camposObrigatorios.filter(campo => formData[campo]?.trim()).length;
    return (camposPreenchidos / camposObrigatorios.length) * 100;
  }, [formData]);

  // Validar formulário
  const validarFormulario = useCallback((): {
    valido: boolean;
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    if (!formData.name?.trim()) {
      erros.push("Nome fantasia é obrigatório");
      camposErro.name = "Nome fantasia é obrigatório";
    }

    if (!formData.legalName?.trim()) {
      erros.push("Razão social é obrigatória");
      camposErro.legalName = "Razão social é obrigatória";
    }

    if (formData.cnpj && !validarCnpj(formData.cnpj)) {
      erros.push("CNPJ inválido");
      camposErro.cnpj = "CNPJ inválido";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.push("Email inválido");
      camposErro.email = "Email inválido";
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData]);

  // Buscar CNPJ
  const buscarPorCNPJ = useCallback(async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    if (cnpjLimpo.length !== 14 || !validarCnpj(cnpjLimpo)) return;

    setBuscandoCNPJ(true);
    try {
      const resultado = await buscarCnpj(cnpj);
      if (resultado) {
        setFormData((prev: any) => ({
          ...prev,
          legalName: resultado.razaoSocial || prev.legalName,
          name: resultado.nomeFantasia || resultado.razaoSocial || prev.name,
          address: {
            ...prev.address,
            street: resultado.endereco.logradouro || prev.address?.street,
            number: resultado.endereco.numero || prev.address?.number,
            complement: resultado.endereco.complemento || prev.address?.complement,
            neighborhood: resultado.endereco.bairro || prev.address?.neighborhood,
            city: resultado.endereco.cidade || prev.address?.city,
            state: resultado.endereco.estado || prev.address?.state,
            zipCode: resultado.endereco.cep || prev.address?.zipCode,
          },
          phone: resultado.telefone || prev.phone,
        }));

        notificationCenter.add({
          type: "success",
          title: "Dados importados",
          message: "Informações da Receita Federal carregadas!",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
    } finally {
      setBuscandoCNPJ(false);
    }
  }, []);

  // Buscar CEP
  const buscarPorCep = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/[^\d]/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resultado = await buscarEnderecoPorCep(cepLimpo);
      if (resultado) {
        setFormData((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            street: resultado.logradouro || prev.address?.street,
            neighborhood: resultado.bairro || prev.address?.neighborhood,
            city: resultado.cidade || prev.address?.city,
            state: resultado.estado || prev.address?.state,
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  }, []);

  // Limpar formulário
  const handleLimpar = () => {
    if (confirm("Deseja realmente limpar todos os campos?")) {
      setFormData(MOCK_COMPANY);
      notificationCenter.add({
        type: "info",
        title: "Formulário limpo",
        message: "Todos os campos foram resetados para valores padrão."
      });
    }
  };

  // Salvar
  const salvarConfiguracoes = async () => {
    const validacao = validarFormulario();
    if (!validacao.valido) {
      setErrosValidacao(validacao.camposErro);
      notificationCenter.add({
        type: "error",
        title: "Erro de validação",
        message: validacao.erros.length === 1
          ? validacao.erros[0]
          : `${validacao.erros.length} erros encontrados`,
      });
      return;
    }

    startTransition(async () => {
      try {
        await companySettingsAPI.updateSettings(formData);

        notificationCenter.add({
          type: "success",
          title: "Configurações salvas",
          message: "As configurações da empresa foram atualizadas.",
        });

        setTimeout(() => {
          router.push("/admin/company");
        }, 1000);
      } catch (error) {
        console.error("Erro ao salvar:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar",
          message: "Ocorreu um erro ao salvar as configurações.",
        });
      }
    });
  };

  useEffect(() => {
    const validacao = validarFormulario();
    setErrosValidacao(validacao.camposErro);
  }, [formData, validarFormulario]);

  const formularioValido = validarFormulario().valido;
  const progresso = calcularProgresso();

  if (carregando) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="space-y-8">
          <div className="h-32 bg-white/5 animate-pulse" />
          <div className="h-96 bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-6 space-y-8">

      {/* Header Sofisticado */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8 group"
      >
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-[hsl(var(--primary)/0.2)] via-[hsl(var(--accent)/0.15)] to-[hsl(var(--primary)/0.2)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />

        <div className="relative p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <TechCorner position="top-left" />
          <TechCorner position="top-right" />
          <TechCorner position="bottom-left" />
          <TechCorner position="bottom-right" />

          <div className="relative z-10 space-y-4">
            {/* Título */}
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-lg shadow-[hsl(var(--primary))]/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
                  Dados da Empresa
                </motion.h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Completo de Gestão Empresarial
                </p>
              </div>
            </div>

            {/* Stats com Circular Progress */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative p-4 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider">Progresso</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{progresso.toFixed(0)}%</p>
                    <div className="flex items-center gap-1 text-xs text-blue-400/60">
                      <TrendingUp className="h-3 w-3" />
                      <span>Preenchimento</span>
                    </div>
                  </div>
                  <CircularProgress value={progresso} max={100} color="#60a5fa" size={60} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group relative p-4 border border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-green-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-semibold text-green-400/70 uppercase tracking-wider">Status</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{formularioValido ? "Válido" : "Pendente"}</p>
                    <div className="flex items-center gap-1 text-xs text-green-400/60">
                      <span>Formulário</span>
                    </div>
                  </div>
                  {formularioValido ? (
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-12 w-12 text-yellow-400" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="group relative p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-sm overflow-hidden hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400/70 uppercase tracking-wider">Ambiente</span>
                    </div>
                    <p className="text-xl font-bold text-purple-400">{formData.fiscal?.nfeEnvironment || "N/A"}</p>
                    <div className="flex items-center gap-1 text-xs text-purple-400/60">
                      <span>NFe</span>
                    </div>
                  </div>
                  <Shield className="h-12 w-12 text-purple-400" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="sticky top-4 z-30 mb-8">
        <motion.div
          layout
          className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-lg flex flex-wrap gap-2"
        >
          {[
            { id: "general", label: "Dados Básicos", icon: Building2 },
            { id: "address", label: "Endereço", icon: MapPin },
            { id: "fiscal", label: "Fiscal & Tributação", icon: CreditCard },
            { id: "certificate", label: "Certificação Digital", icon: Shield },
            { id: "integrations", label: "Integrações", icon: Plug },
            { id: "branding", label: "Temas & Branding", icon: Palette },
            { id: "security", label: "Segurança & Backup", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden",
                  isActive
                    ? "text-white bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-8"
      >
        {/* SEÇÃO: DADOS BÁSICOS */}
        <div className={cn("relative p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl", activeTab !== "general" && "hidden")}>
          <TechCorner position="top-left" />
          <TechCorner position="top-right" />

          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[hsl(var(--primary))]" />
            Dados Básicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FuturisticInput
              label="Nome Fantasia"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!errosValidacao.name}
              errorMessage={errosValidacao.name}
              placeholder="Nome da sua empresa"
            />

            <FuturisticInput
              label="Razão Social"
              required
              value={formData.legalName || ""}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              error={!!errosValidacao.legalName}
              errorMessage={errosValidacao.legalName}
              placeholder="Razão social completa"
            />

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FuturisticInput
                  label="CNPJ"
                  value={formData.cnpj || ""}
                  onChange={(e) => {
                    const formatted = formatarCnpj(e.target.value);
                    setFormData({ ...formData, cnpj: formatted });
                    if (formatted.replace(/[^\d]/g, "").length === 14) {
                      buscarPorCNPJ(formatted);
                    }
                  }}
                  error={!!errosValidacao.cnpj}
                  errorMessage={errosValidacao.cnpj}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              {buscandoCNPJ && <Loader2 className="mb-4 h-6 w-6 animate-spin text-white/50" />}
            </div>

            <FuturisticSelect
              label="Porte da Empresa"
              value={formData.companySize || ""}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            >
              <option value="" className="bg-[#09090b]">Selecione...</option>
              <option value="MEI" className="bg-[#09090b]">MEI</option>
              <option value="ME" className="bg-[#09090b]">Microempresa (ME)</option>
              <option value="EPP" className="bg-[#09090b]">Empresa de Pequeno Porte (EPP)</option>
              <option value="MEDIO" className="bg-[#09090b]">Médio Porte</option>
              <option value="GRANDE" className="bg-[#09090b]">Grande Porte</option>
            </FuturisticSelect>

            <FuturisticInput
              label="Email Comercial"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errosValidacao.email}
              errorMessage={errosValidacao.email}
              placeholder="contato@empresa.com"
            />

            <FuturisticInput
              label="Telefone Principal"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {/* SEÇÃO: ENDEREÇO */}
        <div className={cn("relative p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl", activeTab !== "address" && "hidden")}>
          <TechCorner position="top-left" />
          <TechCorner position="top-right" />

          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[hsl(var(--accent))]" />
            Endereço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FuturisticInput
                  label="CEP"
                  value={formData.address?.zipCode || ""}
                  onChange={(e) => {
                    const formatted = formatarCep(e.target.value);
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: formatted }
                    });
                    if (formatted.replace(/[^\d]/g, "").length === 8) {
                      buscarPorCep(formatted);
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              {buscandoCep && <Loader2 className="mb-4 h-6 w-6 animate-spin text-white/50" />}
            </div>

            <FuturisticInput
              label="Logradouro"
              value={formData.address?.street || ""}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              placeholder="Rua, Avenida..."
            />

            <FuturisticInput
              label="Número"
              value={formData.address?.number || ""}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, number: e.target.value }
              })}
              placeholder="123"
            />

            <FuturisticInput
              label="Bairro"
              value={formData.address?.neighborhood || ""}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, neighborhood: e.target.value }
              })}
              placeholder="Centro"
            />

            <FuturisticInput
              label="Cidade"
              value={formData.address?.city || ""}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="São Paulo"
            />

            <FuturisticInput
              label="UF"
              value={formData.address?.state || ""}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value.toUpperCase() }
              })}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>

        {/* SEÇÃO: FISCAL */}
        <div className={cn("relative p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl", activeTab !== "fiscal" && "hidden")}>
          <TechCorner position="top-left" />
          <TechCorner position="top-right" />

          <h2 className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[hsl(var(--primary))]" />
            Informações Fiscais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FuturisticSelect
              label="Regime Tributário"
              value={formData.fiscal?.taxRegime || ""}
              onChange={(e) => setFormData({
                ...formData,
                fiscal: { ...formData.fiscal, taxRegime: e.target.value }
              })}
            >
              <option value="" className="bg-[#09090b]">Selecione...</option>
              <option value="SIMPLES" className="bg-[#09090b]">Simples Nacional</option>
              <option value="PRESUMIDO" className="bg-[#09090b]">Lucro Presumido</option>
              <option value="REAL" className="bg-[#09090b]">Lucro Real</option>
            </FuturisticSelect>

            <FuturisticSelect
              label="Ambiente NFe"
              value={formData.fiscal?.nfeEnvironment || ""}
              onChange={(e) => setFormData({
                ...formData,
                fiscal: { ...formData.fiscal, nfeEnvironment: e.target.value }
              })}
            >
              <option value="" className="bg-[#09090b]">Selecione...</option>
              <option value="PRODUCAO" className="bg-[#09090b]">Produção</option>
              <option value="HOMOLOGACAO" className="bg-[#09090b]">Homologação</option>
            </FuturisticSelect>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center gap-3 pt-6 border-t border-white/10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white backdrop-blur-sm cursor-pointer"
              onClick={() => router.push("/admin/company")}
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
                onClick={handleLimpar}
                type="button"
              >
                Limpar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                className={`bg-gradient-to-r from-[hsl(var(--primary)/0.85)] to-[hsl(var(--accent)/0.85)] hover:from-[hsl(var(--primary)/0.95)] hover:to-[hsl(var(--accent)/0.95)] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${pending ? "opacity-50 cursor-wait" : ""}`}
                onClick={salvarConfiguracoes}
                disabled={!formularioValido || pending}
                type="button"
                title={!formularioValido ? "Preencha todos os campos obrigatórios" : "Salvar configurações"}
              >
                {pending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
