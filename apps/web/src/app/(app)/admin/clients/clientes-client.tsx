"use client";

import {
  ActionButton,
  ActionToolbar,
  FilterInput,
  Button,
  FormField,
  FormSelect,
  FormTextarea,
  GlassCard,
  Input,
  ListPageLayout,
  StatsGroup,
  StatCard,
  BulkActionsBar,
  ViewToggle,
  Badge,
  DataTable,
  EmptyState,
  cn,
} from "@morina/ui";
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
import { PageShell } from "@/components/layout/PageShell";
import { type ColumnDef } from "@tanstack/react-table";

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
  const [itemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  // Colunas do DataTable
  const columns = useMemo<ColumnDef<Cliente>[]>(
    () => [
      {
        id: "selection",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500"
          />
        ),
      },
      {
        accessorKey: "nome",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-white/5">
              {row.original.tipo === "juridica" ? (
                <Building2 className="h-4 w-4 text-blue-400" />
              ) : (
                <User className="h-4 w-4 text-purple-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white">{row.original.nome}</span>
              {row.original.razaoSocial && (
                <span className="text-xs text-white/40">{row.original.razaoSocial}</span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "documento",
        header: "Documento",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-white/60">
              {row.original.tipo === "fisica"
                ? formatCPF(row.original.documento)
                : formatCNPJ(row.original.documento)}
            </span>
            <button
              onClick={() => handleCopyDocument(row.original.documento)}
              className="opacity-40 hover:opacity-100 transition-opacity"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )
      },
      {
        accessorKey: "contato",
        header: "Contato",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {row.original.email && (
              <span className="text-xs flex items-center gap-1.5 text-white/60">
                <Mail className="h-3 w-3" /> {row.original.email}
              </span>
            )}
            {row.original.celular && (
              <span className="text-xs flex items-center gap-1.5 text-white/60">
                <Phone className="h-3.5 w-3.5" /> {formatPhone(row.original.celular)}
              </span>
            )}
          </div>
        )
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = status === "ativo" ? "success" : status === "inativo" ? "danger" : "warning";
          const Icon = status === "ativo" ? CheckCircle2 : status === "inativo" ? XCircle : AlertCircle;

          return (
            <Badge variant={variant} icon={<Icon className="h-3 w-3" />} size="sm">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCliente(row.original)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    ],
    []
  );

  return (
    <ListPageLayout
      header={{
        title: "Clientes",
        description: "Gerencie o cadastro de clientes da sua organização.",
        icon: Users,
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Clientes", href: "/clientes" },
        ],
        stats: (
          <StatsGroup>
            <StatCard
              icon={Users}
              label="Total"
              value={stats.total}
              variant="primary"
            />
            <StatCard
              icon={CheckCircle2}
              label="Ativos"
              value={stats.ativos}
              variant="success"
            />
            <StatCard
              icon={XCircle}
              label="Inativos"
              value={stats.inativos}
              variant="danger"
            />
            <StatCard
              icon={AlertCircle}
              label="Bloqueados"
              value={stats.bloqueados}
              variant="warning"
            />
          </StatsGroup>
        ),
      }}
      controls={{
        searchValue: search,
        onSearchChange: setSearch,
        searchPlaceholder: "Buscar por nome, documento, email...",
        filterButton: (
          <div className="flex gap-2">
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
          </div>
        ),
        viewToggle: (
          <ViewToggle
            value={viewMode === "table" ? "list" : "grid"}
            onChange={(mode) => setViewMode(mode === "list" ? "table" : "cards")}
          />
        ),
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] border-0 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        ),
        bulkActions: (
          <BulkActionsBar
            selectedCount={selectedClientes.size}
            onCancel={() => setSelectedClientes(new Set())}
            actions={[
              {
                label: "Ativar",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => handleBulkAction("activate"),
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => handleBulkAction("delete"),
                variant: "destructive",
              },
            ]}
          />
        ),
        hasSelection: selectedClientes.size > 0,
      }}
      pagination={{
        total: filteredAndSortedClientes.length,
        page: currentPage,
        pageSize: itemsPerPage,
        onPageChange: setCurrentPage,
      }}
    >
      <div className="space-y-6">
        {/* Formulário */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
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
                        className="bg-white/5 border-white/10"
                      />
                    </FormField>

                    <FormTextarea
                      label="Observações"
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="md:col-span-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={pending}>
                      {pending ? "Salvando..." : editingCliente ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de clientes */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : filteredAndSortedClientes.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="Nenhum cliente encontrado"
            description={
              search || statusFilter !== "all" || tipoFilter !== "all"
                ? "Tente ajustar os filtros de busca para encontrar o que procura."
                : "Comece cadastrando seu primeiro cliente no sistema."
            }
            action={
              !search && statusFilter === "all" && tipoFilter === "all" ? (
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] border-0 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Cliente
                </Button>
              ) : undefined
            }
          />
        ) : viewMode === "cards" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {paginatedClientes.map((cliente, index) => (
                <motion.div
                  key={cliente.clienteId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => toggleSelectCliente(cliente.clienteId)}
                >
                  <GlassCard
                    className={cn(
                      "p-6 group relative overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer",
                      selectedClientes.has(cliente.clienteId) && "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                          {cliente.tipo === "juridica" ? (
                            <Building2 className="h-5 w-5 text-blue-400" />
                          ) : (
                            <User className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                            {cliente.nome}
                          </h3>
                          <p className="text-xs text-white/40 font-mono">
                            {cliente.tipo === "fisica" ? "CPF" : "CNPJ"}:{" "}
                            {cliente.tipo === "fisica"
                              ? formatCPF(cliente.documento)
                              : formatCNPJ(cliente.documento)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={cliente.status === "ativo" ? "success" : cliente.status === "inativo" ? "danger" : "warning"}
                        size="sm"
                      >
                        {cliente.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-white/60 mb-6">
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
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {cliente.cidade} - {cliente.estado}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCliente(cliente);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(cliente);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAndSortedClientes}
            emptyMessage="Nenhum cliente encontrado"
            enableRowSelection
            state={{
              rowSelection: Object.fromEntries(
                Array.from(selectedClientes).map((id) => {
                  const index = filteredAndSortedClientes.findIndex((c) => c.clienteId === id);
                  return index !== -1 ? [index, true] : null;
                }).filter(Boolean) as [string | number, boolean][]
              )
            }}
            onRowSelectionChange={(updater) => {
              if (typeof updater === "function") {
                const newState = updater({});
                const newSelected = new Set<string>();
                Object.keys(newState).forEach((key) => {
                  const index = parseInt(key);
                  if (filteredAndSortedClientes[index]) {
                    newSelected.add(filteredAndSortedClientes[index].clienteId);
                  }
                });
                setSelectedClientes(newSelected);
              }
            }}
          />
        )}

        {/* Modal de detalhes */}
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
    </ListPageLayout>
  );
}
