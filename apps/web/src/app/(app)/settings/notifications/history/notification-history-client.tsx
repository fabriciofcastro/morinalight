"use client";

import { notificationCenter } from "@/shared/ui/notification-center";
import { Button, GlassCard, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
    Activity,
    BarChart3,
    Download,
    FileSpreadsheet,
    Filter,
    Search,
    TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type Notification = {
  id: string;
  type: "system" | "security" | "approval" | "activity" | "message" | "other";
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  readAt: Date | null;
  archived: boolean;
  channel: "email" | "push" | "inApp";
};

const CATEGORY_LABELS: Record<Notification["type"], string> = {
  system: "Sistema",
  security: "Segurança",
  approval: "Aprovações",
  activity: "Atividades",
  message: "Mensagens",
  other: "Outros",
};

export function NotificationHistoryClient() {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "approval",
      category: "Aprovação",
      title: "Solicitação de Permissão",
      message: "Nova solicitação aguarda aprovação",
      timestamp: new Date(),
      read: true,
      readAt: new Date(Date.now() - 300000),
      archived: false,
      channel: "inApp",
    },
    {
      id: "2",
      type: "security",
      category: "Login",
      title: "Novo login",
      message: "Novo dispositivo detectado",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      readAt: new Date(Date.now() - 3500000),
      archived: false,
      channel: "email",
    },
    // ... mais notificações de exemplo
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Notification["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread" | "archived">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | Notification["channel"]>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query),
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((n) => n.type === typeFilter);
    }

    if (statusFilter === "read") {
      result = result.filter((n) => n.read);
    } else if (statusFilter === "unread") {
      result = result.filter((n) => !n.read);
    } else if (statusFilter === "archived") {
      result = result.filter((n) => n.archived);
    }

    if (channelFilter !== "all") {
      result = result.filter((n) => n.channel === channelFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((n) => n.timestamp >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((n) => n.timestamp <= to);
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, search, typeFilter, statusFilter, channelFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const read = notifications.filter((n) => n.read).length;
    const unread = notifications.filter((n) => !n.read).length;
    const archived = notifications.filter((n) => n.archived).length;
    const readRate = total > 0 ? (read / total) * 100 : 0;

    // Calcular tempo médio de resposta (diferença entre timestamp e readAt)
    const readNotifications = notifications.filter((n) => n.read && n.readAt);
    const avgResponseTime =
      readNotifications.length > 0
        ? readNotifications.reduce((sum, n) => {
          if (n.readAt) {
            return sum + (n.readAt.getTime() - n.timestamp.getTime());
          }
          return sum;
        }, 0) / readNotifications.length
        : 0;

    return {
      total,
      read,
      unread,
      archived,
      readRate: Math.round(readRate),
      avgResponseTimeMinutes: Math.round(avgResponseTime / 60000),
    };
  }, [notifications]);

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData = filteredNotifications.map((notif) => ({
        ID: notif.id,
        Tipo: CATEGORY_LABELS[notif.type],
        Categoria: notif.category,
        Título: notif.title,
        Mensagem: notif.message,
        "Enviada em": notif.timestamp.toLocaleString("pt-BR"),
        "Lida em": notif.readAt ? notif.readAt.toLocaleString("pt-BR") : "Não lida",
        Status: notif.read ? "Lida" : notif.archived ? "Arquivada" : "Não lida",
        Canal: notif.channel === "email" ? "Email" : notif.channel === "push" ? "Push" : "In-App",
      }));

      if (exportData.length === 0) {
        notificationCenter.add({
          type: "warning",
          title: "Nenhum dado para exportar",
          message: "Não há notificações para exportar com os filtros aplicados.",
        });
        return;
      }

      let blob: Blob;
      let filename: string;

      if (format === "csv") {
        const headers = Object.keys(exportData[0] as object);
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
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        filename = `historico_notificacoes_${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        filename = `historico_notificacoes_${new Date().toISOString().split("T")[0]}.json`;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `Histórico de ${exportData.length} notificação(ões) exportado em ${format.toUpperCase()} com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: `Não foi possível exportar o histórico em ${format.toUpperCase()}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-white/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Lidas</p>
              <p className="text-2xl font-bold text-green-400">{stats.read}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Não Lidas</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unread}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Taxa de Leitura</p>
              <p className="text-2xl font-bold text-blue-400">{stats.readRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Tempo Médio</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.avgResponseTimeMinutes}min
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400/30" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Filtros Avançados</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca full-text..."
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="type-filter" className="mb-2 block text-xs font-medium text-white/70">Tipo</Label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todos</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status-filter" className="mb-2 block text-xs font-medium text-white/70">Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="read">Lidas</option>
                <option value="unread">Não Lidas</option>
                <option value="archived">Arquivadas</option>
              </select>
            </div>

            <div>
              <Label htmlFor="channel-filter" className="mb-2 block text-xs font-medium text-white/70">Canal</Label>
              <select
                id="channel-filter"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
                className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="inApp">In-App</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date-from" className="mb-2 block text-xs font-medium text-white/70">Data (De)</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date-to" className="mb-2 block text-xs font-medium text-white/70">Data (Até)</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Export */}
      <div className="flex justify-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
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
      </div>

      {/* Gráficos */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Estatísticas e Gráficos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Notificações por Tipo */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white/70">Notificações por Tipo</h3>
            <div className="space-y-3">
              {Object.entries(CATEGORY_LABELS).map(([type, label]) => {
                const count = filteredNotifications.filter((n) => n.type === type).length;
                const percentage = filteredNotifications.length > 0 ? (count / filteredNotifications.length) * 100 : 0;
                const colors: Record<string, string> = {
                  system: "bg-blue-500",
                  security: "bg-red-500",
                  approval: "bg-yellow-500",
                  activity: "bg-green-500",
                  message: "bg-purple-500",
                  other: "bg-gray-500",
                };

                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{label}</span>
                      <span className="font-mono text-white">{count}</span>
                    </div>
                    <div className="h-2 w-full border border-white/10 bg-white/5">
                      <div
                        className={cn("h-full transition-all", colors[type])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de Notificações por Canal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white/70">Notificações por Canal</h3>
            <div className="space-y-3">
              {[
                { value: "email", label: "Email", color: "bg-blue-500" },
                { value: "push", label: "Push", color: "bg-green-500" },
                { value: "inApp", label: "In-App", color: "bg-purple-500" },
              ].map((channel) => {
                const count = filteredNotifications.filter((n) => n.channel === channel.value).length;
                const percentage = filteredNotifications.length > 0 ? (count / filteredNotifications.length) * 100 : 0;

                return (
                  <div key={channel.value} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{channel.label}</span>
                      <span className="font-mono text-white">{count}</span>
                    </div>
                    <div className="h-2 w-full border border-white/10 bg-white/5">
                      <div
                        className={cn("h-full transition-all", channel.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de Taxa de Leitura ao Longo do Tempo */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-white/70">Taxa de Leitura (Últimos 7 dias)</h3>
            <div className="flex h-32 items-end justify-between gap-2 border border-white/10 bg-white/5 p-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayNotifications = filteredNotifications.filter((n) => {
                  const nDate = new Date(n.timestamp);
                  return (
                    nDate.getDate() === date.getDate() &&
                    nDate.getMonth() === date.getMonth() &&
                    nDate.getFullYear() === date.getFullYear()
                  );
                });
                const readCount = dayNotifications.filter((n) => n.read).length;
                const height = dayNotifications.length > 0 ? (readCount / dayNotifications.length) * 100 : 0;
                const dateKey = date.toISOString().split("T")[0];

                return (
                  <div key={dateKey} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative h-24 w-full border border-white/10 bg-white/5">
                      <div
                        className="absolute bottom-0 w-full bg-[hsl(var(--primary))] transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/50">
                      {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notifications Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Canal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Enviada em
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Lida em
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                    Nenhuma notificação encontrada
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono uppercase text-white/70">
                        {CATEGORY_LABELS[notification.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{notification.title}</p>
                        <p className="text-xs text-white/50">{notification.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70 capitalize">
                      {notification.channel}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {notification.timestamp.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {notification.readAt
                        ? notification.readAt.toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-1 text-xs font-mono uppercase tracking-wider border",
                          notification.archived &&
                          "bg-gray-500/20 text-gray-400 border-gray-500/30",
                          !notification.archived &&
                          notification.read &&
                          "bg-green-500/20 text-green-400 border-green-500/30",
                          !notification.archived &&
                          !notification.read &&
                          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                        )}
                      >
                        {notification.archived
                          ? "Arquivada"
                          : notification.read
                            ? "Lida"
                            : "Não lida"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}




