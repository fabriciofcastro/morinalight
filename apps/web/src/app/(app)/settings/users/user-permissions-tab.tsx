"use client";

import { Button, GlassCard, Input, Label, cn } from "@morina/ui";
import {
  CheckCircle2,
  Download,
  Filter,
  GitCompare,
  Plus,
  Search,
  Shield,
  X,
  XCircle,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type UserPermissionsTabProps = {
  userId: string;
  onUserUpdated: () => void;
};

type EffectivePermission = {
  permissionId: string;
  permissionKey: string;
  name: string;
  description: string | null;
  granted: boolean;
  origin: "position" | "sector" | "department" | "custom" | "template";
  originName: string;
};

type CustomPermission = {
  id: string;
  permissionId: string;
  permissionKey: string;
  name: string;
  description: string | null;
  granted: boolean;
  createdAt: string;
};

type PendingRequest = {
  requestId: string;
  permissionId: string;
  permissionKey: string;
  name: string;
  status: string;
  slaDueAt: string | null;
  createdAt: string;
};

type PermissionHistory = {
  id: string;
  permissionId: string;
  permissionKey?: string;
  name?: string;
  action: "granted" | "denied" | "removed";
  origin?: string;
  performedBy?: string;
  actorId?: string;
  performedAt?: string;
  createdAt?: string;
  previousValue: boolean | null;
  granted: boolean | null;
  reason?: string | null;
};

export function UserPermissionsTab({ userId, onUserUpdated }: UserPermissionsTabProps) {
  const [loading, setLoading] = useState(true);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [customPermissions, setCustomPermissions] = useState<CustomPermission[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [history, setHistory] = useState<PermissionHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<"all" | EffectivePermission["origin"]>("all");
  const [historyFilter, setHistoryFilter] = useState<"all" | "granted" | "revoked" | "custom" | "template">("all");
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [selectedGranted, setSelectedGranted] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PermissionHistory | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const [effRes, customRes, pendingRes, histRes] = await Promise.all([
        fetch(`/api/users/${userId}/permissions/effective`, { headers }),
        fetch(`/api/users/${userId}/permissions/custom`, { headers }),
        fetch(`/api/permissions/change-requests?userId=${userId}&status=pending`, { headers }),
        fetch(`/api/users/${userId}/permissions/history`, { headers }),
      ]);

      if (effRes.ok) {
        const data = await effRes.json();
        setEffectivePermissions(data.itens || []);
      }
      if (customRes.ok) {
        const data = await customRes.json();
        setCustomPermissions(data.itens || []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRequests(data.itens || []);
      }
      if (histRes.ok) {
        const data = await histRes.json();
        // Mapear os dados da API para o formato esperado
        const mappedHistory: PermissionHistory[] = (data.itens || []).map((item: {
          id: string;
          permissionId: string;
          action: string;
          previousValue: boolean | null;
          granted: boolean | null;
          actorId: string;
          createdAt: string;
          reason: string | null;
          entityType?: string;
        }) => ({
          id: item.id,
          permissionId: item.permissionId,
          permissionKey: item.permissionId, // Usar permissionId como fallback
          name: item.permissionId, // Será atualizado se tivermos dados da permissão
          action: item.action as "granted" | "denied" | "removed",
          origin: item.entityType || "custom",
          performedBy: item.actorId,
          actorId: item.actorId,
          performedAt: item.createdAt,
          createdAt: item.createdAt,
          previousValue: item.previousValue,
          granted: item.granted,
          reason: item.reason,
        }));
        setHistory(mappedHistory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredEffective = effectivePermissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.permissionKey.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrigin = originFilter === "all" || perm.origin === originFilter;
    return matchesSearch && matchesOrigin;
  });

  const filteredHistory = useMemo(() => {
    let filtered = history;
    if (historyFilter === "granted") filtered = filtered.filter((h) => h.action === "granted");
    else if (historyFilter === "revoked") filtered = filtered.filter((h) => h.action === "denied" || h.action === "removed");
    else if (historyFilter === "custom") filtered = filtered.filter((h) => h.origin === "custom" || h.origin === "user");
    else if (historyFilter === "template") filtered = filtered.filter((h) => h.origin === "template");
    return filtered;
  }, [history, historyFilter]);

  const handleAddCustomPermission = async () => {
    if (!selectedPermissionId) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions/custom`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          permissionId: selectedPermissionId,
          granted: selectedGranted,
        }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Permissão customizada adicionada.",
        });
        setAddPermissionOpen(false);
        setSelectedPermissionId("");
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveCustomPermission = async (permissionId: string) => {
    if (!confirm("Tem certeza que deseja remover esta permissão customizada?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/permissions/custom/${permissionId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Permissão customizada removida.",
        });
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Permissões Efetivas */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Permissões Efetivas (Resolvidas)
          </h5>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar permissões..."
                className="w-64 pl-10"
              />
            </div>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value as typeof originFilter)}
              className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="all">Todas as origens</option>
              <option value="position">Cargo</option>
              <option value="sector">Setor</option>
              <option value="department">Departamento</option>
              <option value="custom">Customizada</option>
              <option value="template">Template</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/50">Carregando...</p>
        ) : filteredEffective.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma permissão encontrada</p>
        ) : (
          <div className="space-y-2">
            {filteredEffective.map((perm) => (
              <div
                key={perm.permissionId}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  {perm.granted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{perm.name}</p>
                    <p className="text-xs text-white/50">{perm.description || perm.permissionKey}</p>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                        perm.origin === "position" && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                        perm.origin === "sector" && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                        perm.origin === "department" &&
                          "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                        perm.origin === "custom" &&
                          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                        perm.origin === "template" &&
                          "bg-green-500/20 text-green-400 border border-green-500/30",
                      )}
                    >
                      {perm.origin === "position" && "Cargo"}
                      {perm.origin === "sector" && "Setor"}
                      {perm.origin === "department" && "Departamento"}
                      {perm.origin === "custom" && "Custom"}
                      {perm.origin === "template" && "Template"}: {perm.originName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissões Customizadas */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Permissões Customizadas
          </h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddPermissionOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {customPermissions.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma permissão customizada</p>
        ) : (
          <div className="space-y-2">
            {customPermissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{perm.name}</p>
                    <p className="text-xs text-white/50">{perm.description || perm.permissionKey}</p>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                        perm.granted
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30",
                      )}
                    >
                      {perm.granted ? "Concedida" : "Negada"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomPermission(perm.id)}
                  className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {addPermissionOpen && (
          <GlassCard className="mt-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="permission-select">Permissão</Label>
                <select
                  id="permission-select"
                  value={selectedPermissionId}
                  onChange={(e) => setSelectedPermissionId(e.target.value)}
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione uma permissão</option>
                  {/* TODO: Carregar catálogo de permissões */}
                </select>
              </div>
              <div>
                <Label htmlFor="permission-granted">Status</Label>
                <select
                  id="permission-granted"
                  value={selectedGranted ? "true" : "false"}
                  onChange={(e) => setSelectedGranted(e.target.value === "true")}
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="true">Concedida</option>
                  <option value="false">Negada</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddPermissionOpen(false);
                    setSelectedPermissionId("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddCustomPermission}>
                  Adicionar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Solicitações Pendentes */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Solicitações Pendentes
          </h5>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma solicitação pendente</p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="flex items-center justify-between border border-yellow-500/30 bg-yellow-500/10 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{req.name}</p>
                  <p className="text-xs text-white/50">
                    Status: {req.status} • Criada em{" "}
                    {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  {req.slaDueAt && (
                    <p className="text-xs text-yellow-400 mt-1">
                      SLA: {new Date(req.slaDueAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <Button type="button" variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Histórico de Permissões
          </h5>
          <div className="flex items-center gap-2">
            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value as typeof historyFilter)}
              className="flex h-9 border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="granted">Concedidas</option>
              <option value="revoked">Revogadas</option>
              <option value="custom">Customizadas</option>
              <option value="template">Templates</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  if (filteredHistory.length === 0) {
                    notificationCenter.add({
                      type: "warning",
                      title: "Nenhum dado para exportar",
                      message: "Não há histórico para exportar com os filtros aplicados.",
                    });
                    return;
                  }

                  const exportData = filteredHistory.map((item) => ({
                    ID: item.id,
                    "Chave da Permissão": item.permissionKey,
                    Nome: item.name,
                    Ação:
                      item.action === "granted"
                        ? "Concedida"
                        : item.action === "denied"
                          ? "Negada"
                          : "Removida",
                    Origem: item.origin,
                    "Realizado Por": item.performedBy,
                    "Data": new Date(item.performedAt).toLocaleString("pt-BR"),
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
                  link.download = `historico_permissoes_usuario_${userId}_${new Date().toISOString().split("T")[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  notificationCenter.add({
                    type: "success",
                    title: "Exportação concluída",
                    message: `${filteredHistory.length} registro(s) de histórico exportado(s) com sucesso.`,
                  });
                } catch (error) {
                  console.error("Erro ao exportar histórico:", error);
                  notificationCenter.add({
                    type: "error",
                    title: "Erro na exportação",
                    message: "Não foi possível exportar o histórico de permissões.",
                  });
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-white/50">
            {history.length === 0
              ? "Nenhum histórico disponível"
              : "Nenhum histórico encontrado com os filtros aplicados"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.action === "granted" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.action === "granted" ? "Concedida" : "Revogada"}: {item.name}
                    </p>
                    <p className="text-xs text-white/50">
                      Origem: {item.origin} • Por {item.performedBy} em{" "}
                      {new Date(item.performedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




