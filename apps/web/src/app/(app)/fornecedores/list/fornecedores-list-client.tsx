"use client";

import { Button } from "@morina/ui";
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  X,
  Grid,
  List as ListIcon,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSuppliers, useSupplier } from "@/hooks/use-suppliers";
import type { Supplier } from "@/lib/api/suppliers";
import { suppliersApi } from "@/lib/api/suppliers";
import { motion } from "framer-motion";
import { fichasCustoApi } from "@/lib/api/fichas-custo";
import type { Insumo } from "@/lib/api/fichas-custo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@morina/ui";
import {
  exportSuppliersToCSV,
  exportSuppliersToExcel,
  exportSuppliersToJSON,
  exportSupplierToPDF,
} from "@/lib/utils/export-suppliers";
import { notificationCenter } from "@/components/notifications/notification-center";

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

// Tipo para fornecedores que vêm de fichas-custo (apenas nome)
type FornecedorFichaCusto = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: "ativo";
  notes: string | null;
  createdBy: "sistema";
  updatedBy: "sistema";
  createdAt: string;
  updatedAt: string;
  orgId: string;
  origem: "ficha-custo"; // Identificador de origem
};

type FornecedorCompleto = Supplier | FornecedorFichaCusto;

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "ativo":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "inativo":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "suspenso":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
};

type ViewMode = "grid" | "list";

export function FornecedoresListClient() {
  const router = useRouter();
  const orgId = getCurrentOrgId() || "";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<"name" | "createdAt" | "updatedAt" | "status">("createdAt");
  const [ordem, setOrdem] = useState<"asc" | "desc">("desc");
  const { suppliers, total, pagina, tamanhoPagina, totalPaginas, loading, listar, setPagina, setTamanhoPagina } = useSuppliers(orgId);
  const [fornecedoresFichasCusto, setFornecedoresFichasCusto] = useState<FornecedorFichaCusto[]>([]);
  const [loadingFichasCusto, setLoadingFichasCusto] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const { deletar } = useSupplier(orgId);

  // Carregar fornecedores de fichas-custo
  const carregarFornecedoresFichasCusto = useCallback(async () => {
    if (!orgId) return;

    setLoadingFichasCusto(true);
    try {
      // Buscar todas as fichas de custo
      const resultado = await fichasCustoApi.listar(orgId, { pagina: 1, tamanhoPagina: 1000 });

      // Extrair fornecedores únicos dos insumos
      const fornecedoresMap = new Map<string, FornecedorFichaCusto>();

      resultado.itens.forEach((ficha) => {
        ficha.insumos.forEach((insumo: Insumo) => {
          if (insumo.fornecedorNome && !insumo.fornecedorId) {
            // Fornecedor cadastrado apenas pelo nome (não tem ID)
            const nomeNormalizado = insumo.fornecedorNome.trim().toLowerCase();
            if (!fornecedoresMap.has(nomeNormalizado)) {
              fornecedoresMap.set(nomeNormalizado, {
                id: `ficha-custo-${nomeNormalizado.replace(/\s+/g, "-")}`,
                name: insumo.fornecedorNome.trim(),
                email: null,
                phone: null,
                document: insumo.fornecedorCnpj || null,
                address: null,
                city: null,
                state: null,
                zipCode: null,
                status: "ativo",
                notes: null,
                createdBy: "sistema",
                updatedBy: "sistema",
                createdAt: ficha.createdAt,
                updatedAt: ficha.updatedAt,
                orgId: ficha.orgId,
                origem: "ficha-custo",
              });
            }
          }
        });
      });

      setFornecedoresFichasCusto(Array.from(fornecedoresMap.values()));
    } catch (error) {
      console.error("Erro ao carregar fornecedores de fichas-custo:", error);
    } finally {
      setLoadingFichasCusto(false);
    }
  }, [orgId]);

  // Combinar fornecedores cadastrados com fornecedores de fichas-custo
  const fornecedoresCompletos = useMemo<FornecedorCompleto[]>(() => {
    const todos: FornecedorCompleto[] = [...suppliers];

    // Adicionar fornecedores de fichas-custo que não estão cadastrados
    fornecedoresFichasCusto.forEach((fornecedorFC) => {
      const jaExiste = suppliers.some(
        (s) => s.name.toLowerCase() === fornecedorFC.name.toLowerCase()
      );
      if (!jaExiste) {
        todos.push(fornecedorFC);
      }
    });

    return todos;
  }, [suppliers, fornecedoresFichasCusto]);

  // Ações em lote
  const handleBulkStatusChange = useCallback(async (novoStatus: string) => {
    if (selectedSuppliers.size === 0) return;

    const fornecedoresSelecionados = fornecedoresCompletos.filter((f) =>
      selectedSuppliers.has(f.id) && "orgId" in f
    ) as Supplier[];

    if (fornecedoresSelecionados.length === 0) {
      notificationCenter.add({
        type: "warning",
        title: "Aviso",
        message: "Apenas fornecedores cadastrados podem ter status alterado.",
      });
      return;
    }

    // Confirmação
    const statusLabels: Record<string, string> = {
      ativo: "ativar",
      inativo: "desativar",
      suspenso: "suspender",
    };
    const acao = statusLabels[novoStatus] || "alterar status";

    if (!confirm(`Deseja realmente ${acao} ${fornecedoresSelecionados.length} fornecedor(es)?`)) {
      return;
    }

    try {
      // Usar Promise.allSettled para processar todos mesmo se alguns falharem
      const resultados = await Promise.allSettled(
        fornecedoresSelecionados.map((f) =>
          suppliersApi.update(orgId, f.id, { ...f, status: novoStatus })
        )
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled").length;
      const falhas = resultados.filter((r) => r.status === "rejected").length;

      if (falhas > 0) {
        notificationCenter.add({
          type: "warning",
          title: "Atualização parcial",
          message: `${sucessos} fornecedor(es) atualizado(s) com sucesso. ${falhas} falha(ram).`,
        });
      } else {
        notificationCenter.add({
          type: "success",
          title: "Status atualizado",
          message: `${sucessos} fornecedor(es) atualizado(s) com sucesso.`,
        });
      }

      setSelectedSuppliers(new Set());
      await listar({ pagina, tamanhoPagina, ordenarPor, ordem });
      await carregarFornecedoresFichasCusto();
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível atualizar o status dos fornecedores.",
      });
    }
  }, [selectedSuppliers, fornecedoresCompletos, orgId, listar, carregarFornecedoresFichasCusto, pagina, tamanhoPagina, ordenarPor, ordem]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedSuppliers.size === 0) return;

    const fornecedoresSelecionados = fornecedoresCompletos.filter((f) =>
      selectedSuppliers.has(f.id) && "orgId" in f
    ) as Supplier[];

    if (fornecedoresSelecionados.length === 0) {
      notificationCenter.add({
        type: "warning",
        title: "Aviso",
        message: "Apenas fornecedores cadastrados podem ser deletados.",
      });
      return;
    }

    if (!confirm(`Deseja realmente deletar ${fornecedoresSelecionados.length} fornecedor(es)?`)) {
      return;
    }

    try {
      // Usar Promise.allSettled para processar todos mesmo se alguns falharem
      const resultados = await Promise.allSettled(
        fornecedoresSelecionados.map((f) => suppliersApi.delete(orgId, f.id))
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled").length;
      const falhas = resultados.filter((r) => r.status === "rejected").length;

      if (falhas > 0) {
        notificationCenter.add({
          type: "warning",
          title: "Deleção parcial",
          message: `${sucessos} fornecedor(es) deletado(s) com sucesso. ${falhas} falha(ram).`,
        });
      } else {
        notificationCenter.add({
          type: "success",
          title: "Fornecedores deletados",
          message: `${sucessos} fornecedor(es) deletado(s) com sucesso.`,
        });
      }

      setSelectedSuppliers(new Set());
      await listar({ pagina, tamanhoPagina, ordenarPor, ordem });
      await carregarFornecedoresFichasCusto();
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Não foi possível deletar os fornecedores.",
      });
    }
  }, [selectedSuppliers, fornecedoresCompletos, orgId, listar, carregarFornecedoresFichasCusto, pagina, tamanhoPagina, ordenarPor, ordem]);

  const handleBulkExport = useCallback(() => {
    if (selectedSuppliers.size === 0) return;

    const fornecedoresSelecionados = fornecedoresCompletos.filter((f) =>
      selectedSuppliers.has(f.id) && "orgId" in f
    ) as Supplier[];

    if (fornecedoresSelecionados.length === 0) {
      notificationCenter.add({
        type: "warning",
        title: "Aviso",
        message: "Apenas fornecedores cadastrados podem ser exportados.",
      });
      return;
    }

    const format = window.prompt("Escolha o formato:\n1 - CSV\n2 - Excel\n3 - PDF (primeiro fornecedor)\n4 - JSON");

    try {
      if (format === "1") {
        exportSuppliersToCSV(fornecedoresSelecionados);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fornecedoresSelecionados.length} fornecedor(es) exportado(s) em CSV.`,
        });
      } else if (format === "2") {
        exportSuppliersToExcel(fornecedoresSelecionados);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fornecedoresSelecionados.length} fornecedor(es) exportado(s) em Excel.`,
        });
      } else if (format === "3") {
        if (fornecedoresSelecionados.length > 0) {
          exportSupplierToPDF(fornecedoresSelecionados[0]);
          notificationCenter.add({
            type: "info",
            title: "Exportação PDF",
            message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
          });
        }
      } else if (format === "4") {
        exportSuppliersToJSON(fornecedoresSelecionados);
        notificationCenter.add({
          type: "success",
          title: "Exportação concluída",
          message: `${fornecedoresSelecionados.length} fornecedor(es) exportado(s) em JSON.`,
        });
      }
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao exportar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [selectedSuppliers, fornecedoresCompletos]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce dos filtros avançados
  const [debouncedFiltroDocumento, setDebouncedFiltroDocumento] = useState("");
  const [debouncedFiltroCidade, setDebouncedFiltroCidade] = useState("");
  const [debouncedFiltroEstado, setDebouncedFiltroEstado] = useState("");
  const [debouncedFiltroEmail, setDebouncedFiltroEmail] = useState("");
  const [debouncedFiltroTelefone, setDebouncedFiltroTelefone] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltroDocumento(filtroDocumento), 500);
    return () => clearTimeout(timer);
  }, [filtroDocumento]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltroCidade(filtroCidade), 500);
    return () => clearTimeout(timer);
  }, [filtroCidade]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltroEstado(filtroEstado), 500);
    return () => clearTimeout(timer);
  }, [filtroEstado]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltroEmail(filtroEmail), 500);
    return () => clearTimeout(timer);
  }, [filtroEmail]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltroTelefone(filtroTelefone), 500);
    return () => clearTimeout(timer);
  }, [filtroTelefone]);

  // Stats (agora usa total do servidor + fornecedores de fichas-custo)
  const stats = {
    total: total + fornecedoresFichasCusto.length,
    ativos: suppliers.filter((f) => f.status === "ativo").length,
    inativos: suppliers.filter((f) => f.status === "inativo").length,
    fichasCusto: fornecedoresFichasCusto.length,
  };

  const loadFornecedores = useCallback(async () => {
    if (!orgId) return;

    const filtro: any = {
      pagina,
      tamanhoPagina,
      ordenarPor,
      ordem,
    };

    if (statusFilter !== "all") {
      filtro.status = statusFilter;
    }

    // Se houver filtros específicos, usar apenas eles (busca avançada)
    // Caso contrário, usar busca geral
    if (debouncedFiltroDocumento || debouncedFiltroCidade || debouncedFiltroEstado || debouncedFiltroEmail || debouncedFiltroTelefone) {
      if (debouncedFiltroDocumento) filtro.documento = debouncedFiltroDocumento;
      if (debouncedFiltroCidade) filtro.cidade = debouncedFiltroCidade;
      if (debouncedFiltroEstado) filtro.estado = debouncedFiltroEstado;
      if (debouncedFiltroEmail) filtro.email = debouncedFiltroEmail;
      if (debouncedFiltroTelefone) filtro.telefone = debouncedFiltroTelefone;
    } else if (debouncedSearch) {
      filtro.busca = debouncedSearch;
    }

    await listar(filtro);
    await carregarFornecedoresFichasCusto();
  }, [listar, statusFilter, debouncedSearch, orgId, carregarFornecedoresFichasCusto, pagina, tamanhoPagina, ordenarPor, ordem, debouncedFiltroDocumento, debouncedFiltroCidade, debouncedFiltroEstado, debouncedFiltroEmail, debouncedFiltroTelefone]);

  useEffect(() => {
    if (orgId) {
      void loadFornecedores();
    }
  }, [loadFornecedores, orgId]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    if (pagina > 1) {
      setPagina(1);
    }
  }, [statusFilter, debouncedSearch, ordenarPor, ordem, setPagina]);

  // Filtrar fornecedores (apenas fornecedores de fichas-custo, pois os cadastrados já vêm filtrados do servidor)
  const fornecedoresFiltrados = useMemo(() => {
    let filtrados = fornecedoresCompletos;

    // Filtro de data (apenas para fornecedores de fichas-custo, pois os cadastrados já vêm filtrados)
    if (filtroDataInicio || filtroDataFim) {
      filtrados = filtrados.filter((f) => {
        const dataCriacao = new Date(f.createdAt);
        if (filtroDataInicio && dataCriacao < new Date(filtroDataInicio)) return false;
        if (filtroDataFim && dataCriacao > new Date(filtroDataFim)) return false;
        return true;
      });
    }

    return filtrados;
  }, [fornecedoresCompletos, filtroDataInicio, filtroDataFim]);

  const handleOrdenar = (campo: "name" | "createdAt" | "updatedAt" | "status") => {
    if (ordenarPor === campo) {
      setOrdem(ordem === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(campo);
      setOrdem("asc");
    }
  };

  const OrdenacaoIcon = ({ campo }: { campo: "name" | "createdAt" | "updatedAt" | "status" }) => {
    if (ordenarPor !== campo) {
      return <ArrowUpDown className="h-4 w-4 text-white/40" />;
    }
    return ordem === "asc" ? (
      <ArrowUp className="h-4 w-4 text-[hsl(var(--primary))]" />
    ) : (
      <ArrowDown className="h-4 w-4 text-[hsl(var(--primary))]" />
    );
  };

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
                  Fornecedores
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Sistema Completo de Gestão e Controle de Fornecedores
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white/80">{stats.total} Total</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white/80">{stats.ativos} Ativos</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white/80">{stats.inativos} Inativos</span>
              </div>
              {stats.fichasCusto > 0 && (
                <>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-white/80">{stats.fichasCusto} de Fichas-Custo</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
            <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
              <Search className="h-4 w-4 text-white/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fornecedores..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as any)}
                className="relative px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px] text-sm"
                title="Ordenar por"
              >
                <option value="createdAt" className="bg-[#1a1f3a]">Data de Criação</option>
                <option value="updatedAt" className="bg-[#1a1f3a]">Última Atualização</option>
                <option value="name" className="bg-[#1a1f3a]">Nome</option>
                <option value="status" className="bg-[#1a1f3a]">Status</option>
              </select>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-3"
                onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
                title={ordem === "asc" ? "Ordenação crescente" : "Ordenação decrescente"}
              >
                {ordem === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </motion.div>
            <div className="relative group">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="relative px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer h-[48px]"
              >
                <option value="all" className="bg-[#1a1f3a]">Todos os Status</option>
                <option value="ativo" className="bg-[#1a1f3a]">Ativo</option>
                <option value="inativo" className="bg-[#1a1f3a]">Inativo</option>
                <option value="suspenso" className="bg-[#1a1f3a]">Suspenso</option>
              </select>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4 ${showAdvancedFilters ? "bg-blue-500/20 border-blue-500/30" : ""}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </motion.div>
            <div className="flex gap-2 border border-white/20 rounded-lg p-1 bg-white/5 backdrop-blur-sm">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "grid" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-transparent border-transparent text-white/60 hover:text-white"}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Visualização em grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className={`cursor-pointer h-[40px] w-[40px] p-0 ${viewMode === "list" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-transparent border-transparent text-white/60 hover:text-white"}`}
                  onClick={() => setViewMode("list")}
                  aria-label="Visualização em lista"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1f3a] border-white/20">
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportSuppliersToCSV(fornecedoresFiltrados.filter((f) => "orgId" in f) as Supplier[]);
                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${fornecedoresFiltrados.length} fornecedor(es) exportado(s) em CSV.`,
                        });
                      } catch (error) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro ao exportar",
                          message: error instanceof Error ? error.message : "Erro desconhecido",
                        });
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportSuppliersToExcel(fornecedoresFiltrados.filter((f) => "orgId" in f) as Supplier[]);
                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${fornecedoresFiltrados.length} fornecedor(es) exportado(s) em Excel.`,
                        });
                      } catch (error) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro ao exportar",
                          message: error instanceof Error ? error.message : "Erro desconhecido",
                        });
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportSuppliersToJSON(fornecedoresFiltrados.filter((f) => "orgId" in f) as Supplier[]);
                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${fornecedoresFiltrados.length} fornecedor(es) exportado(s) em JSON.`,
                        });
                      } catch (error) {
                        notificationCenter.add({
                          type: "error",
                          title: "Erro ao exportar",
                          message: error instanceof Error ? error.message : "Erro desconhecido",
                        });
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (fornecedoresFiltrados.length > 0) {
                        const primeiro = fornecedoresFiltrados.find((f) => "orgId" in f) as Supplier | undefined;
                        if (primeiro) {
                          try {
                            exportSupplierToPDF(primeiro);
                            notificationCenter.add({
                              type: "info",
                              title: "Exportação PDF",
                              message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
                            });
                          } catch (error) {
                            notificationCenter.add({
                              type: "error",
                              title: "Erro ao exportar",
                              message: error instanceof Error ? error.message : "Erro desconhecido",
                            });
                          }
                        }
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF (Primeiro)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white h-[48px] px-4"
                  onClick={() => router.push("/fornecedores/import")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[48px] px-4"
                  onClick={() => router.push("/fornecedores/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border border-white/20 bg-white/[0.05] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </h4>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Fechar filtros"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">CPF/CNPJ</label>
                <input
                  type="text"
                  value={filtroDocumento}
                  onChange={(e) => setFiltroDocumento(e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Telefone</label>
                <input
                  type="text"
                  value={filtroTelefone}
                  onChange={(e) => setFiltroTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Cidade</label>
                <input
                  type="text"
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  placeholder="Nome da cidade"
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Estado</label>
                <input
                  type="text"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  placeholder="UF (ex: SP, RJ)"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Data Início</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Data Fim</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => {
                  setFiltroDataInicio("");
                  setFiltroDataFim("");
                  setFiltroDocumento("");
                  setFiltroCidade("");
                  setFiltroEstado("");
                  setFiltroEmail("");
                  setFiltroTelefone("");
                }}
              >
                Limpar
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[36px] px-4"
                onClick={() => {
                  void loadFornecedores();
                }}
              >
                Aplicar
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Barra de Ações em Lote */}
      {selectedSuppliers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {selectedSuppliers.size} fornecedor(es) selecionado(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => handleBulkStatusChange("ativo")}
              >
                Ativar
              </Button>
              <Button
                className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => handleBulkStatusChange("suspenso")}
              >
                Suspender
              </Button>
              <Button
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => handleBulkStatusChange("inativo")}
              >
                Desativar
              </Button>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={() => setSelectedSuppliers(new Set())}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista de Fornecedores */}
      {loading || loadingFichasCusto ? (
        <div className="text-center py-12">
          <p className="text-white/60">Carregando fornecedores...</p>
        </div>
      ) : fornecedoresFiltrados.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Building2 className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {search || statusFilter !== "all"
              ? "Nenhum fornecedor encontrado com os filtros aplicados."
              : "Nenhum fornecedor cadastrado. Clique em 'Novo Fornecedor' para começar."}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {fornecedoresFiltrados.map((fornecedor) => {
            const isFromFichaCusto = "origem" in fornecedor && fornecedor.origem === "ficha-custo";

            return (
              <motion.div
                key={fornecedor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${viewMode === "grid" ? "p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all" : "p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"}`}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white/90">{fornecedor.name}</h3>
                          {isFromFichaCusto && (
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Ficha-Custo
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(fornecedor.status)}`}>
                          {fornecedor.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-white/70">
                      {fornecedor.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{fornecedor.email}</span>
                        </div>
                      )}
                      {fornecedor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{fornecedor.phone}</span>
                        </div>
                      )}
                      {fornecedor.document && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{fornecedor.document}</span>
                        </div>
                      )}
                      {(fornecedor.address || fornecedor.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {[fornecedor.address, fornecedor.city, fornecedor.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {!fornecedor.email && !fornecedor.phone && !fornecedor.document && !fornecedor.address && (
                        <p className="text-xs text-white/50 italic">
                          {isFromFichaCusto
                            ? "Cadastrado apenas pelo nome em fichas de custo"
                            : "Informações adicionais não disponíveis"}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      {!isFromFichaCusto && (
                        <>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px]"
                              onClick={() => router.push(`/fornecedores/${fornecedor.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px]"
                              onClick={() => router.push(`/fornecedores/${fornecedor.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </motion.div>
                        </>
                      )}
                      {isFromFichaCusto && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                          <Button
                            className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[40px]"
                            onClick={() => {
                              // Preencher formulário com dados do fornecedor e redirecionar
                              router.push(`/fornecedores/new?nome=${encodeURIComponent(fornecedor.name)}&documento=${encodeURIComponent(fornecedor.document || "")}`);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Cadastrar Completo
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white/90">{fornecedor.name}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeStyle(fornecedor.status)}`}>
                          {fornecedor.status}
                        </span>
                        {isFromFichaCusto && (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Ficha-Custo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-white/70">
                        {fornecedor.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{fornecedor.email}</span>
                          </div>
                        )}
                        {fornecedor.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{fornecedor.phone}</span>
                          </div>
                        )}
                        {fornecedor.document && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span>{fornecedor.document}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!isFromFichaCusto && (
                        <>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[40px] px-4"
                              onClick={() => router.push(`/fornecedores/${fornecedor.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                              onClick={() => router.push(`/fornecedores/${fornecedor.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </motion.div>
                        </>
                      )}
                      {isFromFichaCusto && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[40px] px-4"
                            onClick={() => {
                              router.push(`/fornecedores/new?nome=${encodeURIComponent(fornecedor.name)}&documento=${encodeURIComponent(fornecedor.document || "")}`);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Cadastrar
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {(totalPaginas > 1 || fornecedoresFichasCusto.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-6 border-t border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/60">
              Mostrando {suppliers.length} de {total} fornecedores cadastrados
              {fornecedoresFichasCusto.length > 0 && ` + ${fornecedoresFichasCusto.length} de fichas-custo`}
            </div>
            <div className="relative group">
              <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
              <select
                value={tamanhoPagina}
                onChange={(e) => {
                  setTamanhoPagina(Number(e.target.value));
                  setPagina(1);
                }}
                className="relative px-3 py-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer text-sm"
              >
                <option value="10" className="bg-[#1a1f3a]">10 por página</option>
                <option value="20" className="bg-[#1a1f3a]">20 por página</option>
                <option value="50" className="bg-[#1a1f3a]">50 por página</option>
                <option value="100" className="bg-[#1a1f3a]">100 por página</option>
              </select>
            </div>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              </motion.div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm font-medium text-white/80">
                  Página {pagina} de {totalPaginas}
                </span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}




