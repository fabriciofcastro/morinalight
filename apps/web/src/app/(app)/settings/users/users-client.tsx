"use client";

import { Button, GlassCard, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
  Download,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  Search,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";
import { UserDetailsPanel } from "./user-details-panel";
import { CreateUserDrawer } from "./create-user-drawer";

type UserData = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended" | "inactive";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais que podem vir do backend
  cpf?: string | null;
  phone?: string | null;
  position?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
};

type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
  total?: number;
};

type FilterState = {
  status: "all" | "pending" | "active" | "suspended" | "inactive";
  department: string | null;
  sector: string | null;
  position: string | null;
  admissionDateRange: {
    from: string | null;
    to: string | null;
  };
  lastAccessRange: {
    from: string | null;
    to: string | null;
  };
};

type SortState = {
  field: "name" | "email" | "createdAt" | "lastLogin" | "position";
  direction: "asc" | "desc";
};

export function UsersClient() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    department: null,
    sector: null,
    position: null,
    admissionDateRange: { from: null, to: null },
    lastAccessRange: { from: null, to: null },
  });
  const [sort, setSort] = useState<SortState>({
    field: "name",
    direction: "asc",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; entityType: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [sectors, setSectors] = useState<Array<{ id: string; name: string }>>([]);
  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const params = new URLSearchParams();
      if (search.trim()) params.set("busca", search.trim());
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.department) params.set("departmentId", filters.department);
      if (filters.sector) params.set("sectorId", filters.sector);
      if (filters.position) params.set("positionId", filters.position);
      if (filters.admissionDateRange.from) params.set("admissionDateFrom", filters.admissionDateRange.from);
      if (filters.admissionDateRange.to) params.set("admissionDateTo", filters.admissionDateRange.to);
      if (filters.lastAccessRange.from) params.set("lastAccessFrom", filters.lastAccessRange.from);
      if (filters.lastAccessRange.to) params.set("lastAccessTo", filters.lastAccessRange.to);
      params.set("sortBy", sort.field);
      params.set("sortDir", sort.direction);
      params.set("page", page.toString());
      params.set("limit", itemsPerPage.toString());

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as ListResponse<UserData>;
        setUsers(data.itens ?? []);
      } else {
        notificationCenter.add({
          type: "error",
          title: "Erro ao carregar usuários",
          message: "Não foi possível carregar a lista de usuários.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao carregar usuários.",
      });
    } finally {
      setLoading(false);
    }
  }, [search, filters, sort, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Carregar templates de permissões
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const headers = {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        };
        const response = await fetch("/api/permissions/templates", { headers });
        if (response.ok) {
          const data = (await response.json()) as { itens: Array<{ id: string; name: string; entityType: string }> };
          setTemplates(data.itens || []);
        }
      } catch (e) {
        console.error("Erro ao carregar templates:", e);
      }
    };
    void loadTemplates();
  }, []);

  // Carregar departamentos, setores e cargos para os filtros
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const headers = {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        };

        const [deptRes, sectorRes, posRes] = await Promise.all([
          fetch("/api/departments", { headers }),
          fetch("/api/sectors", { headers }),
          fetch("/api/positions", { headers }),
        ]);

        if (deptRes.ok) {
          const data = (await deptRes.json()) as { itens: Array<{ id: string; name: string }> };
          setDepartments(data.itens || []);
        }
        if (sectorRes.ok) {
          const data = (await sectorRes.json()) as { itens: Array<{ id: string; name: string }> };
          setSectors(data.itens || []);
        }
        if (posRes.ok) {
          const data = (await posRes.json()) as { itens: Array<{ id: string; name: string }> };
          setPositions(data.itens || []);
        }
      } catch (e) {
        console.error("Erro ao carregar opções de filtro:", e);
      }
    };
    void loadFilterOptions();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Aplicar busca local (se necessário, já vem filtrado do backend)
    const searchQuery = search.trim().toLowerCase();
    if (searchQuery) {
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(searchQuery) ||
          u.email.toLowerCase().includes(searchQuery) ||
          u.cpf?.toLowerCase().includes(searchQuery) ||
          u.position?.name.toLowerCase().includes(searchQuery) ||
          u.department?.name.toLowerCase().includes(searchQuery),
      );
    }

    // Ordenação local (se necessário)
    result.sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sort.field) {
        case "name":
          aVal = a.displayName || a.email;
          bVal = b.displayName || b.email;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "lastLogin":
          aVal = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          bVal = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        case "position":
          aVal = a.position?.name || "";
          bVal = b.position?.name || "";
          break;
      }

      if (aVal === null || bVal === null) return 0;
      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, sort]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u.userId === selectedUserId) || null;
  }, [users, selectedUserId]);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.department !== null ||
    filters.sector !== null ||
    filters.position !== null ||
    filters.admissionDateRange.from !== null ||
    filters.admissionDateRange.to !== null ||
    filters.lastAccessRange.from !== null ||
    filters.lastAccessRange.to !== null;

  const statusCounts = useMemo(() => {
    const counts = {
      all: users.length,
      active: 0,
      pending: 0,
      suspended: 0,
      inactive: 0,
    };

    users.forEach((u) => {
      if (u.status === "active") counts.active++;
      else if (u.status === "pending") counts.pending++;
      else if (u.status === "suspended") counts.suspended++;
      else if (u.status === "inactive") counts.inactive++;
    });

    return counts;
  }, [users]);

  return (
    <div className="flex h-full w-full gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email, CPF, cargo…"
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(hasActiveFilters && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]")}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (filteredUsers.length === 0) {
                          notificationCenter.add({
                            type: "warning",
                            title: "Nenhum dado para exportar",
                            message: "Não há usuários para exportar com os filtros aplicados.",
                          });
                          return;
                        }

                        const exportData = filteredAndSortedUsers.map((user) => ({
                          ID: user.userId,
                          Email: user.email,
                          Nome: user.displayName || "",
                          CPF: user.cpf || "",
                          Telefone: user.phone || "",
                          Status: user.status === "active" ? "Ativo" : user.status === "pending" ? "Pendente" : user.status === "suspended" ? "Suspenso" : "Inativo",
                          Cargo: user.position?.name || "",
                          Departamento: user.department?.name || "",
                          "Último Acesso": user.lastLogin ? new Date(user.lastLogin).toLocaleString("pt-BR") : "Nunca",
                          "Data de Criação": user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "",
                          "Data de Atualização": user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("pt-BR") : "",
                        }));

                        const headers = Object.keys(exportData[0] || {});
                        const csvRows = [
                          headers.join(","),
                          ...exportData.map((row) =>
                            headers
                              .map((header) => {
                                const value = row[header as keyof typeof row];
                                if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                                  return `"${value.replace(/"/g, '""')}"`;
                                }
                                return value;
                              })
                              .join(","),
                          ),
                        ];

                        const csvContent = csvRows.join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${filteredAndSortedUsers.length} usuário(s) exportado(s) em CSV com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao exportar CSV:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro na exportação",
                          message: "Não foi possível exportar os usuários em CSV.",
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (filteredUsers.length === 0) {
                          notificationCenter.add({
                            type: "warning",
                            title: "Nenhum dado para exportar",
                            message: "Não há usuários para exportar com os filtros aplicados.",
                          });
                          return;
                        }

                        // Para Excel, vamos gerar um CSV com extensão .xlsx ou usar uma biblioteca
                        // Por enquanto, vamos gerar um CSV com BOM UTF-8 para melhor compatibilidade com Excel
                        const exportData = filteredAndSortedUsers.map((user) => ({
                          ID: user.userId,
                          Email: user.email,
                          Nome: user.displayName || "",
                          CPF: user.cpf || "",
                          Telefone: user.phone || "",
                          Status: user.status === "active" ? "Ativo" : user.status === "pending" ? "Pendente" : user.status === "suspended" ? "Suspenso" : "Inativo",
                          Cargo: user.position?.name || "",
                          Departamento: user.department?.name || "",
                          "Último Acesso": user.lastLogin ? new Date(user.lastLogin).toLocaleString("pt-BR") : "Nunca",
                          "Data de Criação": user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "",
                          "Data de Atualização": user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("pt-BR") : "",
                        }));

                        const headers = Object.keys(exportData[0] || {});
                        const csvRows = [
                          headers.join("\t"), // Excel usa tabulação
                          ...exportData.map((row) =>
                            headers
                              .map((header) => {
                                const value = row[header as keyof typeof row];
                                return value;
                              })
                              .join("\t"),
                          ),
                        ];

                        const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM UTF-8 para Excel
                        const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `usuarios_${new Date().toISOString().split("T")[0]}.xls`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${filteredAndSortedUsers.length} usuário(s) exportado(s) em Excel com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao exportar Excel:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro na exportação",
                          message: "Não foi possível exportar os usuários em Excel.",
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" disabled={selectedUserIds.size === 0}>
                  <Users className="h-4 w-4" />
                  Ações em Massa
                  {selectedUserIds.size > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
                      {selectedUserIds.size}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedUserIds.size === 0) {
                        notificationCenter.add({
                          type: "warning",
                          title: "Nenhum usuário selecionado",
                          message: "Selecione pelo menos um usuário para realizar esta ação.",
                        });
                        return;
                      }

                      const action = confirm(
                        `Deseja ${users.filter((u) => selectedUserIds.has(u.userId) && u.status === "active").length > 0 ? "desativar" : "ativar"} ${selectedUserIds.size} usuário(s)?`,
                      );
                      if (!action) return;

                      try {
                        const headers = {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        };

                        const promises = Array.from(selectedUserIds).map(async (userId) => {
                          const user = users.find((u) => u.userId === userId);
                          if (!user) return;

                          const newStatus = user.status === "active" ? "inactive" : "active";
                          const response = await fetch(`/api/users/${userId}`, {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ status: newStatus }),
                          });

                          if (!response.ok) {
                            throw new Error(`Erro ao atualizar usuário ${user.email}`);
                          }
                        });

                        await Promise.all(promises);
                        setSelectedUserIds(new Set());
                        void loadUsers();

                        notificationCenter.add({
                          type: "success",
                          title: "Sucesso",
                          message: `${selectedUserIds.size} usuário(s) ${users.filter((u) => selectedUserIds.has(u.userId) && u.status === "active").length > 0 ? "desativado(s)" : "ativado(s)"} com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao atualizar usuários:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro",
                          message: "Não foi possível atualizar todos os usuários. Tente novamente.",
                        });
                      }
                    }}
                    disabled={selectedUserIds.size === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="h-4 w-4" />
                    Ativar/Desativar Múltiplos
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedUserIds.size === 0) {
                        notificationCenter.add({
                          type: "warning",
                          title: "Nenhum usuário selecionado",
                          message: "Selecione pelo menos um usuário para enviar convites.",
                        });
                        return;
                      }

                      const action = confirm(
                        `Deseja enviar convites de reativação para ${selectedUserIds.size} usuário(s)?`,
                      );
                      if (!action) return;

                      try {
                        const headers = {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        };

                        const promises = Array.from(selectedUserIds).map(async (userId) => {
                          const response = await fetch(`/api/users/${userId}/invite`, {
                            method: "POST",
                            headers,
                          });

                          if (!response.ok) {
                            throw new Error(`Erro ao enviar convite para usuário ${userId}`);
                          }
                        });

                        await Promise.all(promises);
                        setSelectedUserIds(new Set());

                        notificationCenter.add({
                          type: "success",
                          title: "Convites enviados",
                          message: `${selectedUserIds.size} convite(s) de reativação enviado(s) com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao enviar convites:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro",
                          message: "Não foi possível enviar todos os convites. Tente novamente.",
                        });
                      }
                    }}
                    disabled={selectedUserIds.size === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar Convites de Reativação
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedUserIds.size === 0) {
                        notificationCenter.add({
                          type: "warning",
                          title: "Nenhum usuário selecionado",
                          message: "Selecione pelo menos um usuário para exportar.",
                        });
                        return;
                      }

                      try {
                        const selectedUsers = users.filter((u) => selectedUserIds.has(u.userId));
                        const exportData = selectedUsers.map((user) => ({
                          ID: user.userId,
                          Email: user.email,
                          Nome: user.displayName || "",
                          CPF: user.cpf || "",
                          Telefone: user.phone || "",
                          Status: user.status === "active" ? "Ativo" : user.status === "pending" ? "Pendente" : user.status === "suspended" ? "Suspenso" : "Inativo",
                          Cargo: user.position?.name || "",
                          Departamento: user.department?.name || "",
                          "Último Acesso": user.lastLogin ? new Date(user.lastLogin).toLocaleString("pt-BR") : "Nunca",
                          "Data de Admissão": user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "",
                        }));

                        const headers = Object.keys(exportData[0] || {});
                        const csvRows = [
                          headers.join(","),
                          ...exportData.map((row) =>
                            headers
                              .map((header) => {
                                const value = row[header as keyof typeof row];
                                if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                                  return `"${value.replace(/"/g, '""')}"`;
                                }
                                return value;
                              })
                              .join(","),
                          ),
                        ];

                        const csvContent = csvRows.join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `usuarios_selecionados_${new Date().toISOString().split("T")[0]}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        notificationCenter.add({
                          type: "success",
                          title: "Exportação concluída",
                          message: `${selectedUserIds.size} usuário(s) exportado(s) com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao exportar usuários:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro na exportação",
                          message: "Não foi possível exportar os usuários selecionados.",
                        });
                      }
                    }}
                    disabled={selectedUserIds.size === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Selecionados
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedUserIds.size === 0) {
                        notificationCenter.add({
                          type: "warning",
                          title: "Nenhum usuário selecionado",
                          message: "Selecione pelo menos um usuário para aplicar template.",
                        });
                        return;
                      }

                      if (templates.length === 0) {
                        notificationCenter.add({
                          type: "warning",
                          title: "Nenhum template disponível",
                          message: "Não há templates de permissões disponíveis.",
                        });
                        return;
                      }

                      const templateName = prompt(
                        `Digite o nome do template para aplicar a ${selectedUserIds.size} usuário(s):\n\nTemplates disponíveis:\n${templates.map((t) => `- ${t.name}`).join("\n")}`,
                      );

                      if (!templateName) return;

                      const template = templates.find((t) => t.name.toLowerCase() === templateName.toLowerCase());
                      if (!template) {
                        notificationCenter.add({
                          type: "error",
                          title: "Template não encontrado",
                          message: `Template "${templateName}" não foi encontrado.`,
                        });
                        return;
                      }

                      const action = confirm(
                        `Deseja aplicar o template "${template.name}" a ${selectedUserIds.size} usuário(s)?`,
                      );
                      if (!action) return;

                      try {
                        const headers = {
                          ...getAuthHeadersWithTenant(),
                          "Content-Type": "application/json",
                        };

                        const promises = Array.from(selectedUserIds).map(async (userId) => {
                          const response = await fetch(`/api/permissions/templates/${template.id}/apply`, {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                              entityType: "user",
                              entityId: userId,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error(`Erro ao aplicar template para usuário ${userId}`);
                          }
                        });

                        await Promise.all(promises);
                        setSelectedUserIds(new Set());

                        notificationCenter.add({
                          type: "success",
                          title: "Template aplicado",
                          message: `Template "${template.name}" aplicado a ${selectedUserIds.size} usuário(s) com sucesso.`,
                        });
                      } catch (error) {
                        console.error("Erro ao aplicar template:", error);
                        notificationCenter.add({
                          type: "error",
                          title: "Erro",
                          message: "Não foi possível aplicar o template a todos os usuários. Tente novamente.",
                        });
                      }
                    }}
                    disabled={selectedUserIds.size === 0 || templates.length === 0}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Users className="h-4 w-4" />
                    Aplicar Template de Permissões
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Importar CSV/Excel
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-file" className="mb-2 block text-sm font-medium text-white">
                      Selecionar arquivo
                    </Label>
                    <input
                      id="import-file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          const formData = new FormData();
                          formData.append("file", file);

                          const headers = getAuthHeadersWithTenant();
                          // Remover Content-Type para permitir que o browser defina com boundary
                          delete headers["Content-Type"];

                          const response = await fetch("/api/users/import", {
                            method: "POST",
                            headers,
                            body: formData,
                          });

                          if (response.ok) {
                            const data = await response.json();
                            notificationCenter.add({
                              type: "success",
                              title: "Importação concluída",
                              message: `${data.imported || 0} usuário(s) importado(s) com sucesso. ${data.errors?.length ? `${data.errors.length} erro(s) encontrado(s).` : ""}`,
                            });
                            void loadUsers();
                          } else {
                            const error = await response.json();
                            notificationCenter.add({
                              type: "error",
                              title: "Erro na importação",
                              message: error.message || "Não foi possível importar o arquivo.",
                            });
                          }
                        } catch (error) {
                          console.error("Erro ao importar arquivo:", error);
                          notificationCenter.add({
                            type: "error",
                            title: "Erro na importação",
                            message: "Erro inesperado ao importar o arquivo.",
                          });
                        }

                        // Resetar input
                        e.target.value = "";
                      }}
                    />
                    <label
                      htmlFor="import-file"
                      className="flex cursor-pointer items-center justify-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Escolher arquivo CSV/Excel
                    </label>
                  </div>
                  <div className="text-xs text-white/50">
                    <p className="mb-1">Formato esperado:</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Email (obrigatório)</li>
                      <li>Nome (opcional)</li>
                      <li>CPF (opcional)</li>
                      <li>Telefone (opcional)</li>
                      <li>Status (opcional)</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button type="button" onClick={() => setCreateDrawerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid gap-4 md:grid-cols-5">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Total</p>
                <p className="text-2xl font-bold text-white">{statusCounts.all}</p>
              </div>
              <Users className="h-8 w-8 text-white/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Ativos</p>
                <p className="text-2xl font-bold text-green-400">{statusCounts.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
              </div>
              <Mail className="h-8 w-8 text-yellow-400/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Suspensos</p>
                <p className="text-2xl font-bold text-red-400">{statusCounts.suspended}</p>
              </div>
              <UserX className="h-8 w-8 text-red-400/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Inativos</p>
                <p className="text-2xl font-bold text-gray-400">{statusCounts.inactive}</p>
              </div>
              <User className="h-8 w-8 text-gray-400/30" />
            </div>
          </GlassCard>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      status: "all",
                      department: null,
                      sector: null,
                      position: null,
                      admissionDateRange: { from: null, to: null },
                      lastAccessRange: { from: null, to: null },
                    });
                  }}
                >
                  Limpar Todos
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value as FilterState["status"] }))
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="pending">Pendentes</option>
                  <option value="suspended">Suspensos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>

              <div>
                <Label htmlFor="filter-department">Departamento</Label>
                <select
                  id="filter-department"
                  value={filters.department || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, department: e.target.value || null }))
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Todos</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="filter-sector">Setor</Label>
                <select
                  id="filter-sector"
                  value={filters.sector || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sector: e.target.value || null }))
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Todos</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="filter-position">Cargo</Label>
                <select
                  id="filter-position"
                  value={filters.position || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, position: e.target.value || null }))
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Todos</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="filter-admission-from">Data de Admissão (De)</Label>
                <Input
                  id="filter-admission-from"
                  type="date"
                  value={filters.admissionDateRange.from || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      admissionDateRange: { ...prev.admissionDateRange, from: e.target.value || null },
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-admission-to">Data de Admissão (Até)</Label>
                <Input
                  id="filter-admission-to"
                  type="date"
                  value={filters.admissionDateRange.to || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      admissionDateRange: { ...prev.admissionDateRange, to: e.target.value || null },
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-last-access-from">Último Acesso (De)</Label>
                <Input
                  id="filter-last-access-from"
                  type="date"
                  value={filters.lastAccessRange.from || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      lastAccessRange: { ...prev.lastAccessRange, from: e.target.value || null },
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-last-access-to">Último Acesso (Até)</Label>
                <Input
                  id="filter-last-access-to"
                  type="date"
                  value={filters.lastAccessRange.to || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      lastAccessRange: { ...prev.lastAccessRange, to: e.target.value || null },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Users List */}
        <GlassCard className="overflow-hidden">
          {selectedUserIds.size > 0 && (
            <div className="border-b border-white/10 bg-[hsl(var(--primary)/0.1)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {selectedUserIds.size} usuário(s) selecionado(s)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserIds(new Set())}
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={filteredAndSortedUsers.length > 0 && selectedUserIds.size === filteredAndSortedUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds(new Set(filteredAndSortedUsers.map((u) => u.userId)));
                        } else {
                          setSelectedUserIds(new Set());
                        }
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) => ({
                          field: "name",
                          direction: prev.field === "name" && prev.direction === "asc" ? "desc" : "asc",
                        }))
                      }
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Usuário
                      {sort.field === "name" && (
                        <span className="text-[hsl(var(--primary))]">
                          {sort.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) => ({
                          field: "email",
                          direction: prev.field === "email" && prev.direction === "asc" ? "desc" : "asc",
                        }))
                      }
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Email
                      {sort.field === "email" && (
                        <span className="text-[hsl(var(--primary))]">
                          {sort.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) => ({
                          field: "position",
                          direction:
                            prev.field === "position" && prev.direction === "asc" ? "desc" : "asc",
                        }))
                      }
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Cargo/Setor
                      {sort.field === "position" && (
                        <span className="text-[hsl(var(--primary))]">
                          {sort.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) => ({
                          field: "lastLogin",
                          direction:
                            prev.field === "lastLogin" && prev.direction === "asc" ? "desc" : "asc",
                        }))
                      }
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Último Acesso
                      {sort.field === "lastLogin" && (
                        <span className="text-[hsl(var(--primary))]">
                          {sort.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) => ({
                          field: "createdAt",
                          direction:
                            prev.field === "createdAt" && prev.direction === "asc" ? "desc" : "asc",
                        }))
                      }
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Data de Admissão
                      {sort.field === "createdAt" && (
                        <span className="text-[hsl(var(--primary))]">
                          {sort.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-white/50">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-white/50">
                      {search ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user.userId}
                      className={cn(
                        "hover:bg-white/5 transition-colors",
                        selectedUserId === user.userId && "bg-[hsl(var(--primary)/0.1)]",
                        selectedUserIds.has(user.userId) && "bg-[hsl(var(--primary)/0.05)]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.userId)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedUserIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) {
                                next.add(user.userId);
                              } else {
                                next.delete(user.userId);
                              }
                              return next;
                            });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td
                        className="px-4 py-3"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(user.userId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedUserId(user.userId);
                            }
                          }}
                          className="w-full text-left"
                        >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.displayName || user.email}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-sm font-semibold text-white">
                                {(user.displayName || user.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            {/* Indicador online/offline */}
                            <div
                              className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[hsl(var(--surface))]",
                                // TODO: Verificar status real do usuário
                                Math.random() > 0.5
                                  ? "bg-green-500"
                                  : "bg-gray-400",
                              )}
                              title={Math.random() > 0.5 ? "Online" : "Offline"}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">
                                {user.displayName || "Sem nome"}
                              </span>
                              {/* Badge "Novo" (últimos 7 dias) */}
                              {user.createdAt &&
                                new Date(user.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                                  <span className="rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
                                    Novo
                                  </span>
                                )}
                            </div>
                            {user.displayName && (
                              <div className="text-xs text-white/50">{user.email}</div>
                            )}
                          </div>
                        </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        {user.position ? (
                          <div>
                            <div>{user.position.name}</div>
                            {user.department && (
                              <div className="text-xs text-white/50">{user.department.name}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "Nunca"}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded px-2 py-1 text-xs font-mono uppercase tracking-wider",
                            user.status === "active" &&
                              "bg-green-500/20 text-green-400 border border-green-500/30",
                            user.status === "pending" &&
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                            user.status === "suspended" &&
                              "bg-red-500/20 text-red-400 border border-red-500/30",
                            user.status === "inactive" &&
                              "bg-gray-500/20 text-gray-400 border border-gray-500/30",
                          )}
                        >
                          {user.status === "active"
                            ? "Ativo"
                            : user.status === "pending"
                              ? "Pendente"
                              : user.status === "suspended"
                                ? "Suspenso"
                                : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(user.userId);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAndSortedUsers.length > 0 && (
            <div className="border-t border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/50">
                  Mostrando {((page - 1) * itemsPerPage) + 1} a{" "}
                  {Math.min(page * itemsPerPage, filteredAndSortedUsers.length)} de{" "}
                  {filteredAndSortedUsers.length} usuários
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * itemsPerPage >= filteredAndSortedUsers.length}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Details Panel */}
      {selectedUserId && selectedUser && (
        <UserDetailsPanel
          userId={selectedUserId}
          user={{
            userId: selectedUser.userId,
            email: selectedUser.email,
            displayName: selectedUser.displayName,
            avatarUrl: selectedUser.avatarUrl,
            status: selectedUser.status,
            lastLogin: selectedUser.lastLogin,
            createdAt: selectedUser.createdAt,
            updatedAt: selectedUser.updatedAt,
          }}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={loadUsers}
        />
      )}

      {/* Create User Drawer */}
      {createDrawerOpen && (
        <CreateUserDrawer
          open={createDrawerOpen}
          onClose={() => setCreateDrawerOpen(false)}
          onUserCreated={() => {
            setCreateDrawerOpen(false);
            void loadUsers();
          }}
        />
      )}
    </div>
  );
}

