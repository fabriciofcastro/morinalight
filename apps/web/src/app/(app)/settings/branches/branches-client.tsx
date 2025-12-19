"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit,
  Phone,
  Mail,
  Calendar,
  Users,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";
import { BranchAuditPanel } from "@/components/branches/BranchAuditPanel";
import { InteractiveMap } from "@/components/maps/InteractiveMap";

type Branch = {
  branchId: string;
  orgId: string;
  name: string;
  code: string;
  description: string | null;
  cnpj: string | null;
  address: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  } | null;
  phone: string | null;
  email: string | null;
  responsibleUserId: string | null;
  responsibleUser?: {
    email: string;
    displayName: string | null;
  };
  status: "ativo" | "inativo" | "arquivado";
  openingDate: string | null;
  operationalCapacity: number | null;
  departments: string[]; // IDs de departamentos vinculados
  createdAt: string;
  updatedAt: string;
};

type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
};

type SortField = "name" | "code" | "city" | "state" | "openingDate" | "status";
type SortDirection = "asc" | "desc";

export function BranchesClient() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [drawerBusy, setDrawerBusy] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);
  const [selectedBranchForAudit, setSelectedBranchForAudit] = useState<{ id: string; name: string } | null>(null);

  const [branchDraft, setBranchDraft] = useState<{
    branchId?: string;
    name: string;
    code: string;
    description: string;
    cnpj: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    phone: string;
    email: string;
    openingDate: string;
    operationalCapacity: string;
    status: Branch["status"];
    responsibleUserId: string;
  }>({
    name: "",
    code: "",
    description: "",
    cnpj: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    phone: "",
    email: "",
    openingDate: "",
    operationalCapacity: "",
    status: "ativo",
    responsibleUserId: "",
  });

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/organizational-units?type=branch", {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as ListResponse<Branch>;
        setBranches(data.itens ?? []);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Falha ao carregar filiais",
        message: "Não foi possível carregar a lista de filiais.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/users?limit=1000", {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as ListResponse<{
          userId: string;
          email: string;
          displayName: string | null;
        }>;
        setUsers(data.itens ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const filteredAndSortedBranches = useMemo(() => {
    let result = branches;

    // Filtro por busca
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.cnpj?.toLowerCase().includes(q) ||
          b.address?.cidade.toLowerCase().includes(q) ||
          b.address?.estado.toLowerCase().includes(q),
      );
    }

    // Ordenação
    result = [...result].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "code":
          aVal = a.code.toLowerCase();
          bVal = b.code.toLowerCase();
          break;
        case "city":
          aVal = a.address?.cidade.toLowerCase() || "";
          bVal = b.address?.cidade.toLowerCase() || "";
          break;
        case "state":
          aVal = a.address?.estado.toLowerCase() || "";
          bVal = b.address?.estado.toLowerCase() || "";
          break;
        case "openingDate":
          aVal = a.openingDate ? new Date(a.openingDate).getTime() : 0;
          bVal = b.openingDate ? new Date(b.openingDate).getTime() : 0;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [branches, search, sortField, sortDirection]);

  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedBranches.slice(start, end);
  }, [filteredAndSortedBranches, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedBranches.length / itemsPerPage);

  const handleSearchCep = async () => {
    const cep = branchDraft.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setBranchDraft((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const openCreate = () => {
    setBranchDraft({
      name: "",
      code: "",
      description: "",
      cnpj: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "Brasil",
      phone: "",
      email: "",
      openingDate: "",
      operationalCapacity: "",
      status: "ativo",
      responsibleUserId: "",
    });
    setDrawerMode("create");
    setDrawerOpen(true);
    void loadUsers();
  };

  const openEdit = (branch: Branch) => {
    setBranchDraft({
      branchId: branch.branchId,
      name: branch.name,
      code: branch.code,
      description: branch.description || "",
      cnpj: branch.cnpj || "",
      cep: branch.address?.cep || "",
      logradouro: branch.address?.logradouro || "",
      numero: branch.address?.numero || "",
      complemento: branch.address?.complemento || "",
      bairro: branch.address?.bairro || "",
      cidade: branch.address?.cidade || "",
      estado: branch.address?.estado || "",
      pais: branch.address?.pais || "Brasil",
      phone: branch.phone || "",
      email: branch.email || "",
      openingDate: branch.openingDate || "",
      operationalCapacity: branch.operationalCapacity?.toString() || "",
      status: branch.status,
      responsibleUserId: branch.responsibleUserId || "",
    });
    setDrawerMode("edit");
    setDrawerOpen(true);
    void loadUsers();
  };

  const saveBranch = async () => {
    if (!branchDraft.name || !branchDraft.code) {
      notificationCenter.add({
        type: "error",
        title: "Campos obrigatórios",
        message: "Nome e código são obrigatórios.",
      });
      return;
    }

    setDrawerBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const payload = {
        name: branchDraft.name,
        code: branchDraft.code,
        description: branchDraft.description || null,
        cnpj: branchDraft.cnpj || null,
        address: {
          cep: branchDraft.cep,
          logradouro: branchDraft.logradouro,
          numero: branchDraft.numero,
          complemento: branchDraft.complemento || null,
          bairro: branchDraft.bairro,
          cidade: branchDraft.cidade,
          estado: branchDraft.estado,
          pais: branchDraft.pais,
        },
        phone: branchDraft.phone || null,
        email: branchDraft.email || null,
        responsibleUserId: branchDraft.responsibleUserId || null,
        openingDate: branchDraft.openingDate || null,
        operationalCapacity: branchDraft.operationalCapacity
          ? Number(branchDraft.operationalCapacity)
          : null,
        status: branchDraft.status,
      };

      const url = drawerMode === "create" ? "/api/organizational-units" : `/api/organizational-units/${branchDraft.branchId}`;
      const method = drawerMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: `Filial ${drawerMode === "create" ? "criada" : "atualizada"} com sucesso.`,
        });
        setDrawerOpen(false);
        void loadBranches();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível salvar a filial.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao salvar filial.",
      });
    } finally {
      setDrawerBusy(false);
    }
  };

  const deleteBranch = async (branchId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta filial?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/organizational-units/${branchId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Filial excluída com sucesso.",
        });
        void loadBranches();
      } else {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Não foi possível excluir a filial.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao excluir filial.",
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar filiais por nome, código, cidade…"
            className="pl-10"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Filial
        </Button>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="py-12 text-center text-white/50">Carregando filiais...</div>
      ) : filteredAndSortedBranches.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-white/20" />
          <p className="mt-4 text-white/60">
            {search ? "Nenhuma filial encontrada." : "Nenhuma filial cadastrada."}
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Toolbar com ordenação e exportação */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-white/70">Ordenar por:</Label>
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value as SortField);
                  setCurrentPage(1);
                }}
                className="flex h-9 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="name">Nome</option>
                <option value="code">Código</option>
                <option value="city">Cidade</option>
                <option value="state">Estado</option>
                <option value="openingDate">Data de Abertura</option>
                <option value="status">Status</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  setCurrentPage(1);
                }}
                className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                title={sortDirection === "asc" ? "Ordenar decrescente" : "Ordenar crescente"}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Exportar para CSV
                const headers = ["Nome", "Código", "CNPJ", "Cidade", "Estado", "Telefone", "Email", "Status", "Data de Abertura"];
                const rows = filteredAndSortedBranches.map((b) => [
                  b.name,
                  b.code,
                  b.cnpj || "",
                  b.address?.cidade || "",
                  b.address?.estado || "",
                  b.phone || "",
                  b.email || "",
                  b.status,
                  b.openingDate || "",
                ]);
                const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `filiais-${new Date().toISOString().split("T")[0]}.csv`;
                link.click();
                notificationCenter.add({
                  type: "success",
                  title: "Exportação",
                  message: "Filiais exportadas com sucesso.",
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedBranches.map((branch) => (
            <GlassCard key={branch.branchId} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
                  </div>
                  <p className="text-xs text-white/40 font-mono">{branch.code}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(branch)}
                    className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBranch(branch.branchId)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-white/70">
                {branch.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-white/40" />
                    <div>
                      <div>{branch.address.logradouro}, {branch.address.numero}</div>
                      <div className="text-xs text-white/50">
                        {branch.address.bairro} - {branch.address.cidade}/{branch.address.estado}
                      </div>
                    </div>
                  </div>
                )}

                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-white/40" />
                    <span>{branch.phone}</span>
                  </div>
                )}

                {branch.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-white/40" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                )}

                {branch.openingDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <span>Abertura: {new Date(branch.openingDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}

                {branch.operationalCapacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/40" />
                    <span>Capacidade: {branch.operationalCapacity} pessoas</span>
                  </div>
                )}

                {branch.responsibleUser && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/40" />
                    <span>
                      Responsável: {branch.responsibleUser.displayName || branch.responsibleUser.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-mono uppercase tracking-wider px-2 py-1",
                      branch.status === "ativo"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : branch.status === "inativo"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30",
                    )}
                  >
                    {branch.status}
                  </span>
                  {branch.departments.length > 0 && (
                    <span className="text-xs text-white/40">
                      {branch.departments.length} departamento{branch.departments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-white/60">
                Mostrando {paginatedBranches.length} de {filteredAndSortedBranches.length} filiais
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-white/70">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {drawerMode === "create" ? "Nova Filial" : "Editar Filial"}
              </h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Dados Básicos */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
                  Dados Básicos
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="branch-name">Nome da Filial *</Label>
                    <Input
                      id="branch-name"
                      value={branchDraft.name}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Filial São Paulo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-code">Código *</Label>
                    <Input
                      id="branch-code"
                      value={branchDraft.code}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="Ex: SP-001"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="branch-description">Descrição</Label>
                    <textarea
                      id="branch-description"
                      value={branchDraft.description}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Descrição da filial"
                      className="flex min-h-[80px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-cnpj">CNPJ</Label>
                    <Input
                      id="branch-cnpj"
                      value={branchDraft.cnpj}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-status">Status</Label>
                    <select
                      id="branch-status"
                      value={branchDraft.status}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, status: e.target.value as Branch["status"] }))
                      }
                      className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="arquivado">Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Endereço</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="branch-cep">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="branch-cep"
                        value={branchDraft.cep}
                        onChange={(e) => setBranchDraft((prev) => ({ ...prev, cep: e.target.value }))}
                        placeholder="00000-000"
                        maxLength={9}
                        onBlur={handleSearchCep}
                      />
                      <Button type="button" onClick={handleSearchCep}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="branch-logradouro">Logradouro</Label>
                    <Input
                      id="branch-logradouro"
                      value={branchDraft.logradouro}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, logradouro: e.target.value }))
                      }
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-numero">Número</Label>
                    <Input
                      id="branch-numero"
                      value={branchDraft.numero}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, numero: e.target.value }))}
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-complemento">Complemento</Label>
                    <Input
                      id="branch-complemento"
                      value={branchDraft.complemento}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, complemento: e.target.value }))
                      }
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-bairro">Bairro</Label>
                    <Input
                      id="branch-bairro"
                      value={branchDraft.bairro}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, bairro: e.target.value }))}
                      placeholder="Bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-cidade">Cidade</Label>
                    <Input
                      id="branch-cidade"
                      value={branchDraft.cidade}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, cidade: e.target.value }))}
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-estado">Estado</Label>
                    <Input
                      id="branch-estado"
                      value={branchDraft.estado}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, estado: e.target.value }))}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-pais">País</Label>
                    <Input
                      id="branch-pais"
                      value={branchDraft.pais}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, pais: e.target.value }))}
                      placeholder="Brasil"
                    />
                  </div>

                  {branchDraft.logradouro && branchDraft.cidade && (
                    <div className="md:col-span-2 mt-2">
                      <InteractiveMap
                        address={{
                          cep: branchDraft.cep,
                          logradouro: branchDraft.logradouro,
                          numero: branchDraft.numero,
                          complemento: branchDraft.complemento,
                          bairro: branchDraft.bairro,
                          cidade: branchDraft.cidade,
                          estado: branchDraft.estado,
                          pais: branchDraft.pais,
                        }}
                        height="400px"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Contato</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="branch-phone">Telefone</Label>
                    <Input
                      id="branch-phone"
                      value={branchDraft.phone}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 3333-3333"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-email">E-mail</Label>
                    <Input
                      id="branch-email"
                      type="email"
                      value={branchDraft.email}
                      onChange={(e) => setBranchDraft((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="filial@morina.com.br"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-responsible">Responsável</Label>
                    <select
                      id="branch-responsible"
                      value={branchDraft.responsibleUserId}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, responsibleUserId: e.target.value }))
                      }
                      disabled={usersLoading}
                      className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecione um responsável...</option>
                      {users.map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.displayName || user.email} {user.displayName ? `(${user.email})` : ""}
                        </option>
                      ))}
                    </select>
                    {usersLoading && (
                      <p className="mt-1 text-xs text-white/50">Carregando usuários...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
                  Informações Adicionais
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="branch-opening-date">Data de Abertura</Label>
                    <Input
                      id="branch-opening-date"
                      type="date"
                      value={branchDraft.openingDate}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, openingDate: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch-capacity">Capacidade Operacional</Label>
                    <Input
                      id="branch-capacity"
                      type="number"
                      value={branchDraft.operationalCapacity}
                      onChange={(e) =>
                        setBranchDraft((prev) => ({ ...prev, operationalCapacity: e.target.value }))
                      }
                      placeholder="Número de pessoas"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={saveBranch} disabled={drawerBusy}>
                {drawerBusy ? "Salvando..." : drawerMode === "create" ? "Criar Filial" : "Salvar Alterações"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Audit Panel */}
      {auditPanelOpen && selectedBranchForAudit && (
        <BranchAuditPanel
          branchId={selectedBranchForAudit.id}
          branchName={selectedBranchForAudit.name}
          onClose={() => {
            setAuditPanelOpen(false);
            setSelectedBranchForAudit(null);
          }}
        />
      )}
    </div>
  );
}




