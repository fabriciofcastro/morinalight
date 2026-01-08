"use client";

import { notificationCenter } from "@/shared/ui/notification-center";
import { Button, GlassCard, Input, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
    Archive,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Download,
    Inbox,
    MoreVertical,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NotificationInteraction = {
  id: string;
  action: "viewed" | "clicked" | "archived" | "deleted" | "marked_read" | "action_taken";
  timestamp: Date;
  userId?: string;
  details?: string;
};

type Notification = {
  id: string;
  type: "system" | "security" | "approval" | "activity" | "message" | "other";
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionLabel?: string;
  interactions?: NotificationInteraction[];
};

const CATEGORY_LABELS: Record<Notification["type"], string> = {
  system: "Sistema",
  security: "Segurança",
  approval: "Aprovações",
  activity: "Atividades",
  message: "Mensagens",
  other: "Outros",
};

const CATEGORY_COLORS: Record<Notification["type"], string> = {
  system: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  security: "bg-red-500/20 text-red-400 border-red-500/30",
  approval: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  activity: "bg-green-500/20 text-green-400 border-green-500/30",
  message: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function NotificationsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "approval",
      category: "Aprovação de Permissão",
      title: "Solicitação de Permissão Pendente",
      message: "Uma nova solicitação de permissão aguarda sua aprovação.",
      timestamp: new Date(),
      read: false,
      archived: false,
      actionUrl: "/settings/permissions/approvals",
      actionLabel: "Revisar",
    },
    {
      id: "2",
      type: "security",
      category: "Login",
      title: "Novo login detectado",
      message: "Um novo dispositivo acessou sua conta.",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      archived: false,
      actionUrl: "/profile?tab=security",
      actionLabel: "Ver detalhes",
    },
    {
      id: "3",
      type: "activity",
      category: "Produto Atualizado",
      title: "Produto atualizado",
      message: "O produto 'Vestido Floral' foi atualizado por outro usuário.",
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      archived: false,
      actionUrl: "/catalog/products/123",
      actionLabel: "Ver produto",
    },
    {
      id: "4",
      type: "system",
      category: "Manutenção",
      title: "Manutenção programada",
      message: "O sistema estará em manutenção amanhã das 2h às 4h.",
      timestamp: new Date(Date.now() - 86400000),
      read: true,
      archived: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Notification["type"]>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "category">("recent");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Status filter
    if (statusFilter === "unread") {
      result = result.filter((n) => !n.read && !n.archived);
    } else if (statusFilter === "read") {
      result = result.filter((n) => n.read && !n.archived);
    } else if (statusFilter === "archived") {
      result = result.filter((n) => n.archived);
    } else {
      result = result.filter((n) => !n.archived);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((n) => n.type === categoryFilter);
    }

    // Search
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query),
      );
    }

    // Sort
    if (sortBy === "recent") {
      result = [...result].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else if (sortBy === "category") {
      result = [...result].sort((a, b) => a.type.localeCompare(b.type));
    }

    return result;
  }, [notifications, search, statusFilter, categoryFilter, sortBy]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    filteredNotifications.forEach((notification) => {
      const timestamp = notification.timestamp;
      let groupKey: string;

      if (timestamp >= today) {
        groupKey = "Hoje";
      } else if (timestamp >= yesterday) {
        groupKey = "Ontem";
      } else if (timestamp >= weekAgo) {
        groupKey = "Esta semana";
      } else {
        groupKey = timestamp.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey]!.push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  // Paginação: converter grupos em lista plana e paginar
  const totalItems = useMemo(() => {
    return Object.values(groupedNotifications).reduce((acc, group) => acc + group.length, 0);
  }, [groupedNotifications]);

  const paginatedNotifications = useMemo(() => {
    const flatList: Notification[] = [];
    Object.values(groupedNotifications).forEach((group) => {
      flatList.push(...group);
    });

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return flatList.slice(start, end);
  }, [groupedNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reagrupar notificações paginadas
  const paginatedGroups = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    paginatedNotifications.forEach((notification) => {
      const timestamp = notification.timestamp;
      let groupKey: string;

      if (timestamp >= today) {
        groupKey = "Hoje";
      } else if (timestamp >= yesterday) {
        groupKey = "Ontem";
      } else if (timestamp >= weekAgo) {
        groupKey = "Esta semana";
      } else {
        groupKey = timestamp.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey]!.push(notification);
    });

    return groups;
  }, [paginatedNotifications]);

  const stats = useMemo(() => {
    return {
      total: notifications.filter((n) => !n.archived).length,
      unread: notifications.filter((n) => !n.read && !n.archived).length,
      read: notifications.filter((n) => n.read && !n.archived).length,
      archived: notifications.filter((n) => n.archived).length,
    };
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Todas as notificações foram marcadas como lidas.",
    });
  };

  const handleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n)),
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleBulkArchive = () => {
    if (selectedIds.size === 0) return;
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, archived: true, read: true } : n)),
    );
    setSelectedIds(new Set());
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: `${selectedIds.size} notificação(ões) arquivada(s).`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} notificação(ões)?`)) return;
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: `${selectedIds.size} notificação(ões) excluída(s).`,
    });
  };

  const handleClearOld = () => {
    if (!confirm("Tem certeza que deseja limpar notificações antigas (mais de 30 dias)?")) return;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setNotifications((prev) => prev.filter((n) => n.timestamp >= thirtyDaysAgo));
    notificationCenter.add({
      type: "success",
      title: "Sucesso",
      message: "Notificações antigas foram removidas.",
    });
  };

  const handleExport = () => {
    try {
      // Preparar dados para exportação
      const exportData = paginatedNotifications.map((notif) => ({
        ID: notif.id,
        Tipo: CATEGORY_LABELS[notif.type],
        Categoria: notif.category,
        Título: notif.title,
        Mensagem: notif.message,
        Data: notif.timestamp.toLocaleString("pt-BR"),
        Lida: notif.read ? "Sim" : "Não",
        Arquivada: notif.archived ? "Sim" : "Não",
        "URL de Ação": notif.actionUrl || "",
        "Label de Ação": notif.actionLabel || "",
        Interações: notif.interactions?.length || 0,
      }));

      // Converter para CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escapar valores que contêm vírgulas ou aspas
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
      link.download = `notificacoes_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `Histórico de ${exportData.length} notificações exportado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar notificações:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: "Não foi possível exportar o histórico de notificações.",
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedNotifications.map((n) => n.id)));
    }
  };


  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours}h`;
    if (days < 7) return `há ${days} dias`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Notificações</h1>
              <p className="mt-1 text-white/60">Central de notificações e alertas</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
              <Button type="button" variant="outline" onClick={handleClearOld}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar antigas
              </Button>
              <Button type="button" variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button type="button" onClick={() => router.push("/settings/notifications/preferences")}>
                Configurar Preferências
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/50">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.unread}</p>
              <p className="text-xs text-white/50">Não lidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.read}</p>
              <p className="text-xs text-white/50">Lidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{stats.archived}</p>
              <p className="text-xs text-white/50">Arquivadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar notificações..."
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
                <option value="archived">Arquivadas</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="all">Todas as categorias</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="category">Por categoria</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {selectedIds.size > 0 ? (
              <div className="flex items-center justify-between flex-1 rounded border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 p-3">
                <span className="text-sm text-white">
                  {selectedIds.size} notificação(ões) selecionada(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleBulkArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Arquivar
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="select-all-page"
                  type="checkbox"
                  checked={paginatedNotifications.length > 0 && selectedIds.size === paginatedNotifications.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer"
                />
                <label htmlFor="select-all-page" className="text-sm text-white/70 cursor-pointer">
                  Selecionar todas nesta página
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {Object.keys(paginatedGroups).length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Inbox className="mx-auto h-16 w-16 text-white/20" />
            <p className="mt-4 text-white/60">Nenhuma notificação encontrada</p>
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {Object.entries(paginatedGroups).map(([groupKey, groupNotifications]) => (
              <div key={groupKey}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  {groupKey}
                </h2>
                <div className="space-y-2">
                  {groupNotifications.map((notification) => {
                    const isExpanded = expandedId === notification.id;
                    const isSelected = selectedIds.has(notification.id);
                    return (
                      <div
                        key={notification.id}
                        onClick={(e) => {
                          // Não expandir se clicar em checkbox, botão ou popover
                          if (
                            (e.target as HTMLElement).closest("input[type='checkbox']") ||
                            (e.target as HTMLElement).closest("button") ||
                            (e.target as HTMLElement).closest("[role='dialog']")
                          ) {
                            return;
                          }
                          setExpandedId(isExpanded ? null : notification.id);
                        }}
                      >
                        <GlassCard
                          className={cn(
                            "p-4 transition-all cursor-pointer",
                            !notification.read && "border-l-4 border-l-[hsl(var(--primary))]",
                            isSelected && "ring-2 ring-[hsl(var(--primary))]",
                            isExpanded && "bg-white/10",
                          )}
                        >
                          <div className="flex gap-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelect(notification.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 h-4 w-4 cursor-pointer"
                            />

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border",
                                        CATEGORY_COLORS[notification.type],
                                      )}
                                    >
                                      {CATEGORY_LABELS[notification.type]}
                                    </span>
                                    {!notification.read && (
                                      <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-white">{notification.title}</h3>
                                  <p className="mt-1 text-sm text-white/70">{notification.message}</p>
                                  <p className="mt-1 text-xs text-white/40">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                  {isExpanded && (
                                    <div className="mt-3 space-y-4 border-t border-white/10 pt-3">
                                      <div className="text-xs text-white/50">
                                        <p>
                                          <strong>ID:</strong> {notification.id}
                                        </p>
                                        <p>
                                          <strong>Categoria:</strong> {notification.category}
                                        </p>
                                        <p>
                                          <strong>Data completa:</strong>{" "}
                                          {notification.timestamp.toLocaleString("pt-BR")}
                                        </p>
                                        {notification.actionUrl && (
                                          <p>
                                            <strong>Ação:</strong>{" "}
                                            <a
                                              href={notification.actionUrl}
                                              className="text-[hsl(var(--primary))] hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {notification.actionLabel || notification.actionUrl}
                                            </a>
                                          </p>
                                        )}
                                      </div>

                                      {/* Histórico de Interações */}
                                      <div className="border-t border-white/10 pt-3">
                                        <h4 className="mb-2 text-sm font-semibold text-white">Histórico de Interações</h4>
                                        {notification.interactions && notification.interactions.length > 0 ? (
                                          <div className="space-y-2">
                                            {notification.interactions.map((interaction) => {
                                              const actionLabels: Record<NotificationInteraction["action"], string> = {
                                                viewed: "Visualizada",
                                                clicked: "Clicada",
                                                archived: "Arquivada",
                                                deleted: "Excluída",
                                                marked_read: "Marcada como lida",
                                                action_taken: "Ação executada",
                                              };

                                              return (
                                                <div
                                                  key={interaction.id}
                                                  className="flex items-start justify-between border border-white/10 bg-white/5 p-2 text-xs"
                                                >
                                                  <div className="flex-1">
                                                    <p className="text-white/80">
                                                      <strong>{actionLabels[interaction.action]}</strong>
                                                    </p>
                                                    {interaction.details && (
                                                      <p className="mt-1 text-white/50">{interaction.details}</p>
                                                    )}
                                                    <p className="mt-1 text-white/40">
                                                      {interaction.timestamp.toLocaleString("pt-BR")}
                                                    </p>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-white/50">
                                            Nenhuma interação registrada ainda.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {notification.actionUrl && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => notification.actionUrl && router.push(notification.actionUrl)}
                                    >
                                      {notification.actionLabel || "Ver"}
                                    </Button>
                                  )}
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button type="button" variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2" align="end">
                                      <div className="flex flex-col gap-1">
                                        {!notification.read && (
                                          <button
                                            type="button"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                          >
                                            <Check className="h-4 w-4" />
                                            Marcar como lida
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleArchive(notification.id)}
                                          className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                          <Archive className="h-4 w-4" />
                                          Arquivar
                                        </button>
                                        <div className="my-1 border-t border-white/10" />
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(notification.id)}
                                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Excluir
                                        </button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-sm text-white/60">
              Mostrando {paginatedNotifications.length} de {totalItems} notificações
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
      </div>
    </div>
  );
}




