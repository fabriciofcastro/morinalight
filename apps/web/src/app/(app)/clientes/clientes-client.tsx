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
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { ClienteDetailModal } from "./cliente-detail-modal";

type Cliente = {
  clienteId: string;
  orgId: string;
  nome: string;
  razaoSocial: string | null;
  tipo: "fisica" | "juridica";
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  status: "ativo" | "inativo" | "bloqueado";
  observacoes: string | null;
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
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"info" | "representantes" | "historico">("info");
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    nome: "",
    razaoSocial: "",
    tipo: "fisica" as "fisica" | "juridica",
    documento: "",
    email: "",
    telefone: "",
    celular: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação de documento
    const documentoLimpo = formData.documento.replace(/\D/g, "");
    if (formData.tipo === "fisica" && !validateCPF(documentoLimpo)) {
      notificationCenter.add({
        type: "error",
        title: "CPF inválido",
        message: "Por favor, insira um CPF válido.",
      });
      return;
    }
    if (formData.tipo === "juridica" && !validateCNPJ(documentoLimpo)) {
      notificationCenter.add({
        type: "error",
        title: "CNPJ inválido",
        message: "Por favor, insira um CNPJ válido.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const url = editingCliente ? `/api/clientes/${editingCliente.clienteId}` : "/api/clientes";

        const method = editingCliente ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            documento: documentoLimpo,
          }),
        });

        if (response.ok) {
          notificationCenter.add({
            type: "success",
            title: editingCliente ? "Cliente atualizado" : "Cliente criado",
            message: `${formData.nome} foi ${editingCliente ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingCliente(null);
          setFormData({
            nome: "",
            razaoSocial: "",
            tipo: "fisica",
            documento: "",
            email: "",
            telefone: "",
            celular: "",
            endereco: "",
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
      razaoSocial: cliente.razaoSocial || "",
      tipo: cliente.tipo,
      documento: cliente.documento,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      celular: cliente.celular || "",
      endereco: cliente.endereco || "",
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
      razaoSocial: "",
      tipo: "fisica",
      documento: "",
      email: "",
      telefone: "",
      celular: "",
      endereco: "",
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

    // Busca
    if (debouncedSearch.length >= 2) {
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
  }, [clientes, statusFilter, tipoFilter, debouncedSearch, sortField, sortDirection]);

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

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingCliente ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  }}
                  maxLength={formData.tipo === "fisica" ? 14 : 18}
                  required
                />
              </FormField>

              <FormField label="Nome" required fieldId="nome">
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </FormField>

              {formData.tipo === "juridica" && (
                <FormField label="Razão Social" fieldId="razaoSocial">
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  />
                </FormField>
              )}

              <FormField label="Email" fieldId="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>

              <FormField label="Telefone" fieldId="telefone">
                <Input
                  id="telefone"
                  value={formatPhone(formData.telefone)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, telefone: value });
                  }}
                  maxLength={14}
                />
              </FormField>

              <FormField label="Celular" fieldId="celular">
                <Input
                  id="celular"
                  value={formatPhone(formData.celular)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, celular: value });
                  }}
                  maxLength={15}
                />
              </FormField>

              <FormField label="CEP" fieldId="cep">
                <Input
                  id="cep"
                  value={formatCEP(formData.cep)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, cep: value });
                  }}
                  maxLength={9}
                />
              </FormField>

              <FormField label="Endereço" fieldId="endereco" className="md:col-span-2">
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </FormField>

              <FormField label="Cidade" fieldId="cidade">
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </FormField>

              <FormField label="Estado (UF)" fieldId="estado">
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value.toUpperCase().slice(0, 2) })
                  }
                  maxLength={2}
                />
              </FormField>

              <FormTextarea
                label="Observações"
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="md:col-span-2"
              />
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
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            {cliente.razaoSocial && (
                              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
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
                          {cliente.email && (
                            <p className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {cliente.email}
                            </p>
                          )}
                          {cliente.telefone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              {formatPhone(cliente.telefone)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {cliente.endereco ? (
                          <p className="text-sm flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {cliente.cidade}, {cliente.estado}
                          </p>
                        ) : (
                          <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                            -
                          </span>
                        )}
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
