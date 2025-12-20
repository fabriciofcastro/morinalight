"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import {
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { type User, usersApi } from "@/lib/api/users";

type AccessAuditLog = {
  id: string;
  orgId: string;
  userId: string;
  permission: string;
  granted: boolean;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resource?: string | null;
  endpoint?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type AccessAuditPage = {
  itens: AccessAuditLog[];
  total: number;
  proximoCursor?: string;
};

export function AccessAuditDashboard() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AccessAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  // Filtros
  const [userId, setUserId] = useState<string>("");
  const [permission, setPermission] = useState<string>("");
  const [granted, setGranted] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  const loadUsers = useCallback(async () => {
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (userId) params.append("userId", userId);
      if (permission) params.append("permission", permission);
      if (granted !== null) params.append("granted", granted.toString());
      if (search) params.append("search", search);
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);
      params.append("limite", "50");

      const response = await fetch(`/api/permissions/access-audit-log?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as AccessAuditPage;
        setLogs(data.itens || []);
        setTotal(data.total || 0);
        setNextCursor(data.proximoCursor);
      }
    } catch (error) {
      console.error("Erro ao carregar logs de acesso:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, permission, granted, search, dataInicio, dataFim]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const stats = useMemo(() => {
    const grantedCount = logs.filter((log) => log.granted).length;
    const deniedCount = logs.filter((log) => !log.granted).length;
    const uniqueUsers = new Set(logs.map((log) => log.userId)).size;
    const uniquePermissions = new Set(logs.map((log) => log.permission)).size;

    return {
      total: logs.length,
      granted: grantedCount,
      denied: deniedCount,
      uniqueUsers,
      uniquePermissions,
      grantedRate: logs.length > 0 ? ((grantedCount / logs.length) * 100).toFixed(1) : "0",
    };
  }, [logs]);

  const getUserName = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.userId === userId);
      return user?.displayName || user?.email || userId;
    },
    [users],
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const clearFilters = useCallback(() => {
    setUserId("");
    setPermission("");
    setGranted(null);
    setSearch("");
    setDataInicio("");
    setDataFim("");
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Auditoria de Acessos</h1>
          <p className="mt-1 text-sm text-white/60">
            Visualize e analise logs de verificação de permissões
          </p>
        </div>
        <Button onClick={loadLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Shield className="h-8 w-8 text-white/40" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Concedidos</p>
              <p className="text-2xl font-bold text-green-400">{stats.granted}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400/40" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Negados</p>
              <p className="text-2xl font-bold text-red-400">{stats.denied}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400/40" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Usuários Únicos</p>
              <p className="text-2xl font-bold text-white">{stats.uniqueUsers}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-white/40" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-white">{stats.grantedRate}%</p>
            </div>
            <Shield className="h-8 w-8 text-white/40" />
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-white/80" />
            <h2 className="text-lg font-semibold text-white">Filtros</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Usuário</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">Todos</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.displayName || user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Permissão</label>
            <Input
              placeholder="resource:action"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Status</label>
            <select
              value={granted === null ? "" : granted.toString()}
              onChange={(e) =>
                setGranted(e.target.value === "" ? null : e.target.value === "true")
              }
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">Todos</option>
              <option value="true">Concedidos</option>
              <option value="false">Negados</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Busca Geral</label>
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Data Início</label>
            <Input
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Data Fim</label>
            <Input
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Lista de Logs */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-white/80" />
            <h2 className="text-lg font-semibold text-white">Logs de Acesso</h2>
          </div>
          <div className="text-sm text-white/60">Total: {total}</div>
        </div>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-white/60">Carregando...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-white/60">Nenhum log encontrado</div>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border p-4 ${
                  log.granted
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {log.granted ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-semibold text-white">{log.permission}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        log.granted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {log.granted ? "Concedido" : "Negado"}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-white/70">
                      <div>
                        <span className="font-medium">Usuário:</span> {getUserName(log.userId)}
                      </div>
                      {log.reason && (
                        <div>
                          <span className="font-medium">Motivo:</span> {log.reason}
                        </div>
                      )}
                      {log.resource && (
                        <div>
                          <span className="font-medium">Recurso:</span> {log.resource}
                        </div>
                      )}
                      {log.endpoint && (
                        <div>
                          <span className="font-medium">Endpoint:</span> {log.endpoint}
                        </div>
                      )}
                      {log.ipAddress && (
                        <div>
                          <span className="font-medium">IP:</span> {log.ipAddress}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {nextCursor && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadLogs}>
                  Carregar Mais
                </Button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

