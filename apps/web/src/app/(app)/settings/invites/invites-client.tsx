"use client";

import { Button, GlassCard, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
  FileText,
  Edit,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type Invite = {
  inviteId: string;
  orgId: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "pending" | "accepted" | "cancelled" | "expired";
  createdAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
  invitedBy: string;
  invitedByEmail: string | null;
};

type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
};

const ROLE_OPTIONS = [
  { value: "owner", label: "Proprietário(a)" },
  { value: "admin", label: "Administrador(a)" },
  { value: "manager", label: "Gestor(a)" },
  { value: "member", label: "Colaborador(a)" },
  { value: "viewer", label: "Visitante" },
] as const;

export function InvitesClient() {
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Invite["status"]>("all");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member" as (typeof ROLE_OPTIONS)[number]["value"],
  });

  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkRole, setBulkRole] = useState("member" as (typeof ROLE_OPTIONS)[number]["value"]);

  const [templates, setTemplates] = useState<Array<{
    templateId: string;
    name: string;
    role: (typeof ROLE_OPTIONS)[number]["value"];
    subject?: string;
    message?: string;
    createdAt: string;
  }>>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    role: "member" as (typeof ROLE_OPTIONS)[number]["value"],
    subject: "",
    message: "",
  });
  const [templateBusy, setTemplateBusy] = useState(false);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      // TODO: Usar orgId correto
      const orgId = "default"; // Substituir por orgId real
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as ListResponse<Invite>;
        setInvites(data.itens ?? []);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar convites",
        message: "Não foi possível carregar a lista de convites.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvites();
    void loadTemplates();
  }, [loadInvites]);

  const loadTemplates = useCallback(async () => {
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const response = await fetch("/api/invites/templates", { headers });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.itens || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Nome obrigatório",
        message: "Preencha o nome do template.",
      });
      return;
    }

    setTemplateBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };
      const response = await fetch("/api/invites/templates", {
        method: "POST",
        headers,
        body: JSON.stringify(templateForm),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Template criado com sucesso.",
        });
        setTemplateForm({ name: "", role: "member", subject: "", message: "" });
        setTemplatesOpen(false);
        void loadTemplates();
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao criar template" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível criar o template.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar template.",
      });
    } finally {
      setTemplateBusy(false);
    }
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    setInviteForm({ email: "", role: template.role });
    setCreateDrawerOpen(true);
  };

  const filteredInvites = useMemo(() => {
    let result = invites;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (inv) =>
          inv.email.toLowerCase().includes(query) ||
          inv.invitedByEmail?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    return result;
  }, [invites, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: invites.length,
      pending: invites.filter((i) => i.status === "pending").length,
      accepted: invites.filter((i) => i.status === "accepted").length,
      cancelled: invites.filter((i) => i.status === "cancelled").length,
      expired: invites.filter((i) => i.status === "expired").length,
    };
  }, [invites]);

  const handleCreateInvite = async () => {
    if (!inviteForm.email.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Email obrigatório",
        message: "Preencha o email do convidado.",
      });
      return;
    }

    setCreateBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const orgId = "default"; // Substituir por orgId real
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
        }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Convite enviado com sucesso.",
        });
        setInviteForm({ email: "", role: "member" });
        setCreateDrawerOpen(false);
        void loadInvites();
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao criar convite" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível criar o convite.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar convite.",
      });
    } finally {
      setCreateBusy(false);
    }
  };

  const handleBulkCreate = async () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      notificationCenter.add({
        type: "error",
        title: "Emails inválidos",
        message: "Digite pelo menos um email válido.",
      });
      return;
    }

    setCreateBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const orgId = "default"; // Substituir por orgId real
      const results = await Promise.allSettled(
        emails.map((email) =>
          fetch(`/api/organizations/${orgId}/invites`, {
            method: "POST",
            headers,
            body: JSON.stringify({ email, role: bulkRole }),
          }),
        ),
      );

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      notificationCenter.add({
        type: successCount > 0 ? "success" : "error",
        title: "Convites em Massa",
        message: `${successCount} convite(s) enviado(s) com sucesso.${failCount > 0 ? ` ${failCount} falharam.` : ""}`,
      });

      setBulkEmails("");
      setBulkCreateOpen(false);
      void loadInvites();
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar convites em massa.",
      });
    } finally {
      setCreateBusy(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const orgId = "default"; // Substituir por orgId real
      const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}/resend`, {
        method: "POST",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Convite reenviado com sucesso.",
        });
        void loadInvites();
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao reenviar convite.",
      });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este convite?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const orgId = "default"; // Substituir por orgId real
      const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Convite cancelado com sucesso.",
        });
        void loadInvites();
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao cancelar convite.",
      });
    }
  };

  const handleExport = (format: "csv" | "json") => {
    // TODO: Implementar exportação real
    notificationCenter.add({
      type: "info",
      title: "Exportação",
      message: `Exportação em ${format.toUpperCase()} será implementada em breve.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-white/30" />
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
              <p className="text-xs text-white/50">Aceitos</p>
              <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
            </div>
            <Mail className="h-8 w-8 text-green-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Cancelados</p>
              <p className="text-2xl font-bold text-gray-400">{stats.cancelled}</p>
            </div>
            <Mail className="h-8 w-8 text-gray-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Expirados</p>
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            </div>
            <Mail className="h-8 w-8 text-red-400/30" />
          </div>
        </GlassCard>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="accepted">Aceitos</option>
            <option value="cancelled">Cancelados</option>
            <option value="expired">Expirados</option>
          </select>

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
                  <FileSpreadsheet className="h-4 w-4" />
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

          <Button type="button" variant="outline" onClick={() => setBulkCreateOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Criar em Massa
          </Button>

          <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-2">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Templates de Convite</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTemplateForm({ name: "", role: "member", subject: "", message: "" });
                      // Abrir modal de criação de template
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {templates.length === 0 ? (
                  <p className="text-xs text-white/50">Nenhum template criado</p>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.templateId}
                      type="button"
                      onClick={() => {
                        handleUseTemplate(template);
                        setTemplatesOpen(false);
                      }}
                      className="w-full border border-white/10 bg-white/5 p-2 text-left hover:bg-white/8 transition"
                    >
                      <p className="text-sm text-white">{template.name}</p>
                      <p className="text-xs text-white/50">
                        {ROLE_OPTIONS.find((r) => r.value === template.role)?.label}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button type="button" onClick={() => setCreateDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Convite
          </Button>

          <Button type="button" variant="outline" onClick={loadInvites} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Invites List */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Papel
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Criado em
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Convidado por
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                    Carregando convites...
                  </td>
                </tr>
              ) : filteredInvites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                    {search || statusFilter !== "all"
                      ? "Nenhum convite encontrado."
                      : "Nenhum convite cadastrado."}
                  </td>
                </tr>
              ) : (
                filteredInvites.map((invite) => (
                  <tr
                    key={invite.inviteId}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-white/40" />
                        <span className="text-sm text-white">{invite.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label || invite.role}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-1 text-xs font-mono uppercase tracking-wider",
                          invite.status === "pending" &&
                            "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                          invite.status === "accepted" &&
                            "bg-green-500/20 text-green-400 border border-green-500/30",
                          invite.status === "cancelled" &&
                            "bg-gray-500/20 text-gray-400 border border-gray-500/30",
                          invite.status === "expired" &&
                            "bg-red-500/20 text-red-400 border border-red-500/30",
                        )}
                      >
                        {invite.status === "pending"
                          ? "Pendente"
                          : invite.status === "accepted"
                            ? "Aceito"
                            : invite.status === "cancelled"
                              ? "Cancelado"
                              : "Expirado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/40" />
                        {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {invite.invitedByEmail || invite.invitedBy}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invite.status === "pending" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvite(invite.inviteId)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Reenviar
                          </Button>
                        )}
                        {invite.status === "pending" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvite(invite.inviteId)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create Drawer */}
      {createDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="relative w-full max-w-md p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Convite</h3>
              <button
                type="button"
                onClick={() => setCreateDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@morina.com.br"
                  required
                />
              </div>

              <div>
                <Label htmlFor="invite-role">Papel</Label>
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      role: e.target.value as (typeof ROLE_OPTIONS)[number]["value"],
                    }))
                  }
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateDrawerOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateInvite} disabled={createBusy}>
                {createBusy ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bulk Create Drawer */}
      {bulkCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="relative w-full max-w-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Criar Convites em Massa</h3>
              <button
                type="button"
                onClick={() => setBulkCreateOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-emails">
                  Emails (um por linha ou separados por vírgula) *
                </Label>
                <textarea
                  id="bulk-emails"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="usuario1@morina.com.br&#10;usuario2@morina.com.br&#10;usuario3@morina.com.br"
                  className="flex min-h-[200px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                  required
                />
                <p className="mt-1 text-xs text-white/50">
                  Você pode colar uma lista de emails, um por linha ou separados por vírgula.
                </p>
              </div>

              <div>
                <Label htmlFor="bulk-role">Papel para Todos</Label>
                <select
                  id="bulk-role"
                  value={bulkRole}
                  onChange={(e) =>
                    setBulkRole(e.target.value as (typeof ROLE_OPTIONS)[number]["value"])
                  }
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setBulkCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleBulkCreate} disabled={createBusy}>
                {createBusy ? "Enviando..." : "Enviar Convites"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}


