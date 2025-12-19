"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  Activity,
  BarChart3,
  Download,
  Filter,
  LogOut,
  Monitor,
  Search,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

type UserActivityTabProps = {
  userId: string;
};

type ActivityLog = {
  id: string;
  action: string;
  module: string;
  resource: string;
  performedAt: string;
  ip: string;
  userAgent: string;
};

type ActiveSession = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActivity: string;
  startedAt: string;
};

type ActivityStats = {
  totalLogins: number;
  averageLoginsPerDay: number;
  mostActiveHours: Array<{ hour: number; count: number }>;
  mostAccessedModules: Array<{ module: string; count: number }>;
};

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    let result = activities;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.action.toLowerCase().includes(query) ||
          a.module.toLowerCase().includes(query) ||
          a.resource.toLowerCase().includes(query),
      );
    }

    if (actionFilter !== "all") {
      result = result.filter((a) => a.action === actionFilter);
    }

    return result;
  }, [activities, searchQuery, actionFilter]);

  useEffect(() => {
    void loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const [actRes, sessRes, statsRes] = await Promise.all([
        fetch(`/api/users/${userId}/activity?limit=100`, { headers }),
        fetch(`/api/users/${userId}/sessions`, { headers }),
        fetch(`/api/users/${userId}/activity/stats`, { headers }),
      ]);

      if (actRes.ok) {
        const data = await actRes.json();
        setActivities(data.itens || []);
      } else {
        // Dados mock para desenvolvimento
        setActivities([
          {
            id: "1",
            action: "login",
            module: "Sistema",
            resource: "Login",
            performedAt: new Date().toISOString(),
            ip: "192.168.1.100",
            userAgent: "Chrome 120.0",
          },
        ]);
      }
      if (sessRes.ok) {
        const data = await sessRes.json();
        setSessions(data.itens || []);
      } else {
        // Dados mock para desenvolvimento
        setSessions([
          {
            id: "1",
            device: "Chrome on Windows",
            browser: "Chrome 120.0",
            ip: "192.168.1.100",
            location: "São Paulo, SP, Brasil",
            lastActivity: new Date().toISOString(),
            startedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      } else {
        // Dados mock para desenvolvimento
        setStats({
          totalLogins: 1247,
          averageLoginsPerDay: 15.2,
          mostActiveHours: [
            { hour: 9, count: 89 },
            { hour: 10, count: 92 },
            { hour: 14, count: 78 },
            { hour: 15, count: 85 },
            { hour: 16, count: 71 },
          ],
          mostAccessedModules: [
            { module: "Catálogo", count: 342 },
            { module: "Clientes", count: 289 },
            { module: "Comissões", count: 198 },
            { module: "Produção", count: 156 },
            { module: "Configurações", count: 98 },
          ],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (sessionId: string) => {
    if (!confirm("Tem certeza que deseja forçar o logout desta sessão?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/sessions/${sessionId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        void loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || act.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Total de Logins</p>
                <p className="text-2xl font-bold text-white">{stats.totalLogins}</p>
              </div>
              <Activity className="h-8 w-8 text-white/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Média por Dia</p>
                <p className="text-2xl font-bold text-white">{stats.averageLoginsPerDay.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Horário Mais Ativo</p>
                <p className="text-2xl font-bold text-white">
                  {stats.mostActiveHours[0]?.hour || 0}h
                </p>
              </div>
              <Activity className="h-8 w-8 text-white/30" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Módulo Mais Acessado</p>
                <p className="text-lg font-bold text-white truncate">
                  {stats.mostAccessedModules[0]?.module || "—"}
                </p>
              </div>
              <Monitor className="h-8 w-8 text-white/30" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Últimas Ações */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Últimas Ações (100 mais recentes)
          </h5>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ações..."
                className="w-64 pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="all">Todas as ações</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Criar</option>
              <option value="update">Atualizar</option>
              <option value="delete">Excluir</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/50">Carregando...</p>
        ) : filteredActivities.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma ação encontrada</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {act.action} em {act.module}/{act.resource}
                  </p>
                  <p className="text-xs text-white/50">
                    {act.ip} • {act.userAgent} •{" "}
                    {new Date(act.performedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sessões Ativas */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Sessões Ativas
          </h5>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma sessão ativa</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium text-white">{session.device}</p>
                    <p className="text-xs text-white/50">
                      {session.browser} • {session.ip} • {session.location}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Iniciada: {new Date(session.startedAt).toLocaleString("pt-BR")} • Última
                      atividade: {new Date(session.lastActivity).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleForceLogout(session.id)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Forçar Logout
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




