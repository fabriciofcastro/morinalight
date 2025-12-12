"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

function formatAction(action: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    granted: { label: "Concedida", color: "var(--success)" },
    denied: { label: "Negada", color: "var(--danger)" },
    removed: { label: "Removida", color: "var(--warning)" },
  };
  return map[action] || { label: action, color: "var(--muted)" };
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function AuditLogPanel({ getAuthHeaders }: Props) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogLoading, setAuditLogLoading] = useState(false);
  const [auditLogFilters, setAuditLogFilters] = useState<AuditLogFilters>({});

  const loadAuditLogs = useCallback(async () => {
    setAuditLogLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditLogFilters.entityType) params.append("entityType", auditLogFilters.entityType);
      if (auditLogFilters.entityId) params.append("entityId", auditLogFilters.entityId);
      if (auditLogFilters.action) params.append("action", auditLogFilters.action);
      if (auditLogFilters.userId) params.append("userId", auditLogFilters.userId);
      if (auditLogFilters.search) params.append("search", auditLogFilters.search);
      params.append("limite", "50");

      const response = await fetch(`/api/permissions/audit-log?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: AuditLogEntry[] } = await response.json();
        setAuditLogs(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setAuditLogLoading(false);
    }
  }, [auditLogFilters, getAuthHeaders]);

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <GlassCard className="p-6 border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] shadow-[0_22px_90px_-32px_rgba(109,213,255,0.3)] backdrop-blur-2xl bg-[color-mix(in_oklab,var(--surface)_88%,transparent_12%)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)]">Histórico de Permissões</h2>
          <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            Registro de todas as mudanças nas permissões do sistema
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => loadAuditLogs()}>
          <Clock className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-4 grid gap-3 rounded-[var(--r-lg)] border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent_10%)] p-4 md:grid-cols-4">
        <div className="md:col-span-2 flex flex-col gap-1">
          <label
            className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"
            htmlFor="audit-search"
          >
            Buscar por entidade ou usuário
          </label>
          <Input
            id="audit-search"
            placeholder="Entidade, usuário ou termo..."
            value={auditLogFilters.search}
            onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"
            htmlFor="audit-entity-type"
          >
            Entidade
          </label>
          <Input
            id="audit-entity-type"
            placeholder="department / sector / position..."
            value={auditLogFilters.entityType}
            onChange={(e) =>
              setAuditLogFilters((prev) => ({
                ...prev,
                entityType: e.target.value as AuditLogFilters["entityType"],
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"
            htmlFor="audit-action"
          >
            Ação
          </label>
          <Input
            id="audit-action"
            placeholder="granted / removed / updated"
            value={auditLogFilters.action}
            onChange={(e) =>
              setAuditLogFilters((prev) => ({
                ...prev,
                action: e.target.value as AuditLogFilters["action"],
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"
            htmlFor="audit-entity-id"
          >
            ID da Entidade
          </label>
          <Input
            id="audit-entity-id"
            placeholder="UUID"
            value={auditLogFilters.entityId}
            onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, entityId: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"
            htmlFor="audit-user-id"
          >
            Usuário
          </label>
          <Input
            id="audit-user-id"
            placeholder="email ou id"
            value={auditLogFilters.userId}
            onChange={(e) => setAuditLogFilters((prev) => ({ ...prev, userId: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              loadAuditLogs();
            }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="space-y-3">
        {auditLogLoading ? (
          <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            Carregando histórico...
          </p>
        ) : auditLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            Nenhum registro encontrado
          </p>
        ) : (
          auditLogs.map((log) => {
            const actionInfo = formatAction(log.action);
            return (
              <div
                key={log.id}
                className="rounded-lg border border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] p-4 transition-all bg-[color-mix(in_oklab,var(--surface)_88%,transparent_12%)] shadow-[0_14px_48px_-28px_rgba(109,213,255,0.25)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-wide)] text-white"
                        style={{ backgroundColor: actionInfo.color }}
                      >
                        {actionInfo.label}
                      </span>
                      <span className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        {formatEntityType(log.entityType)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--fg)]">
                      Permissão: {log.permissionId}
                    </p>
                    {log.reason && (
                      <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        Motivo: {log.reason}
                      </p>
                    )}
                    {log.previousValue !== null && (
                      <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        Valor anterior: {log.previousValue ? "Concedida" : "Negada"}
                      </p>
                    )}
                    {log.newValue !== null && (
                      <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        Novo valor: {log.newValue ? "Concedida" : "Negada"}
                      </p>
                    )}
                    {log.details && (
                      <pre className="mt-3 whitespace-pre-wrap rounded bg-black/20 p-2 text-[var(--fs-xs)] text-[var(--fg)]">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    <p>{formatDate(log.createdAt)}</p>
                    <p>{log.userEmail || log.userId}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
