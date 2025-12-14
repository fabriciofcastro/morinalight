"use client";

import { Button, cn, GlassCard, Input, Popover, PopoverContent, PopoverTrigger } from "@morina/ui";
import {
  Download,
  Filter,
  Mail,
  MoreVertical,
  Search,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import type { OrganizationMember } from "@/types/organization";
import { notificationCenter } from "@/components/notifications/notification-center";

type TeamClientProps = {
  orgId: string;
  initialMembers: OrganizationMember[];
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

const ROLE_LABELS = {
  owner: "Proprietário(a)",
  admin: "Administrador(a)",
  manager: "Gestor(a)",
  member: "Colaborador(a)",
  viewer: "Visitante",
} as const;

const ROLE_OPTIONS = [
  { value: "owner", label: ROLE_LABELS.owner },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "manager", label: ROLE_LABELS.manager },
  { value: "member", label: ROLE_LABELS.member },
  { value: "viewer", label: ROLE_LABELS.viewer },
] satisfies Array<{ value: OrganizationMember["role"]; label: string }>;

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  suspended: "Suspenso",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  pending: "secondary",
  suspended: "outline",
};

export function TeamClient({ orgId, initialMembers }: TeamClientProps) {
  const [members, setMembers] = useState<OrganizationMember[]>(initialMembers);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAction, startTransition] = useTransition();
  const [busyMember, setBusyMember] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | OrganizationMember["role"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members],
  );

  const filteredMembers = useMemo(() => {
    let result = members;

    // Busca
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.user?.displayName?.toLowerCase().includes(query) ||
          m.user?.email?.toLowerCase().includes(query) ||
          m.userId.toLowerCase().includes(query),
      );
    }

    // Filtro por role
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }

    // Filtro por status
    if (statusFilter !== "all") {
      result = result.filter((m) => (m.user?.status ?? "active") === statusFilter);
    }

    return result;
  }, [members, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = members.filter((m) => (m.user?.status ?? "active") === "active").length;
    const pending = members.filter((m) => (m.user?.status ?? "active") === "pending").length;
    const suspended = members.filter((m) => (m.user?.status ?? "active") === "suspended").length;
    return { total: members.length, active, pending, suspended };
  }, [members]);

  const handleExport = (format: "csv" | "json") => {
    try {
      if (filteredMembers.length === 0) {
        notificationCenter.add({
          type: "warning",
          title: "Nenhum dado para exportar",
          message: "Não há membros para exportar com os filtros aplicados.",
        });
        return;
      }

      const exportData = filteredMembers.map((member) => ({
        ID: member.userId,
        Nome: member.user?.displayName || "",
        Email: member.user?.email || "",
        Papel: ROLE_LABELS[member.role] || member.role,
        Status: STATUS_LABELS[member.user?.status ?? "active"] || member.user?.status || "active",
        "Membro Desde": new Date(member.createdAt).toLocaleString("pt-BR"),
        "Última Atualização": new Date(member.updatedAt).toLocaleString("pt-BR"),
      }));

      if (format === "json") {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `equipe_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // CSV format
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
        link.download = `equipe_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `${filteredMembers.length} membro(s) exportado(s) em ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: "Não foi possível exportar os dados da equipe.",
      });
    }
  };

  async function refreshMembers() {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error((await response.json())?.message ?? "Falha ao atualizar lista.");
      }

      const payload = (await response.json()) as { itens: OrganizationMember[] };
      setMembers(payload.itens);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao atualizar lista.",
      });
    }
  }

  async function handleRoleChange(userId: string, role: OrganizationMember["role"]) {
    setBusyMember(userId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Não foi possível atualizar o papel.");
        }

        const payload = (await response.json()) as { membership: { role: string } };

        setMembers((current) =>
          current.map((member) =>
            member.userId === userId
              ? { ...member, role: payload.membership.role as typeof role }
              : member,
          ),
        );

        setFeedback({
          type: "success",
          message: "Papel atualizado com sucesso.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao atualizar papel.",
        });
      } finally {
        setBusyMember(null);
        await refreshMembers();
      }
    });
  }

  async function handleRemoveMember(userId: string) {
    setBusyMember(userId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok && response.status !== 204) {
          const payload = await response.json();
          throw new Error(payload?.message ?? "Não foi possível remover o membro.");
        }

        setMembers((current) => current.filter((member) => member.userId !== userId));
        setFeedback({
          type: "success",
          message: "Membro removido da organização.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao remover membro.",
        });
        await refreshMembers();
      } finally {
        setBusyMember(null);
      }
    });
  }

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-white/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Ativos</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Mail className="h-8 w-8 text-yellow-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Suspensos</p>
              <p className="text-2xl font-bold text-red-400">{stats.suspended}</p>
            </div>
            <UserX className="h-8 w-8 text-red-400/30" />
          </div>
        </GlassCard>
      </div>

      {/* Toolbar */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
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
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="role-filter" className="mb-2 block text-xs font-medium text-white/70">
                      Papel
                    </label>
                    <select
                      id="role-filter"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                      className="flex h-9 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                    >
                      <option value="all">Todos</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status-filter" className="mb-2 block text-xs font-medium text-white/70">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="flex h-9 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Ativo</option>
                      <option value="pending">Pendente</option>
                      <option value="suspended">Suspenso</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
                    onClick={() => handleExport("csv")}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exportar JSON
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </GlassCard>

      {/* Main Card */}
      <GlassCard
        glow
        className="flex flex-col gap-[var(--space-6)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent_12%)]/70 border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] shadow-[0_22px_90px_-32px_rgba(109,213,255,0.3)] backdrop-blur-2xl p-[var(--space-6)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Equipe operacional
            </span>
            <div className="flex items-center gap-[var(--space-3)]">
              <h2 className="text-[clamp(1.8rem,2.6vw,2.3rem)] font-semibold leading-[1.2] text-[var(--fg)]">
                Controle de membros
              </h2>
              <Badge variant="secondary" className="text-[10px]">
                {filteredMembers.length} de {members.length} integrantes
              </Badge>
            </div>
          </div>
          <Link
            href="/settings/company"
            className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)] underline-offset-4 hover:text-[var(--primary-color)] hover:underline"
          >
            Ajustar branding da organização
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-[var(--space-3)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
          <span>
            Proprietários ativos:{" "}
            <strong className="text-[color-mix(in oklab,var(--primary-color) 80%,var(--fg) 20%)]">
              {ownerCount}
            </strong>
          </span>
          <span>Convites gerenciados no módulo &ldquo;Convites&rdquo;.</span>
        </div>

      {feedback ? (
        <div
          className={cn(
            "rounded-[var(--r-lg)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)]",
            feedback.type === "success"
              ? "bg-[color-mix(in oklab,var(--primary-color) 18%,transparent)] text-[var(--primary-contrast)]"
              : "bg-[color-mix(in oklab,var(--accent-color) 12%,transparent)] text-[color-mix(in oklab,var(--accent-color) 80%,var(--fg) 20%)]",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-[var(--space-3)] bg-[color-mix(in oklab,var(--surface-color) 95%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 62%,var(--fg) 38%)]">
          <span>Colaborador</span>
          <span>Status</span>
          <span>Papel</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-[color-mix(in oklab,var(--border-color) 70%,transparent)]">
          {members.map((member) => {
            const isBusy = busyMember === member.userId && pendingAction;
            const status = member.user?.status ?? "active";
            const statusLabel = STATUS_LABELS[status] ?? status;
            const statusVariant = STATUS_VARIANTS[status] ?? "secondary";

            return (
              <div
                key={member.userId}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-4)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)] hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-sm font-semibold text-white">
                    {(member.user?.displayName || member.user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-[var(--space-1)] min-w-0">
                    <span className="text-[var(--fs-sm)] font-semibold text-[var(--fg)] truncate">
                      {member.user?.displayName ?? member.user?.email ?? member.userId}
                    </span>
                    <span className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)] truncate">
                      {member.user?.email ?? "E-mail não disponível"}
                    </span>
                    {member.user?.displayName && (
                      <span className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] truncate">
                        {member.user.email}
                      </span>
                    )}
                    <span className="text-[10px] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
                      Membro desde {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div>
                  <Badge variant={statusVariant} className="text-[10px]">
                    {statusLabel}
                  </Badge>
                </div>

                <div>
                  <label className="flex flex-col gap-[var(--space-1)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 60%,var(--fg) 40%)]">
                    Papel
                    <select
                      className="rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-sm)] text-[var(--fg)] shadow-[0_12px_26px_rgba(12,17,29,0.08)] focus:border-[color-mix(in oklab,var(--primary-color) 45%,transparent)] focus:outline-none"
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(
                          member.userId,
                          event.target.value as OrganizationMember["role"],
                        )
                      }
                      disabled={isBusy}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-[var(--space-2)]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-[var(--fs-xs)]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: Implementar visualizar perfil
                            notificationCenter.add({
                              type: "info",
                              title: "Visualizar Perfil",
                              message: "Funcionalidade será implementada em breve.",
                            });
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Ver Perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: Implementar enviar mensagem
                            notificationCenter.add({
                              type: "info",
                              title: "Enviar Mensagem",
                              message: "Funcionalidade será implementada em breve.",
                            });
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          Enviar Mensagem
                        </button>
                        <div className="my-1 border-t border-white/10" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={isBusy || (member.role === "owner" && ownerCount <= 1)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserX className="h-4 w-4" />
                          Remover
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </GlassCard>
  );
}
