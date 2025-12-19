"use client";

import { Button } from "@morina/ui";
import { Calendar, Clock, Filter, History, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

type AuditLogEntry = {
  id: string;
  orgId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  action: "granted" | "denied" | "removed";
  granted: boolean | null;
  previousValue: boolean | null;
  newValue: boolean | null;
  actorId: string;
  userEmail?: string | null;
  userId?: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  createdAt: Date | string;
};

type AuditLogFilters = {
  search?: string;
  entityType?: "position" | "sector" | "department" | "user";
  entityId?: string;
  userId?: string;
  action?: "granted" | "denied" | "removed";
  dataInicio?: string;
  dataFim?: string;
};

type Props = {
  getAuthHeaders: () => Record<string, string>;
};

function formatEntityType(entityType: string): string {
  const map: Record<string, string> = {
    position: "Cargo",
    sector: "Setor",
    department: "Departamento",
    user: "Usuário",
  };
  return map[entityType] || entityType;
}

function formatAction(action: string): { label: string; color: string; bgColor: string; icon: string } {
  const map: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    granted: { label: "Concedida", color: "text-green-400", bgColor: "bg-green-500/10 border-green-500/20", icon: "✓" },
    denied: { label: "Negada", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: "✗" },
    removed: { label: "Removida", color: "text-yellow-400", bgColor: "bg-yellow-500/10 border-yellow-500/20", icon: "⊘" },
  };
  return map[action] || { label: action, color: "text-white/60", bgColor: "bg-white/5 border-white/10", icon: "?" };
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return formatDateShort(d);
}

export function AuditLogPanel({ getAuthHeaders }: Props) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogLoading, setAuditLogLoading] = useState(false);
  const [auditLogFilters, setAuditLogFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [proximoCursor, setProximoCursor] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async () => {
    setAuditLogLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditLogFilters.entityType) params.append("entityType", auditLogFilters.entityType);
      if (auditLogFilters.entityId) params.append("entityId", auditLogFilters.entityId);
      if (auditLogFilters.action) params.append("action", auditLogFilters.action);
      if (auditLogFilters.userId) params.append("userId", auditLogFilters.userId);
      if (auditLogFilters.search) params.append("search", auditLogFilters.search);
      if (auditLogFilters.dataInicio) params.append("dataInicio", auditLogFilters.dataInicio);
      if (auditLogFilters.dataFim) params.append("dataFim", auditLogFilters.dataFim);
      params.append("limite", "50");

      const response = await fetch(`/api/permissions/audit-log?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: AuditLogEntry[]; proximoCursor: string | null } = await response.json();
        setAuditLogs(data.itens || []);
        setProximoCursor(data.proximoCursor || null);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setAuditLogLoading(false);
    }
  }, [auditLogFilters, getAuthHeaders]);

  const clearFilters = useCallback(() => {
    setAuditLogFilters({});
  }, []);

  const hasActiveFilters = Boolean(
    auditLogFilters.search ||
      auditLogFilters.entityType ||
      auditLogFilters.entityId ||
      auditLogFilters.userId ||
      auditLogFilters.action ||
      auditLogFilters.dataInicio ||
      auditLogFilters.dataFim,
  );

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="relative space-y-6">
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
              <History className="h-8 w-8 text-[hsl(var(--primary))]" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  Histórico de Permissões
                </h1>
                <p className="text-sm text-white/60 font-medium mt-1">
                  Registro completo de todas as mudanças nas permissões do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white/80">{auditLogs.length} Registros</span>
              </div>
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
                value={auditLogFilters.search || ""}
                onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Buscar por permissão, entidade ou usuário..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={`bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4 ${showFilters ? "bg-blue-500/20 border-blue-500/30" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    !
                  </span>
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[48px] px-4"
                onClick={() => loadAuditLogs()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
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
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Fechar filtros"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filter-entity-type" className="block text-xs font-semibold text-white/70 mb-2">Tipo de Entidade</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    id="filter-entity-type"
                    value={auditLogFilters.entityType || ""}
                    onChange={(e) =>
                      setAuditLogFilters((prev) => ({
                        ...prev,
                        entityType: e.target.value || undefined,
                      }))
                    }
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    <option value="user">Usuário</option>
                    <option value="position">Cargo</option>
                    <option value="sector">Setor</option>
                    <option value="department">Departamento</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="filter-action" className="block text-xs font-semibold text-white/70 mb-2">Ação</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <select
                    id="filter-action"
                    value={auditLogFilters.action || ""}
                    onChange={(e) =>
                      setAuditLogFilters((prev) => ({
                        ...prev,
                        action: e.target.value || undefined,
                      }))
                    }
                    className="relative w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500 hover:border-blue-500/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="">Todas</option>
                    <option value="granted">Concedida</option>
                    <option value="denied">Negada</option>
                    <option value="removed">Removida</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="filter-data-inicio" className="block text-xs font-semibold text-white/70 mb-2">Data Início</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      id="filter-data-inicio"
                      type="datetime-local"
                      value={auditLogFilters.dataInicio || ""}
                      onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, dataInicio: e.target.value }))}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="filter-data-fim" className="block text-xs font-semibold text-white/70 mb-2">Data Fim</label>
                <div className="relative">
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
                  <div className="relative flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 focus-within:border-blue-500">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <input
                      id="filter-data-fim"
                      type="datetime-local"
                      value={auditLogFilters.dataFim || ""}
                      onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, dataFim: e.target.value }))}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[36px] px-4"
                onClick={clearFilters}
              >
                Limpar
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 cursor-pointer h-[36px] px-4"
                onClick={() => {
                  void loadAuditLogs();
                }}
              >
                Aplicar
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Lista de Logs */}
      {auditLogLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-white/60" />
          <p className="mt-3 text-white/60">Carregando histórico...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-white/[0.03]">
          <History className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/60">
            {hasActiveFilters
              ? "Nenhum registro encontrado com os filtros aplicados."
              : "Ainda não há registros de mudanças de permissões."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-white/60">
              {auditLogs.length} registro{auditLogs.length !== 1 ? "s" : ""} encontrado
              {auditLogs.length !== 1 ? "s" : ""}
            </p>
          </div>
          {auditLogs.map((log) => {
            const actionInfo = formatAction(log.action);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${actionInfo.bgColor} ${actionInfo.color}`}>
                        <span>{actionInfo.icon}</span>
                        {actionInfo.label}
                      </span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 text-white/70">
                        {formatEntityType(log.entityType)}
                      </span>
                      <span className="text-xs text-white/60">{formatRelativeTime(log.createdAt)}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white/90">
                        <span className="text-white/60">Permissão:</span>{" "}
                        <code className="rounded bg-white/5 px-2 py-1 text-xs font-mono text-white/80 border border-white/10">
                          {log.permissionId}
                        </code>
                      </p>
                      {(log.previousValue !== null || log.newValue !== null) && (
                        <div className="flex items-center gap-2 text-xs">
                          {log.previousValue !== null && (
                            <span className="text-white/60">
                              <span className="font-medium">Anterior:</span>{" "}
                              <span className={log.previousValue ? "text-green-400" : "text-red-400"}>
                                {log.previousValue ? "Concedida" : "Negada"}
                              </span>
                            </span>
                          )}
                          {log.previousValue !== null && log.newValue !== null && (
                            <span className="text-white/40">→</span>
                          )}
                          {log.newValue !== null && (
                            <span className="text-white/60">
                              <span className="font-medium">Novo:</span>{" "}
                              <span className={log.newValue ? "text-green-400" : "text-red-400"}>
                                {log.newValue ? "Concedida" : "Negada"}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                      {log.reason && (
                        <p className="mt-2 rounded bg-white/5 border border-white/10 p-2 text-xs text-white/70">
                          <span className="font-medium">Motivo:</span> {log.reason}
                        </p>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-medium text-white/60 hover:text-white/90 transition-colors">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 max-h-48 overflow-auto rounded bg-white/5 border border-white/10 p-2 text-[10px] text-white/80">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className="text-xs text-white/60">
                      <p className="font-medium">{formatDate(log.createdAt)}</p>
                    </div>
                    <div className="text-[10px] text-white/50">
                      <p className="truncate max-w-[120px]" title={log.userEmail || log.actorId || log.userId}>
                        {log.userEmail || log.actorId || log.userId || "Sistema"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {proximoCursor && (
            <div className="pt-2 text-center">
              <Button
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer"
                onClick={async () => {
                  // TODO: Implementar paginação
                  console.log("Carregar mais registros...", proximoCursor);
                }}
              >
                Carregar mais registros
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
