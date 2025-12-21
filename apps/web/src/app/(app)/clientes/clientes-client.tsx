"use client";

import { Button, FormField, FormSelect, FormTextarea, GlassCard, Input } from "@morina/ui";
import {
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  XCircle,
  LayoutGrid,
  List,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Copy,
  AlertCircle,
  History,
  UserPlus,
  FileDown,
  CheckSquare,
  Square,
  Trash2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  BarChart3,
  Loader2,
  Tag,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { ClienteDetailModal } from "./cliente-detail-modal";
import { ClienteFormWizard } from "@/components/clientes/cliente-form-wizard";
import { buscarCnpj } from "@/lib/integrations/cnpj";
import { buscarEnderecoPorCep } from "@/lib/integrations/viacep";
import { triggerConfetti } from "@/lib/utils/confetti";
import { InlineEditField } from "@/components/clientes/inline-edit-field";
import { useDocumentExpiryAlerts } from "@/hooks/use-document-expiry-alerts";

type ClienteTag = {
  id: string;
  name: string;
  color?: string | null;
};

type Cliente = {
  clienteId: string;
  orgId: string;
  nome: string;
  nomeSocial?: string | null;
  razaoSocial: string | null;
  nomeFantasia?: string | null;
  tipo: "fisica" | "juridica";
  documento: string;
  documentoValidade?: string | null;
  situacaoCadastral?: string | null;
  fotoUrl?: string | null;
  rg?: string | null;
  orgaoEmissor?: string | null;
  dataNascimento?: string | null;
  inscricaoEstadual?: string | null;
  inscricaoMunicipal?: string | null;
  email: string | null;
  emailSecundario?: string | null;
  emailCorporativo?: string | null;
  telefone: string | null;
  telefoneComercial?: string | null;
  celular: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  website?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  blog?: string | null;
  endereco: string | null;
  pontoReferencia?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  codigoIBGE?: string | null;
  codigoMunicipio?: string | null;
  regiao?: string | null;
  zona?: string | null;
  horarioPreferencialContato?: string | null;
  idiomaPreferido?: string | null;
  formaPreferidaComunicacao?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  status: "ativo" | "inativo" | "bloqueado";
  observacoes: string | null;
  tags?: ClienteTag[];
  createdAt: string;
  updatedAt: string;
};

type ClientesResponse = {
  itens: Cliente[];
  proximoCursor?: string | null;
};

type ViewMode = "cards" | "table";
type SortField = "nome" | "documento" | "status" | "createdAt" | "tipo";
type SortDirection = "asc" | "desc";

// Funções utilitárias
const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
};

const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const formatCEP = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
};

const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === parseInt(cleaned.charAt(10));
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

export function ClientesClient() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"info" | "contatos" | "representantes" | "historico">("info");
  const [pending, startTransition] = useTransition();
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [useWizard, setUseWizard] = useState(false); // Novo: opção para usar wizard
  const [expandedSections, setExpandedSections] = useState({
    dadosBasicos: true,
    contato: true,
    endereco: false,
    observacoes: false,
  });
  const [advancedSearch, setAdvancedSearch] = useState({
    nome: "",
    documento: "",
    email: "",
    cidade: "",
    estado: "",
    endereco: "",
  });

  const [formData, setFormData] = useState({
    nome: "",
    nomeSocial: "",
    razaoSocial: "",
    nomeFantasia: "",
    tipo: "fisica" as "fisica" | "juridica",
    documento: "",
    documentoValidade: "",
    situacaoCadastral: "",
    fotoUrl: "",
    rg: "",
    orgaoEmissor: "",
    dataNascimento: "",
    sexo: "",
    estadoCivil: "",
    nacionalidade: "",
    naturalidadeCidade: "",
    naturalidadeEstado: "",
    tituloEleitor: "",
    certidaoNascimento: "",
    certidaoCasamento: "",
    nomeMae: "",
    nomePai: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    email: "",
    emailSecundario: "",
    emailCorporativo: "",
    telefone: "",
    telefoneComercial: "",
    celular: "",
    whatsapp: "",
    telegram: "",
    website: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
  });

  // Alertas de documentos vencidos
  const documentAlerts = useDocumentExpiryAlerts(
    clientes.map((c) => ({
      clienteId: c.clienteId,
      nome: c.nome,
      documento: c.documento,
      tipo: c.tipo,
      documentoValidade: (c as any).documentoValidade,
    })),
    { diasAviso: 30 }
  );

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (debouncedSearch.length >= 2) {
        params.append("busca", debouncedSearch);
      }

      const response = await fetch(`/api/clientes?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ClientesResponse = await response.json();
        setClientes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao carregar clientes. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadClientes();
  }, [loadClientes]);

  // Buscar dados por CNPJ
  const buscarPorCNPJ = useCallback(async () => {
    const documentoLimpo = formData.documento.replace(/\D/g, "");
    if (formData.tipo !== "juridica" || documentoLimpo.length !== 14) {
      notificationCenter.add({
        type: "warning",
        title: "Atenção",
        message: "Digite um CNPJ válido para buscar os dados",
      });
      return;
    }

    if (!validateCNPJ(documentoLimpo)) {
      notificationCenter.add({
        type: "error",
        title: "CNPJ inválido",
        message: "Por favor, insira um CNPJ válido antes de buscar.",
      });
      return;
    }

    setBuscandoCNPJ(true);
    try {
      const resultado = await buscarCnpj(documentoLimpo);
      if (resultado) {
        setFormData((prev) => ({
          ...prev,
          nome: resultado.razaoSocial || prev.nome,
          razaoSocial: resultado.razaoSocial || prev.razaoSocial,
          nomeFantasia: resultado.nomeFantasia || prev.nomeFantasia,
          endereco: resultado.endereco?.logradouro || prev.endereco,
          numero: resultado.endereco?.numero || prev.numero,
          complemento: resultado.endereco?.complemento || prev.complemento,
          bairro: resultado.endereco?.bairro || prev.bairro,
          cidade: resultado.endereco?.cidade || prev.cidade,
          estado: resultado.endereco?.estado || prev.estado,
          cep: resultado.endereco?.cep || prev.cep,
          telefone: resultado.telefone || prev.telefone,
        }));
        notificationCenter.add({
          type: "success",
          title: "Dados encontrados",
          message: "Dados do CNPJ preenchidos automaticamente",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao buscar dados do CNPJ",
      });
    } finally {
      setBuscandoCNPJ(false);
    }
  }, [formData.documento, formData.tipo]);

  // Buscar endereço por CEP
  const buscarPorCEP = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCEP(true);
    try {
      const resultado = await buscarEnderecoPorCep(cepLimpo);
      if (resultado) {
        setFormData((prev) => ({
          ...prev,
          endereco: resultado.logradouro || prev.endereco,
          bairro: resultado.bairro || prev.bairro,
          complemento: resultado.complemento || prev.complemento,
          cidade: resultado.cidade || prev.cidade,
          estado: resultado.estado || prev.estado,
          cep: resultado.cep || prev.cep,
        }));
        notificationCenter.add({
          type: "success",
          title: "CEP encontrado",
          message: "Endereço preenchido automaticamente",
        });
      } else {
        notificationCenter.add({
          type: "warning",
          title: "CEP não encontrado",
          message: "Verifique o CEP digitado",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao buscar endereço. Tente novamente.",
      });
    } finally {
      setBuscandoCEP(false);
    }
  }, []);

  // Calcular progresso do formulário
  const calcularProgresso = useCallback(() => {
    const camposObrigatorios = [
      formData.nome,
      formData.documento,
    ];
    const camposOpcionais = [
      formData.email,
      formData.telefone || formData.celular,
      formData.endereco,
      formData.cidade,
      formData.estado,
      formData.cep,
    ];
    // Campos adicionais para PJ
    if (formData.tipo === "juridica") {
      camposOpcionais.push(formData.razaoSocial, formData.nomeFantasia);
    }
    const preenchidosObrigatorios = camposObrigatorios.filter((campo) => campo && campo.trim() !== "").length;
    const preenchidosOpcionais = camposOpcionais.filter((campo) => campo && campo.trim() !== "").length;
    // Progresso: 50% pelos obrigatórios + 50% pelos opcionais
    const progressoObrigatorios = (preenchidosObrigatorios / camposObrigatorios.length) * 50;
    const progressoOpcionais = (preenchidosOpcionais / camposOpcionais.length) * 50;
    const progresso = Math.round(progressoObrigatorios + progressoOpcionais);
    setFormProgress(progresso);
    return progresso;
  }, [formData]);

  // Atalhos de teclado
  useEffect(() => {
    if (!showForm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S ou Cmd+S para salvar
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const form = document.querySelector("form");
        if (form) {
          form.requestSubmit();
        }
      }
      // Esc para cancelar
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm]);

  // Atualizar progresso quando formData mudar
  useEffect(() => {
    if (showForm) {
      calcularProgresso();
    }
  }, [formData, showForm, calcularProgresso]);

  // Validar formulário completo
  const validarFormulario = useCallback((): {
    valido: boolean;
    erros: string[];
    camposErro: Record<string, string>;
  } => {
    const erros: string[] = [];
    const camposErro: Record<string, string> = {};

    // Nome obrigatório
    if (!formData.nome?.trim()) {
      erros.push("Nome é obrigatório");
      camposErro.nome = "Nome é obrigatório";
    }

    // Documento obrigatório e válido
    const documentoLimpo = formData.documento.replace(/\D/g, "");
    if (!documentoLimpo) {
      erros.push("Documento é obrigatório");
      camposErro.documento = "Documento é obrigatório";
    } else if (formData.tipo === "fisica") {
      if (documentoLimpo.length !== 11 || !validateCPF(documentoLimpo)) {
        erros.push("CPF inválido");
        camposErro.documento = "CPF inválido";
      }
    } else if (formData.tipo === "juridica") {
      if (documentoLimpo.length !== 14 || !validateCNPJ(documentoLimpo)) {
        erros.push("CNPJ inválido");
        camposErro.documento = "CNPJ inválido";
      }
    }

    // Email válido (se preenchido)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.push("Email inválido");
      camposErro.email = "Email inválido";
    }

    // Website válido (se preenchido)
    if (formData.website && formData.website.trim() !== "") {
      const website = formData.website.trim();
      if (!website.startsWith("http://") && !website.startsWith("https://")) {
        erros.push("Website deve começar com http:// ou https://");
        camposErro.website = "Website deve começar com http:// ou https://";
      } else {
        try {
          new URL(website);
        } catch {
          erros.push("Website inválido");
          camposErro.website = "Website deve ser uma URL válida";
        }
      }
    }

    // CEP válido (se preenchido)
    if (formData.cep) {
      const cepLimpo = formData.cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) {
        erros.push("CEP deve ter 8 dígitos");
        camposErro.cep = "CEP inválido";
      }
    }

    // Estado válido (se preenchido)
    if (formData.estado && formData.estado.length !== 2) {
      erros.push("Estado deve ter 2 caracteres (UF)");
      camposErro.estado = "Estado inválido";
    }

    return { valido: erros.length === 0, erros, camposErro };
  }, [formData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação completa
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

    setErrosValidacao({});

    startTransition(async () => {
      try {
        const url = editingCliente ? `/api/clientes/${editingCliente.clienteId}` : "/api/clientes";

        const method = editingCliente ? "PUT" : "POST";

        // Converter strings vazias para null nos campos opcionais
        const dadosParaEnviar = {
          ...formData,
          documento: documentoLimpo,
          documentoValidade: formData.documentoValidade ? new Date(formData.documentoValidade) : null,
          situacaoCadastral: formData.situacaoCadastral || null,
          fotoUrl: formData.fotoUrl || null,
          nomeSocial: formData.nomeSocial || null,
          razaoSocial: formData.razaoSocial || null,
          nomeFantasia: formData.nomeFantasia || null,
          rg: formData.rg || null,
          orgaoEmissor: formData.orgaoEmissor || null,
          dataNascimento: formData.dataNascimento ? new Date(formData.dataNascimento) : null,
          sexo: formData.sexo || null,
          estadoCivil: formData.estadoCivil || null,
          nacionalidade: formData.nacionalidade || null,
          naturalidadeCidade: formData.naturalidadeCidade || null,
          naturalidadeEstado: formData.naturalidadeEstado || null,
          tituloEleitor: formData.tituloEleitor || null,
          certidaoNascimento: formData.certidaoNascimento || null,
          certidaoCasamento: formData.certidaoCasamento || null,
          nomeMae: formData.nomeMae || null,
          nomePai: formData.nomePai || null,
          inscricaoEstadual: formData.inscricaoEstadual || null,
          inscricaoMunicipal: formData.inscricaoMunicipal || null,
          email: formData.email || null,
          emailSecundario: formData.emailSecundario || null,
          emailCorporativo: formData.emailCorporativo || null,
          telefone: formData.telefone || null,
          telefoneComercial: formData.telefoneComercial || null,
          celular: formData.celular || null,
          whatsapp: formData.whatsapp || null,
          telegram: formData.telegram || null,
          website: formData.website || null,
          endereco: formData.endereco || null,
          numero: formData.numero || null,
          complemento: formData.complemento || null,
          bairro: formData.bairro || null,
          cidade: formData.cidade || null,
          estado: formData.estado || null,
          cep: formData.cep || null,
          observacoes: formData.observacoes || null,
        };

        const response = await fetch(url, {
          method,
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        });

        if (response.ok) {
          // Confetti celebration!
          if (!editingCliente) {
            triggerConfetti();
          }
          
          notificationCenter.add({
            type: "success",
            title: editingCliente ? "Cliente atualizado" : "Cliente criado",
            message: `${formData.nome} foi ${editingCliente ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingCliente(null);
          setFormData({
            nome: "",
            nomeSocial: "",
            razaoSocial: "",
            nomeFantasia: "",
            tipo: "fisica",
            documento: "",
            rg: "",
            orgaoEmissor: "",
            dataNascimento: "",
            inscricaoEstadual: "",
            inscricaoMunicipal: "",
            email: "",
            telefone: "",
            celular: "",
            website: "",
            endereco: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            observacoes: "",
          });
          await loadClientes();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao salvar cliente";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar cliente",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar cliente. Tente novamente.",
        });
      }
    });
  }

  const handleExport = async (format: "csv" | "pdf" = "csv") => {
    try {
      const data = filteredAndSortedClientes.map((c) => ({
        Nome: c.nome,
        "Razão Social": c.razaoSocial || "",
        Tipo: c.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica",
        Documento: c.documento,
        Email: c.email || "",
        Telefone: c.telefone || "",
        Celular: c.celular || "",
        Endereço: c.endereco || "",
        Cidade: c.cidade || "",
        Estado: c.estado || "",
        CEP: c.cep || "",
        Status: c.status,
        "Data de Criação": new Date(c.createdAt).toLocaleDateString("pt-BR"),
      }));

      if (format === "csv") {
        const csv = [
          Object.keys(data[0] || {}).join(","),
          ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `clientes_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // Exportação PDF usando window.print ou biblioteca
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Relatório de Clientes</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { color: #333; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                <h1>Relatório de Clientes</h1>
                <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
                <table>
                  <thead>
                    <tr>
                      ${Object.keys(data[0] || {}).map((key) => `<th>${key}</th>`).join("")}
                    </tr>
                  </thead>
                  <tbody>
                    ${data.map((row) => `<tr>${Object.values(row).map((val) => `<td>${val}</td>`).join("")}</tr>`).join("")}
                  </tbody>
                </table>
              </body>
            </html>
          `;
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
      }

      notificationCenter.add({
        type: "success",
        title: "Exportado",
        message: `Dados exportados em ${format.toUpperCase()} com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao exportar dados.",
      });
    }
  };

  const handleCopyDocument = (documento: string) => {
    navigator.clipboard.writeText(documento);
    notificationCenter.add({
      type: "success",
      title: "Copiado",
      message: "Documento copiado para a área de transferência",
    });
  };

  const toggleSelectCliente = (clienteId: string) => {
    setSelectedClientes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clienteId)) {
        newSet.delete(clienteId);
      } else {
        newSet.add(clienteId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedClientes.size === paginatedClientes.length) {
      setSelectedClientes(new Set());
    } else {
      setSelectedClientes(new Set(paginatedClientes.map((c) => c.clienteId)));
    }
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedClientes.size === 0) {
      notificationCenter.add({
        type: "warning",
        title: "Nenhum cliente selecionado",
        message: "Selecione pelo menos um cliente para realizar a ação.",
      });
      return;
    }

    const confirmMessage =
      action === "delete"
        ? `Tem certeza que deseja excluir ${selectedClientes.size} cliente(s)?`
        : `Deseja ${action === "activate" ? "ativar" : "desativar"} ${selectedClientes.size} cliente(s)?`;

    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      try {
        const promises = Array.from(selectedClientes).map((clienteId) => {
          if (action === "delete") {
            return fetch(`/api/clientes/${clienteId}`, {
              method: "DELETE",
              headers: {
                ...getAuthHeadersWithTenant(),
                "Content-Type": "application/json",
              },
            });
          } else {
            const cliente = clientes.find((c) => c.clienteId === clienteId);
            if (!cliente) return Promise.resolve(null);
            return fetch(`/api/clientes/${clienteId}`, {
              method: "PUT",
              headers: {
                ...getAuthHeadersWithTenant(),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...cliente,
                status: action === "activate" ? "ativo" : "inativo",
              }),
            });
          }
        });

        await Promise.all(promises);
        setSelectedClientes(new Set());
        await loadClientes();

        notificationCenter.add({
          type: "success",
          title: "Ação concluída",
          message: `${selectedClientes.size} cliente(s) ${action === "delete" ? "excluído(s)" : action === "activate" ? "ativado(s)" : "desativado(s)"} com sucesso.`,
        });
      } catch (error) {
        console.error("Erro ao executar ação em massa:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao executar ação em massa.",
        });
      }
    });
  };

  function handleEdit(cliente: Cliente) {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      nomeSocial: (cliente as any).nomeSocial || "",
      razaoSocial: cliente.razaoSocial || "",
      nomeFantasia: (cliente as any).nomeFantasia || "",
      tipo: cliente.tipo,
      documento: cliente.documento,
      documentoValidade: (cliente as any).documentoValidade
        ? new Date((cliente as any).documentoValidade).toISOString().split("T")[0]
        : "",
      situacaoCadastral: (cliente as any).situacaoCadastral || "",
      fotoUrl: (cliente as any).fotoUrl || "",
      rg: (cliente as any).rg || "",
      orgaoEmissor: (cliente as any).orgaoEmissor || "",
      dataNascimento: (cliente as any).dataNascimento
        ? new Date((cliente as any).dataNascimento).toISOString().split("T")[0]
        : "",
      sexo: (cliente as any).sexo || "",
      estadoCivil: (cliente as any).estadoCivil || "",
      nacionalidade: (cliente as any).nacionalidade || "",
      naturalidadeCidade: (cliente as any).naturalidadeCidade || "",
      naturalidadeEstado: (cliente as any).naturalidadeEstado || "",
      tituloEleitor: (cliente as any).tituloEleitor || "",
      certidaoNascimento: (cliente as any).certidaoNascimento || "",
      certidaoCasamento: (cliente as any).certidaoCasamento || "",
      nomeMae: (cliente as any).nomeMae || "",
      nomePai: (cliente as any).nomePai || "",
      inscricaoEstadual: (cliente as any).inscricaoEstadual || "",
      inscricaoMunicipal: (cliente as any).inscricaoMunicipal || "",
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      celular: cliente.celular || "",
      website: (cliente as any).website || "",
      endereco: cliente.endereco || "",
      numero: (cliente as any).numero || "",
      complemento: (cliente as any).complemento || "",
      bairro: (cliente as any).bairro || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      observacoes: cliente.observacoes || "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingCliente(null);
    setFormData({
      nome: "",
      nomeSocial: "",
      razaoSocial: "",
      nomeFantasia: "",
      tipo: "fisica",
      documento: "",
      rg: "",
      orgaoEmissor: "",
      dataNascimento: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      email: "",
      telefone: "",
      celular: "",
      website: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
    });
  }

  // Estatísticas
  const stats = useMemo(() => {
    const total = clientes.length;
    const ativos = clientes.filter((c) => c.status === "ativo").length;
    const inativos = clientes.filter((c) => c.status === "inativo").length;
    const bloqueados = clientes.filter((c) => c.status === "bloqueado").length;
    const fisica = clientes.filter((c) => c.tipo === "fisica").length;
    const juridica = clientes.filter((c) => c.tipo === "juridica").length;
    return { total, ativos, inativos, bloqueados, fisica, juridica };
  }, [clientes]);

  // Filtrar e ordenar clientes
  const filteredAndSortedClientes = useMemo(() => {
    let filtered = [...clientes];

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Filtro de tipo
    if (tipoFilter !== "all") {
      filtered = filtered.filter((c) => c.tipo === tipoFilter);
    }

    // Busca simples ou avançada
    if (showAdvancedSearch) {
      // Busca avançada - todos os campos devem corresponder
      if (advancedSearch.nome) {
        filtered = filtered.filter((c) =>
          c.nome.toLowerCase().includes(advancedSearch.nome.toLowerCase())
        );
      }
      if (advancedSearch.documento) {
        const docClean = advancedSearch.documento.replace(/\D/g, "");
        filtered = filtered.filter((c) =>
          c.documento.replace(/\D/g, "").includes(docClean)
        );
      }
      if (advancedSearch.email) {
        filtered = filtered.filter((c) =>
          c.email?.toLowerCase().includes(advancedSearch.email.toLowerCase())
        );
      }
      if (advancedSearch.cidade) {
        filtered = filtered.filter((c) =>
          c.cidade?.toLowerCase().includes(advancedSearch.cidade.toLowerCase())
        );
      }
      if (advancedSearch.estado) {
        filtered = filtered.filter((c) =>
          c.estado?.toLowerCase().includes(advancedSearch.estado.toLowerCase())
        );
      }
      if (advancedSearch.endereco) {
        filtered = filtered.filter((c) =>
          c.endereco?.toLowerCase().includes(advancedSearch.endereco.toLowerCase())
        );
      }
    } else if (debouncedSearch.length >= 2) {
      // Busca simples - qualquer campo corresponde
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.documento.replace(/\D/g, "").includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.razaoSocial?.toLowerCase().includes(searchLower) ||
          c.cidade?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "nome":
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case "documento":
          aValue = a.documento;
          bValue = b.documento;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "tipo":
          aValue = a.tipo;
          bValue = b.tipo;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clientes, statusFilter, tipoFilter, debouncedSearch, sortField, sortDirection, showAdvancedSearch, advancedSearch]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedClientes.length / itemsPerPage);
  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedClientes.slice(start, end);
  }, [filteredAndSortedClientes, currentPage, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard de Métricas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Total
            </span>
          </div>
          <p className="text-2xl font-semibold">{stats.total}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {((stats.total / Math.max(stats.total, 1)) * 100).toFixed(0)}% do total
          </p>
        </GlassCard>
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Ativos
            </span>
          </div>
          <p className="text-2xl font-semibold text-green-500">{stats.ativos}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {stats.total > 0 ? ((stats.ativos / stats.total) * 100).toFixed(0) : 0}% ativos
          </p>
        </GlassCard>
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Inativos
            </span>
          </div>
          <p className="text-2xl font-semibold text-red-500">{stats.inativos}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {stats.total > 0 ? ((stats.inativos / stats.total) * 100).toFixed(0) : 0}% inativos
          </p>
        </GlassCard>
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Bloqueados
            </span>
          </div>
          <p className="text-2xl font-semibold text-yellow-500">{stats.bloqueados}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {stats.total > 0 ? ((stats.bloqueados / stats.total) * 100).toFixed(0) : 0}% bloqueados
          </p>
        </GlassCard>
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Pessoa Física
            </span>
          </div>
          <p className="text-2xl font-semibold">{stats.fisica}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {stats.total > 0 ? ((stats.fisica / stats.total) * 100).toFixed(0) : 0}% do total
          </p>
        </GlassCard>
        <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Pessoa Jurídica
            </span>
          </div>
          <p className="text-2xl font-semibold">{stats.juridica}</p>
          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
            {stats.total > 0 ? ((stats.juridica / stats.total) * 100).toFixed(0) : 0}% do total
          </p>
        </GlassCard>
        {documentAlerts.hasAlerts && (
          <>
            {documentAlerts.expiredCount > 0 && (
              <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Documentos Expirados
                  </span>
                </div>
                <p className="text-2xl font-semibold text-red-500">{documentAlerts.expiredCount}</p>
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
                  Requerem atenção imediata
                </p>
              </GlassCard>
            )}
            {documentAlerts.expiringSoonCount > 0 && (
              <GlassCard className="p-4 hover:scale-105 transition-transform cursor-pointer border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Expirando em Breve
                  </span>
                </div>
                <p className="text-2xl font-semibold text-yellow-500">{documentAlerts.expiringSoonCount}</p>
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
                  Expirarão nos próximos 30 dias
                </p>
              </GlassCard>
            )}
          </>
        )}
      </div>

      {/* Barra de ações em massa */}
      {selectedClientes.size > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedClientes.size} cliente(s) selecionado(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("activate")}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Ativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("deactivate")}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Desativar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                className="gap-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedClientes(new Set())}>
                Cancelar
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Barra de ferramentas */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
              <Input
                type="search"
                placeholder="Buscar por nome, documento, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <FormSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[140px]"
            >
              <option value="all">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="bloqueado">Bloqueados</option>
            </FormSelect>
            <FormSelect
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[140px]"
            >
              <option value="all">Todos Tipos</option>
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </FormSelect>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAdvancedSearch(!showAdvancedSearch);
                if (showAdvancedSearch) {
                  // Limpar busca avançada ao fechar
                  setAdvancedSearch({
                    nome: "",
                    documento: "",
                    email: "",
                    cidade: "",
                    estado: "",
                    endereco: "",
                  });
                }
              }}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {showAdvancedSearch ? "Busca Simples" : "Busca Avançada"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-[color-mix(in oklab,var(--muted-soft) 30%,var(--fg) 70%)] rounded-lg p-1">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-8 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-2">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} className="gap-2">
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadClientes()}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Busca Avançada */}
      {showAdvancedSearch && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Busca Avançada</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdvancedSearch({
                  nome: "",
                  documento: "",
                  email: "",
                  cidade: "",
                  estado: "",
                  endereco: "",
                });
              }}
            >
              Limpar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField label="Nome" fieldId="adv-nome">
              <Input
                id="adv-nome"
                placeholder="Buscar por nome..."
                value={advancedSearch.nome}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, nome: e.target.value })
                }
              />
            </FormField>
            <FormField label="Documento (CPF/CNPJ)" fieldId="adv-documento">
              <Input
                id="adv-documento"
                placeholder="Buscar por documento..."
                value={advancedSearch.documento}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, documento: e.target.value })
                }
              />
            </FormField>
            <FormField label="Email" fieldId="adv-email">
              <Input
                id="adv-email"
                type="email"
                placeholder="Buscar por email..."
                value={advancedSearch.email}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, email: e.target.value })
                }
              />
            </FormField>
            <FormField label="Cidade" fieldId="adv-cidade">
              <Input
                id="adv-cidade"
                placeholder="Buscar por cidade..."
                value={advancedSearch.cidade}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, cidade: e.target.value })
                }
              />
            </FormField>
            <FormField label="Estado (UF)" fieldId="adv-estado">
              <Input
                id="adv-estado"
                placeholder="Ex: SP, RJ..."
                value={advancedSearch.estado}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, estado: e.target.value.toUpperCase().slice(0, 2) })
                }
                maxLength={2}
              />
            </FormField>
            <FormField label="Endereço" fieldId="adv-endereco">
              <Input
                id="adv-endereco"
                placeholder="Buscar por endereço..."
                value={advancedSearch.endereco}
                onChange={(e) =>
                  setAdvancedSearch({ ...advancedSearch, endereco: e.target.value })
                }
              />
            </FormField>
          </div>
        </GlassCard>
      )}

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
                {useWizard
                  ? "Preencha os dados passo a passo usando o wizard guiado"
                  : `Preencha os campos abaixo. Use <kbd className="px-1.5 py-0.5 rounded bg-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] text-xs">Ctrl+S</kbd> para salvar ou <kbd className="px-1.5 py-0.5 rounded bg-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] text-xs">Esc</kbd> para cancelar`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseWizard(!useWizard)}
                className="gap-2"
              >
                {useWizard ? "Modo Tradicional" : "Modo Wizard"}
              </Button>
              {!useWizard && (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Progresso
                  </span>
                  <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
                    <motion.div
                      className="h-full bg-[var(--primary)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${formProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-medium mt-0.5">{formProgress}%</span>
                </div>
              )}
            </div>
          </div>
          {useWizard ? (
            <ClienteFormWizard
              clienteId={editingCliente?.clienteId}
              isEditing={!!editingCliente}
              initialData={editingCliente ? {
                nome: editingCliente.nome,
                nomeSocial: (editingCliente as any).nomeSocial || "",
                razaoSocial: editingCliente.razaoSocial || "",
                nomeFantasia: (editingCliente as any).nomeFantasia || "",
                tipo: editingCliente.tipo,
                documento: editingCliente.documento,
                documentoValidade: (editingCliente as any).documentoValidade
                  ? new Date((editingCliente as any).documentoValidade).toISOString().split("T")[0]
                  : "",
                situacaoCadastral: (editingCliente as any).situacaoCadastral || "",
                fotoUrl: (editingCliente as any).fotoUrl || "",
                rg: (editingCliente as any).rg || "",
                orgaoEmissor: (editingCliente as any).orgaoEmissor || "",
                dataNascimento: (editingCliente as any).dataNascimento
                  ? new Date((editingCliente as any).dataNascimento).toISOString().split("T")[0]
                  : "",
                sexo: (editingCliente as any).sexo || "",
                estadoCivil: (editingCliente as any).estadoCivil || "",
                nacionalidade: (editingCliente as any).nacionalidade || "",
                naturalidadeCidade: (editingCliente as any).naturalidadeCidade || "",
                naturalidadeEstado: (editingCliente as any).naturalidadeEstado || "",
                tituloEleitor: (editingCliente as any).tituloEleitor || "",
                certidaoNascimento: (editingCliente as any).certidaoNascimento || "",
                certidaoCasamento: (editingCliente as any).certidaoCasamento || "",
                nomeMae: (editingCliente as any).nomeMae || "",
                nomePai: (editingCliente as any).nomePai || "",
                inscricaoEstadual: (editingCliente as any).inscricaoEstadual || "",
                inscricaoMunicipal: (editingCliente as any).inscricaoMunicipal || "",
                email: editingCliente.email || "",
                emailSecundario: (editingCliente as any).emailSecundario || "",
                emailCorporativo: (editingCliente as any).emailCorporativo || "",
                telefone: editingCliente.telefone || "",
                telefoneComercial: (editingCliente as any).telefoneComercial || "",
                celular: editingCliente.celular || "",
                whatsapp: (editingCliente as any).whatsapp || "",
                telegram: (editingCliente as any).telegram || "",
                website: (editingCliente as any).website || "",
                endereco: editingCliente.endereco || "",
                numero: (editingCliente as any).numero || "",
                complemento: (editingCliente as any).complemento || "",
                bairro: (editingCliente as any).bairro || "",
                cidade: editingCliente.cidade || "",
                estado: editingCliente.estado || "",
                cep: editingCliente.cep || "",
                observacoes: editingCliente.observacoes || "",
              } : undefined}
              onSubmit={async (data) => {
                const documentoLimpo = data.documento.replace(/\D/g, "");
                const dadosParaEnviar = {
                  ...data,
                  documento: documentoLimpo,
                  nomeSocial: data.nomeSocial || null,
                  razaoSocial: data.razaoSocial || null,
                  nomeFantasia: data.nomeFantasia || null,
                  rg: data.rg || null,
                  orgaoEmissor: data.orgaoEmissor || null,
                  dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
                  inscricaoEstadual: data.inscricaoEstadual || null,
                  inscricaoMunicipal: data.inscricaoMunicipal || null,
                  email: data.email || null,
                  telefone: data.telefone || null,
                  celular: data.celular || null,
                  website: data.website || null,
                  endereco: data.endereco || null,
                  numero: data.numero || null,
                  complemento: data.complemento || null,
                  bairro: data.bairro || null,
                  cidade: data.cidade || null,
                  estado: data.estado || null,
                  cep: data.cep || null,
                  observacoes: data.observacoes || null,
                };

                const url = editingCliente ? `/api/clientes/${editingCliente.clienteId}` : "/api/clientes";
                const method = editingCliente ? "PUT" : "POST";

                const response = await fetch(url, {
                  method,
                  headers: {
                    ...getAuthHeadersWithTenant(),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dadosParaEnviar),
                });

                if (response.ok) {
                  const clienteData = await response.json();
                  const clienteId = editingCliente ? editingCliente.clienteId : clienteData.clienteId;

                  // Salvar tags se houver
                  if (data.tags && data.tags.length > 0 && clienteId) {
                    try {
                      await fetch(`/api/clientes/${clienteId}/tags`, {
                        method: "PUT",
                        headers: {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          tagIds: data.tags.map((tag) => tag.id),
                        }),
                      });
                    } catch (error) {
                      console.error("Erro ao salvar tags:", error);
                      // Não bloquear o fluxo se houver erro ao salvar tags
                    }
                  } else if (clienteId) {
                    // Remover todas as tags se não houver tags selecionadas
                    try {
                      await fetch(`/api/clientes/${clienteId}/tags`, {
                        method: "PUT",
                        headers: {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ tagIds: [] }),
                      });
                    } catch (error) {
                      console.error("Erro ao remover tags:", error);
                    }
                  }

                  if (!editingCliente) {
                    triggerConfetti();
                  }
                  notificationCenter.add({
                    type: "success",
                    title: editingCliente ? "Cliente atualizado" : "Cliente criado",
                    message: `${data.nome} foi ${editingCliente ? "atualizado" : "criado"} com sucesso`,
                  });
                  setShowForm(false);
                  setEditingCliente(null);
                  await loadClientes();
                } else {
                  const error = await response.json();
                  notificationCenter.add({
                    type: "error",
                    title: "Erro ao salvar cliente",
                    message: error.message || "Erro ao salvar cliente",
                  });
                }
              }}
              onCancel={handleCancel}
              isEditing={!!editingCliente}
            />
          ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Seção: Dados Básicos */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, dadosBasicos: !prev.dadosBasicos }))
                }
                className="flex w-full items-center justify-between rounded-lg border border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)] p-3 transition-colors hover:bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)]"
              >
                <span className="font-semibold text-sm">📋 Dados Básicos</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSections.dadosBasicos ? "rotate-90" : ""}`}
                />
              </button>
              {expandedSections.dadosBasicos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <FormSelect
                    label="Tipo"
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as "fisica" | "juridica" })
                    }
                    required
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </FormSelect>

              <FormField
                label={formData.tipo === "fisica" ? "CPF" : "CNPJ"}
                required
                fieldId="documento"
              >
                <div className="flex gap-2">
                  <Input
                    id="documento"
                    value={
                      formData.tipo === "fisica"
                        ? formatCPF(formData.documento)
                        : formatCNPJ(formData.documento)
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, documento: value });
                      // Limpar erro ao digitar
                      if (errosValidacao.documento) {
                        setErrosValidacao((prev) => {
                          const novo = { ...prev };
                          delete novo.documento;
                          return novo;
                        });
                      }
                    }}
                    maxLength={formData.tipo === "fisica" ? 14 : 18}
                    required
                    className={errosValidacao.documento ? "border-red-500 border-2" : ""}
                  />
                  {formData.tipo === "juridica" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={buscarPorCNPJ}
                      disabled={buscandoCNPJ || !formData.documento}
                      className="gap-2 whitespace-nowrap"
                    >
                      {buscandoCNPJ ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Buscar
                    </Button>
                  )}
                </div>
                {errosValidacao.documento && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.documento}</p>
                )}
              </FormField>

              <FormField label="Nome" required fieldId="nome">
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData({ ...formData, nome: e.target.value });
                    if (errosValidacao.nome) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.nome;
                        return novo;
                      });
                    }
                  }}
                  placeholder={formData.tipo === "fisica" ? "Ex: João Silva" : "Ex: Empresa ABC Ltda"}
                  required
                  autoFocus={!editingCliente}
                  className={errosValidacao.nome ? "border-red-500 border-2" : ""}
                />
                {errosValidacao.nome && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.nome}</p>
                )}
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  {formData.tipo === "fisica" ? "Nome completo da pessoa física" : "Nome da empresa"}
                </p>
              </FormField>

              {formData.tipo === "juridica" && (
                <>
                  <FormField label="Razão Social" fieldId="razaoSocial">
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                      placeholder="Ex: Empresa ABC Comércio e Serviços Ltda"
                    />
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                      Nome oficial registrado na Receita Federal
                    </p>
                  </FormField>
                  <FormField label="Nome Fantasia" fieldId="nomeFantasia">
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                      placeholder="Ex: ABC Store"
                    />
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                      Nome comercial usado pela empresa
                    </p>
                  </FormField>
                  <FormField label="Inscrição Estadual (IE)" fieldId="inscricaoEstadual">
                    <Input
                      id="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                      placeholder="Ex: 123.456.789.012 ou ISENTO"
                    />
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                      Inscrição estadual para empresas (pode ser ISENTO)
                    </p>
                  </FormField>
                  <FormField label="Inscrição Municipal (IM)" fieldId="inscricaoMunicipal">
                    <Input
                      id="inscricaoMunicipal"
                      value={formData.inscricaoMunicipal}
                      onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                      placeholder="Ex: 987654321"
                    />
                    <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                      Inscrição municipal (opcional)
                    </p>
                  </FormField>
                </>
              )}
                </motion.div>
              )}
            </div>

            {/* Seção: Contato */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, contato: !prev.contato }))
                }
                className="flex w-full items-center justify-between rounded-lg border border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)] p-3 transition-colors hover:bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)]"
              >
                <span className="font-semibold text-sm">📞 Contato</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSections.contato ? "rotate-90" : ""}`}
                />
              </button>
              {expandedSections.contato && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <FormField label="Email" fieldId="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errosValidacao.email) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.email;
                        return novo;
                      });
                    }
                  }}
                  placeholder="Ex: contato@empresa.com.br"
                  className={errosValidacao.email ? "border-red-500 border-2" : ""}
                />
                {errosValidacao.email && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.email}</p>
                )}
              </FormField>

              <FormField label="Telefone" fieldId="telefone">
                <Input
                  id="telefone"
                  value={formatPhone(formData.telefone)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, telefone: value });
                  }}
                  placeholder="Ex: (11) 3456-7890"
                  maxLength={14}
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Telefone fixo (opcional)
                </p>
              </FormField>

              <FormField label="Celular" fieldId="celular">
                <Input
                  id="celular"
                  value={formatPhone(formData.celular)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, celular: value });
                  }}
                  placeholder="Ex: (11) 98765-4321"
                  maxLength={15}
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Telefone celular (opcional)
                </p>
              </FormField>

              <FormField label="Website" fieldId="website" className="md:col-span-2">
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData({ ...formData, website: e.target.value });
                    if (errosValidacao.website) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.website;
                        return novo;
                      });
                    }
                  }}
                  placeholder="https://www.exemplo.com.br"
                  className={errosValidacao.website ? "border-red-500 border-2" : ""}
                />
                {errosValidacao.website && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.website}</p>
                )}
                {!errosValidacao.website && (
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                    URL completa do site (deve começar com http:// ou https://)
                  </p>
                )}
              </FormField>

                </motion.div>
              )}
            </div>

            {/* Seção: Endereço */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, endereco: !prev.endereco }))
                }
                className="flex w-full items-center justify-between rounded-lg border border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)] p-3 transition-colors hover:bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)]"
              >
                <span className="font-semibold text-sm">📍 Endereço</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSections.endereco ? "rotate-90" : ""}`}
                />
              </button>
              {expandedSections.endereco && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <FormField label="CEP" fieldId="cep">
                <Input
                  id="cep"
                  value={formatCEP(formData.cep)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, cep: value });
                    if (errosValidacao.cep) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.cep;
                        return novo;
                      });
                    }
                  }}
                  onBlur={async () => {
                    if (formData.cep) {
                      await buscarPorCEP(formData.cep);
                    }
                  }}
                  maxLength={9}
                  placeholder="00000-000"
                  className={errosValidacao.cep ? "border-red-500 border-2" : ""}
                  disabled={buscandoCEP}
                />
                {buscandoCEP && (
                  <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Buscando endereço...
                  </p>
                )}
                {!buscandoCEP && !errosValidacao.cep && (
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                    O endereço será preenchido automaticamente ao sair do campo
                  </p>
                )}
                {errosValidacao.cep && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.cep}</p>
                )}
              </FormField>

              <FormField label="Endereço (Logradouro)" fieldId="endereco" className="md:col-span-2">
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Ex: Rua das Flores, Avenida Paulista"
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Nome da rua, avenida ou logradouro (preenchido automaticamente ao buscar CEP)
                </p>
              </FormField>

              <FormField label="Número" fieldId="numero">
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: 123, S/N"
                />
              </FormField>

              <FormField label="Complemento" fieldId="complemento">
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  placeholder="Ex: Apto 101, Sala 203, Bloco A"
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Preenchido automaticamente ao buscar CEP (se disponível)
                </p>
              </FormField>

              <FormField label="Bairro" fieldId="bairro">
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  placeholder="Ex: Centro, Jardim das Flores"
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Preenchido automaticamente ao buscar CEP
                </p>
              </FormField>

              <FormField label="Cidade" fieldId="cidade">
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo, Rio de Janeiro"
                />
                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                  Preenchido automaticamente ao buscar CEP
                </p>
              </FormField>

              <FormField label="Estado (UF)" fieldId="estado">
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => {
                    setFormData({ ...formData, estado: e.target.value.toUpperCase().slice(0, 2) });
                    if (errosValidacao.estado) {
                      setErrosValidacao((prev) => {
                        const novo = { ...prev };
                        delete novo.estado;
                        return novo;
                      });
                    }
                  }}
                  maxLength={2}
                  placeholder="Ex: SP, RJ, MG"
                  className={errosValidacao.estado ? "border-red-500 border-2" : ""}
                />
                {errosValidacao.estado && (
                  <p className="text-xs text-red-500 mt-1">{errosValidacao.estado}</p>
                )}
                {!errosValidacao.estado && (
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                    Sigla do estado (2 letras) - preenchido automaticamente ao buscar CEP
                  </p>
                )}
              </FormField>

                </motion.div>
              )}
            </div>

            {/* Seção: Observações */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, observacoes: !prev.observacoes }))
                }
                className="flex w-full items-center justify-between rounded-lg border border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)] p-3 transition-colors hover:bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)]"
              >
                <span className="font-semibold text-sm">📝 Observações</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${expandedSections.observacoes ? "rotate-90" : ""}`}
                />
              </button>
              {expandedSections.observacoes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FormTextarea
                    label="Observações"
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Ex: Cliente preferencial, paga sempre em dia, preferência por contato via WhatsApp..."
                    rows={4}
                  />
                  <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)] mt-1">
                    Informações adicionais sobre o cliente (opcional)
                  </p>
                </motion.div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : editingCliente ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
          )}
        </GlassCard>
      )}

      {/* Lista de clientes */}
      {loading ? (
        <GlassCard className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent mx-auto mb-4" />
            <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Carregando clientes...
            </p>
          </div>
        </GlassCard>
      ) : filteredAndSortedClientes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User className="mx-auto h-16 w-16 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
          <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4">
            {search || statusFilter !== "all" || tipoFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando seu primeiro cliente"}
          </p>
          {!search && statusFilter === "all" && tipoFilter === "all" && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </GlassCard>
      ) : viewMode === "cards" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="wait">
              {paginatedClientes.map((cliente, index) => (
                <motion.div
                  key={cliente.clienteId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <GlassCard className="p-6 hover:scale-[1.02] transition-transform">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectCliente(cliente.clienteId);
                          }}
                          className="mt-1"
                        >
                          {selectedClientes.has(cliente.clienteId) ? (
                            <CheckSquare className="h-5 w-5 text-[var(--primary)]" />
                          ) : (
                            <Square className="h-5 w-5 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
                          )}
                        </button>
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => setSelectedCliente(cliente)}
                        >
                          <div className="p-2 rounded-lg bg-[color-mix(in oklab,var(--primary)_10%,transparent)]">
                            {cliente.tipo === "juridica" ? (
                              <Building2 className="h-5 w-5 text-[var(--primary)]" />
                            ) : (
                              <User className="h-5 w-5 text-[var(--primary)]" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">{cliente.nome}</h3>
                            {cliente.razaoSocial && (
                              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                {cliente.razaoSocial}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)]">
                        {cliente.status === "ativo" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : cliente.status === "inativo" ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                        <span className="text-xs capitalize font-medium">{cliente.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <p className="flex items-center gap-2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        <FileText className="h-3.5 w-3.5" />
                        {cliente.tipo === "fisica" ? "CPF" : "CNPJ"}:{" "}
                        {cliente.tipo === "fisica"
                          ? formatCPF(cliente.documento)
                          : formatCNPJ(cliente.documento)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyDocument(cliente.documento);
                          }}
                          className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </p>
                      {cliente.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{cliente.email}</span>
                        </p>
                      )}
                      {cliente.telefone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {formatPhone(cliente.telefone)}
                        </p>
                      )}
                      {cliente.endereco && (
                        <p className="flex items-center gap-2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {cliente.endereco}, {cliente.cidade} - {cliente.estado}
                          </span>
                        </p>
                      )}
                    </div>
                    {cliente.tags && cliente.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cliente.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: tag.color
                                ? `${tag.color}20`
                                : "var(--muted-soft)",
                              color: tag.color || "inherit",
                              border: `1px solid ${tag.color ? `${tag.color}40` : "transparent"}`,
                            }}
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCliente(cliente);
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(cliente);
                        }}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                  Mostrando {paginatedClientes.length} de {filteredAndSortedClientes.length} clientes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-3">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
                    <th className="text-left p-4 w-12">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center"
                      >
                        {selectedClientes.size === paginatedClientes.length && paginatedClientes.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
                        ) : (
                          <Square className="h-4 w-4 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("nome")}
                        className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
                      >
                        Nome
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("documento")}
                        className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
                      >
                        Documento
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="text-left p-4">Contato</th>
                    <th className="text-left p-4">Endereço</th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
                      >
                        Status
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClientes.map((cliente) => (
                    <motion.tr
                      key={cliente.clienteId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[color-mix(in oklab,var(--muted-soft) 10%,transparent)] hover:bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)] transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleSelectCliente(cliente.clienteId)}
                          className="flex items-center justify-center"
                        >
                          {selectedClientes.has(cliente.clienteId) ? (
                            <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
                          ) : (
                            <Square className="h-4 w-4 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {cliente.tipo === "juridica" ? (
                            <Building2 className="h-4 w-4 text-[var(--primary)]" />
                          ) : (
                            <User className="h-4 w-4 text-[var(--primary)]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <InlineEditField
                              value={cliente.nome}
                              clienteId={cliente.clienteId}
                              field="nome"
                              fieldLabel="Nome"
                              onUpdate={(newValue) => {
                                setClientes((prev) =>
                                  prev.map((c) =>
                                    c.clienteId === cliente.clienteId ? { ...c, nome: newValue } : c
                                  )
                                );
                                void loadClientes();
                              }}
                              validate={(value) => {
                                if (!value || value.trim().length < 2) {
                                  return "Nome deve ter pelo menos 2 caracteres";
                                }
                                return null;
                              }}
                            />
                            {cliente.razaoSocial && (
                              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mt-1">
                                {cliente.razaoSocial}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>
                            {cliente.tipo === "fisica"
                              ? formatCPF(cliente.documento)
                              : formatCNPJ(cliente.documento)}
                          </span>
                          <button
                            onClick={() => handleCopyDocument(cliente.documento)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <InlineEditField
                              value={cliente.email || ""}
                              clienteId={cliente.clienteId}
                              field="email"
                              fieldLabel="Email"
                              type="email"
                              placeholder="email@exemplo.com"
                              onUpdate={(newValue) => {
                                setClientes((prev) =>
                                  prev.map((c) =>
                                    c.clienteId === cliente.clienteId ? { ...c, email: newValue || null } : c
                                  )
                                );
                                void loadClientes();
                              }}
                              validate={(value) => {
                                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                  return "Email inválido";
                                }
                                return null;
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <InlineEditField
                              value={cliente.telefone || ""}
                              clienteId={cliente.clienteId}
                              field="telefone"
                              fieldLabel="Telefone"
                              type="tel"
                              placeholder="(00) 0000-0000"
                              formatValue={(value) => value ? formatPhone(value) : ""}
                              onUpdate={(newValue) => {
                                setClientes((prev) =>
                                  prev.map((c) =>
                                    c.clienteId === cliente.clienteId ? { ...c, telefone: newValue || null } : c
                                  )
                                );
                                void loadClientes();
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <InlineEditField
                              value={cliente.cidade || ""}
                              clienteId={cliente.clienteId}
                              field="cidade"
                              fieldLabel="Cidade"
                              placeholder="Nome da cidade"
                              onUpdate={(newValue) => {
                                setClientes((prev) =>
                                  prev.map((c) =>
                                    c.clienteId === cliente.clienteId ? { ...c, cidade: newValue || null } : c
                                  )
                                );
                                void loadClientes();
                              }}
                            />
                          </div>
                          {cliente.cidade && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <InlineEditField
                                value={cliente.estado || ""}
                                clienteId={cliente.clienteId}
                                field="estado"
                                fieldLabel="Estado"
                                placeholder="UF"
                                maxLength={2}
                                formatValue={(value) => value ? value.toUpperCase() : ""}
                                onUpdate={(newValue) => {
                                  setClientes((prev) =>
                                    prev.map((c) =>
                                      c.clienteId === cliente.clienteId ? { ...c, estado: newValue.toUpperCase() || null } : c
                                    )
                                  );
                                  void loadClientes();
                                }}
                                validate={(value) => {
                                  if (value && value.length !== 2) {
                                    return "Estado deve ter 2 caracteres (UF)";
                                  }
                                  return null;
                                }}
                              />
                            </div>
                          )}
                          {cliente.tags && cliente.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {cliente.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: tag.color
                                      ? `${tag.color}20`
                                      : "var(--muted-soft)",
                                    color: tag.color || "inherit",
                                    border: `1px solid ${tag.color ? `${tag.color}40` : "transparent"}`,
                                  }}
                                >
                                  <Tag className="h-2 w-2" />
                                  {tag.name}
                                </span>
                              ))}
                              {cliente.tags.length > 3 && (
                                <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                  +{cliente.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[color-mix(in oklab,var(--muted-soft) 10%,transparent)] w-fit">
                          {cliente.status === "ativo" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : cliente.status === "inativo" ? (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                          )}
                          <span className="text-xs capitalize font-medium">{cliente.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCliente(cliente)}
                            className="gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                            className="gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          {/* Paginação */}
          {totalPages > 1 && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                  Mostrando {paginatedClientes.length} de {filteredAndSortedClientes.length} clientes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-3">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* Modal de detalhes com abas */}
      <AnimatePresence>
        {selectedCliente && (
          <ClienteDetailModal
            cliente={selectedCliente}
            onClose={() => {
              setSelectedCliente(null);
              setActiveTab("info");
            }}
            onEdit={handleEdit}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
