"use client";

import { Button, cn, GlassCard, Input } from "@morina/ui";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Signal,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { invalidatePermissionsCache } from "@/hooks/use-permissions";
import {
  type Department,
  organizationalStructureApi,
  type Position,
  type Sector,
} from "@/lib/api/organizational-structure";
import { type Permission, permissionsApi } from "@/lib/api/permissions";
import { type User, usersApi } from "@/lib/api/users";

type PermissionGrant = {
  permissionKey: string;
  granted: boolean;
  sourceEntityId?: string;
};

type EffectiveBreakdown = {
  role?: string[];
  departments?: PermissionGrant[];
  sectors?: PermissionGrant[];
  positions?: PermissionGrant[];
  custom?: PermissionGrant[];
};

type EffectiveResponse = {
  userId: string;
  orgId: string;
  role: string | null;
  effective: Array<{ permissionKey: string; granted: boolean }>;
  denied: string[];
  breakdown?: EffectiveBreakdown;
};

type Layer = "department" | "sector" | "position" | "custom";

type AuditLogEntry = {
  id: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  action: "granted" | "denied" | "removed";
  granted: boolean | null;
  previousValue: boolean | null;
  actorId: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string | Date;
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function PermissionMatrixClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersSearch, setUsersSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);

  const [effective, setEffective] = useState<EffectiveResponse | null>(null);
  const [effectiveLoading, setEffectiveLoading] = useState(false);
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [onlyDenied, setOnlyDenied] = useState(false);

  const [traceKey, setTraceKey] = useState<string>("settings:permissions:view");

  const [actionLayer, setActionLayer] = useState<Layer>("department");
  const [actionEntityId, setActionEntityId] = useState<string>("");
  const [actionPermissionId, setActionPermissionId] = useState<string>("");
  const [actionGranted, setActionGranted] = useState<boolean>(true);
  const [actionReason, setActionReason] = useState<string>("");
  const [actionBusy, setActionBusy] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{
    requestId: string;
    status: "pending" | "approved" | "rejected" | "cancelled" | string;
    permissionKey?: string;
  } | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [lastRealtimeSignal, setLastRealtimeSignal] = useState<{ at: number; by?: string } | null>(
    null,
  );

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const data = await usersApi.list();
      setUsers(data);
      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0].userId);
      }
    } catch (error) {
      console.error("Failed to load users", error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [selectedUserId]);

  const loadCatalogs = useCallback(async () => {
    try {
      setPermissionsLoading(true);
      const perms = await permissionsApi.getPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error("Failed to load permissions catalog", error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  const loadOrgStructure = useCallback(async () => {
    try {
      setOrgLoading(true);
      const [deps, secs, poss] = await Promise.all([
        organizationalStructureApi.getDepartments(),
        organizationalStructureApi.getSectors(),
        organizationalStructureApi.getPositions(),
      ]);
      setDepartments(deps);
      setSectors(secs);
      setPositions(poss);
    } catch (error) {
      console.error("Failed to load org structure", error);
      setDepartments([]);
      setSectors([]);
      setPositions([]);
    } finally {
      setOrgLoading(false);
    }
  }, []);

  const loadEffective = useCallback(async (userId: string) => {
    try {
      setEffectiveLoading(true);
      const res = await fetch(`/api/users/${userId}/permissions/effective`, { cache: "no-store" });
      if (!res.ok) {
        setEffective(null);
        return;
      }
      const data = (await res.json()) as unknown;
      const obj =
        data && typeof data === "object"
          ? (data as Partial<EffectiveResponse> & Record<string, unknown>)
          : ({} as Partial<EffectiveResponse> & Record<string, unknown>);

      const breakdownRaw = (obj as { breakdown?: unknown }).breakdown;
      const breakdownObj =
        breakdownRaw && typeof breakdownRaw === "object"
          ? (breakdownRaw as Partial<EffectiveBreakdown> & Record<string, unknown>)
          : null;

      const parseGrants = (value: unknown): PermissionGrant[] => {
        if (!Array.isArray(value)) return [];
        return value
          .map((v) => (v && typeof v === "object" ? (v as Record<string, unknown>) : null))
          .filter((v): v is Record<string, unknown> => Boolean(v))
          .filter((v) => typeof v.permissionKey === "string" && typeof v.granted === "boolean")
          .map((v) => ({
            permissionKey: String(v.permissionKey),
            granted: Boolean(v.granted),
            sourceEntityId: typeof v.sourceEntityId === "string" ? v.sourceEntityId : undefined,
          }));
      };

      const breakdown: EffectiveBreakdown | undefined = breakdownObj
        ? {
            role: Array.isArray(breakdownObj.role)
              ? (breakdownObj.role as unknown[]).filter((k): k is string => typeof k === "string")
              : [],
            departments: parseGrants(breakdownObj.departments),
            sectors: parseGrants(breakdownObj.sectors),
            positions: parseGrants(breakdownObj.positions),
            custom: parseGrants(breakdownObj.custom),
          }
        : undefined;

      const effectiveRaw = Array.isArray(obj.effective) ? (obj.effective as unknown[]) : [];
      const eff = effectiveRaw
        .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>) : null))
        .filter((p): p is Record<string, unknown> =>
          Boolean(p && typeof p.permissionKey === "string"),
        )
        .map((p) => ({ permissionKey: String(p.permissionKey), granted: Boolean(p.granted) }));

      const denied = Array.isArray(obj.denied)
        ? (obj.denied as unknown[]).filter((k): k is string => typeof k === "string")
        : [];

      const roleValue = obj.role;
      setEffective({
        userId: safeString(obj.userId) || userId,
        orgId: safeString(obj.orgId),
        role:
          typeof roleValue === "string" || roleValue === null ? (roleValue as string | null) : null,
        effective: eff,
        denied,
        breakdown,
      });
    } catch (error) {
      console.error("Failed to load effective permissions", error);
      setEffective(null);
    } finally {
      setEffectiveLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    const entityType = actionLayer === "custom" ? "user" : actionLayer;
    const entityId = actionLayer === "custom" ? (selectedUserId ?? "") : actionEntityId;

    if (!entityId || !actionPermissionId) {
      setAuditLogs([]);
      return;
    }

    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      params.set("entityType", entityType);
      params.set("entityId", entityId);
      params.set("permissionId", actionPermissionId);
      if (auditSearch.trim()) params.set("search", auditSearch.trim());
      params.set("limite", "25");

      const res = await fetch(`/api/permissions/audit-log?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setAuditLogs([]);
        return;
      }
      const data = (await res.json()) as unknown;
      const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
      const itensValue = (obj as { itens?: unknown }).itens;
      const itensRaw = Array.isArray(itensValue) ? (itensValue as unknown[]) : [];
      const itens = itensRaw
        .map((v) => (v && typeof v === "object" ? (v as Record<string, unknown>) : null))
        .filter((v): v is Record<string, unknown> => Boolean(v))
        .filter((v) => typeof v.id === "string")
        .map((v) => ({
          id: String(v.id),
          entityType: v.entityType as AuditLogEntry["entityType"],
          entityId: String(v.entityId),
          permissionId: String(v.permissionId),
          action: v.action as AuditLogEntry["action"],
          granted: (typeof v.granted === "boolean" ? v.granted : null) as boolean | null,
          previousValue: typeof v.previousValue === "boolean" ? (v.previousValue as boolean) : null,
          actorId: String(v.actorId),
          reason: typeof v.reason === "string" ? v.reason : null,
          metadata:
            v.metadata && typeof v.metadata === "object"
              ? (v.metadata as Record<string, unknown>)
              : null,
          createdAt:
            typeof v.createdAt === "string" || v.createdAt instanceof Date
              ? v.createdAt
              : String(v.createdAt),
        })) as AuditLogEntry[];

      setAuditLogs(itens);
    } catch (error) {
      console.error("Failed to load audit logs", error);
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  }, [actionEntityId, actionLayer, actionPermissionId, auditSearch, selectedUserId]);

  useEffect(() => {
    void loadUsers();
    void loadCatalogs();
    void loadOrgStructure();
  }, [loadCatalogs, loadOrgStructure, loadUsers]);

  useEffect(() => {
    if (!selectedUserId) return;
    void loadEffective(selectedUserId);
  }, [loadEffective, selectedUserId]);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ event?: { name?: string } }>).detail;
      const by = detail?.event?.name ? String(detail.event.name) : undefined;
      setLastRealtimeSignal({ at: Date.now(), by });
    };
    window.addEventListener("realtime-permissions-refreshed", handler as EventListener);
    return () =>
      window.removeEventListener("realtime-permissions-refreshed", handler as EventListener);
  }, []);

  const filteredUsers = useMemo(() => {
    const q = usersSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.displayName} ${u.email}`.toLowerCase().includes(q));
  }, [users, usersSearch]);

  const keyList = useMemo(() => {
    const q = effectiveSearch.trim().toLowerCase();
    const keys = onlyDenied
      ? (effective?.denied ?? [])
      : (effective?.effective ?? []).map((p) => p.permissionKey);
    const unique = Array.from(new Set(keys)).sort();
    if (!q) return unique;
    return unique.filter((k) => k.toLowerCase().includes(q));
  }, [effective, effectiveSearch, onlyDenied]);

  const trace = useMemo(() => {
    const key = traceKey.trim();
    if (!key) return null;
    const b = effective?.breakdown;
    const roleHas = (b?.role ?? []).includes(key);
    const departments = (b?.departments ?? []).filter((g) => g.permissionKey === key);
    const sectors = (b?.sectors ?? []).filter((g) => g.permissionKey === key);
    const positionsGrants = (b?.positions ?? []).filter((g) => g.permissionKey === key);
    const custom = (b?.custom ?? []).filter((g) => g.permissionKey === key);
    const denied = effective?.denied?.includes(key) ?? false;
    const allowed = effective?.effective?.some((p) => p.permissionKey === key) ?? false;
    const final = denied ? "denied" : allowed ? "allowed" : "missing";

    return {
      key,
      final,
      roleHas,
      departments,
      sectors,
      positions: positionsGrants,
      custom,
      hasBreakdown: Boolean(b),
    };
  }, [effective, traceKey]);

  const entityOptions = useMemo(() => {
    if (actionLayer === "custom") {
      return [];
    }
    const opts =
      actionLayer === "department"
        ? departments.map((d) => ({ id: d.id, label: `${d.name} • ${d.code}` }))
        : actionLayer === "sector"
          ? sectors.map((s) => ({ id: s.id, label: `${s.name} • ${s.code}` }))
          : positions.map((p) => ({ id: p.id, label: `${p.name} • ${p.code}` }));
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [actionLayer, departments, positions, sectors]);

  const permissionOptions = useMemo(() => {
    return permissions
      .map((p) => ({ id: p.id, label: `${p.name} • ${p.code} • ${p.module}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);

  const canApplyAction = useMemo(() => {
    if (!selectedUserId) return false;
    if (!actionPermissionId) return false;
    if (actionLayer === "custom") return true;
    return Boolean(actionEntityId);
  }, [actionEntityId, actionLayer, actionPermissionId, selectedUserId]);

  const applyGrantDeny = useCallback(async () => {
    if (!selectedUserId) return;
    if (!canApplyAction) return;
    try {
      setActionBusy(true);
      const base =
        actionLayer === "custom"
          ? `/api/users/${selectedUserId}/permissions/custom`
          : actionLayer === "department"
            ? `/api/departments/${actionEntityId}/permissions`
            : actionLayer === "sector"
              ? `/api/sectors/${actionEntityId}/permissions`
              : `/api/positions/${actionEntityId}/permissions`;

      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionId: actionPermissionId,
          granted: actionGranted,
          reason: actionReason.trim() || undefined,
        }),
      });

      const payload = (await res.json().catch(() => null)) as unknown;
      const obj =
        payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

      const pending = obj ? (obj as { pending?: unknown }).pending : undefined;
      const requestIdValue = obj ? (obj as { requestId?: unknown }).requestId : undefined;
      const statusValue = obj ? (obj as { status?: unknown }).status : undefined;
      const permissionKeyValue = obj
        ? (obj as { permissionKey?: unknown }).permissionKey
        : undefined;

      if (res.status === 202 && pending === true && typeof requestIdValue === "string") {
        setPendingRequest({
          requestId: requestIdValue,
          status: typeof statusValue === "string" ? statusValue : "pending",
          permissionKey: typeof permissionKeyValue === "string" ? permissionKeyValue : undefined,
        });
        return;
      }

      if (!res.ok && res.status !== 204) {
        const messageValue = obj ? (obj as { message?: unknown }).message : undefined;
        const msg =
          (typeof messageValue === "string" ? messageValue : null) ?? "Erro ao aplicar grant/deny";
        throw new Error(msg);
      }

      // Atualiza cliente
      setPendingRequest(null);
      invalidatePermissionsCache(selectedUserId);
      await loadEffective(selectedUserId);
      await loadAudit();
    } catch (error) {
      console.error("Failed to apply grant/deny", error);
      alert("Erro ao aplicar grant/deny.");
    } finally {
      setActionBusy(false);
    }
  }, [
    actionEntityId,
    actionGranted,
    actionLayer,
    actionPermissionId,
    actionReason,
    canApplyAction,
    loadAudit,
    loadEffective,
    selectedUserId,
  ]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <div className="border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Matriz de Permissões
              </h1>
              <p className="mt-1 text-sm text-white/50">
                Usuário → effective/denied/breakdown + ações por camada
                (department/sector/position).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => void loadUsers()}
              disabled={usersLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar usuários
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => selectedUserId && void loadEffective(selectedUserId)}
              disabled={!selectedUserId || effectiveLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar effective
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Left: user picker */}
          <GlassCard className="lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white/80">Usuários</div>
                <div className="text-xs text-white/50">
                  {usersLoading ? "carregando…" : `${users.length}`}
                </div>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Buscar usuário…"
                  className="pl-9"
                />
              </div>

              <div className="max-h-[540px] overflow-auto rounded-none border border-white/10">
                {usersLoading ? (
                  <div className="p-4 text-sm text-white/50">Carregando usuários…</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-white/50">Nenhum usuário encontrado.</div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredUsers.map((u) => {
                      const active = selectedUserId === u.userId;
                      return (
                        <button
                          key={u.userId}
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.userId);
                            setTraceKey("settings:permissions:view");
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 transition hover:bg-white/5",
                            active && "bg-white/5",
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm text-white/80">{u.displayName}</div>
                              <div className="truncate text-[11px] text-white/40 font-mono">
                                {u.email}
                              </div>
                            </div>
                            <div className="text-[11px] text-white/40">{u.status}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Right: matrix */}
          <GlassCard className="lg:col-span-3">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Role</div>
                  <div className="mt-1 text-sm text-white/80">{effective?.role ?? "—"}</div>
                </div>
                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Effective</div>
                  <div className="mt-1 text-sm text-white/80">
                    {effective?.effective?.length ?? 0}
                  </div>
                </div>
                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Denied</div>
                  <div className="mt-1 text-sm text-white/80">{effective?.denied?.length ?? 0}</div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-white/70">Lista</div>
                    <button
                      type="button"
                      onClick={() => setOnlyDenied((v) => !v)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-none border px-2 py-1 text-[11px] transition",
                        onlyDenied
                          ? "border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.10)] text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:text-white",
                      )}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {onlyDenied ? "Negadas" : "Efetivas"}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-white/40" />
                    <Input
                      value={effectiveSearch}
                      onChange={(e) => setEffectiveSearch(e.target.value)}
                      placeholder="Filtrar por permissionKey…"
                      className="font-mono"
                    />
                  </div>

                  <div className="mt-3 max-h-[300px] overflow-auto space-y-1">
                    {keyList.slice(0, 600).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTraceKey(k)}
                        className={cn(
                          "w-full text-left rounded-none border px-2 py-1 text-[11px] font-mono transition",
                          effective?.denied?.includes(k)
                            ? "border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.12)]"
                            : "border-white/10 bg-white/5 text-white/75 hover:bg-white/8",
                        )}
                      >
                        {k}
                      </button>
                    ))}
                    {keyList.length === 0 && (
                      <div className="text-sm text-white/50">
                        Nada para exibir (ou filtros ocultando tudo).
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-white/70">RBAC Trace</div>
                    <div className="text-[11px] text-white/40">
                      {trace?.hasBreakdown ? "breakdown ok" : "—"}
                    </div>
                  </div>

                  <div className="mt-2 rounded-none border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/75 font-mono">
                    {trace?.key ?? "—"}
                  </div>

                  {!trace ? (
                    <div className="mt-3 text-sm text-white/50">Selecione um permissionKey.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {trace.final === "allowed" ? (
                          <span className="inline-flex items-center gap-1 border border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.10)] px-2 py-1 text-xs text-[hsl(var(--success))]">
                            <CheckCircle2 className="h-4 w-4" /> ALLOWED
                          </span>
                        ) : trace.final === "denied" ? (
                          <span className="inline-flex items-center gap-1 border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.10)] px-2 py-1 text-xs text-[hsl(var(--danger))]">
                            <XCircle className="h-4 w-4" /> DENIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
                            <Filter className="h-4 w-4" /> NÃO ENCONTRADA
                          </span>
                        )}
                        <span className="text-xs text-white/50">deny wins</span>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-none border border-white/10 bg-black/20 p-2">
                          <div className="text-[11px] text-white/50">Role</div>
                          <div className="mt-1 text-[11px] text-white/70">
                            {trace.roleHas ? "grant (legacy)" : "—"}
                          </div>
                        </div>
                        <div className="rounded-none border border-white/10 bg-black/20 p-2">
                          <div className="text-[11px] text-white/50">Custom</div>
                          <div className="mt-1 text-[11px] text-white/70">
                            {trace.custom.length === 0 ? "—" : `${trace.custom.length} regra(s)`}
                          </div>
                        </div>
                      </div>

                      {(
                        [
                          { label: "Departments", items: trace.departments },
                          { label: "Sectors", items: trace.sectors },
                          { label: "Positions", items: trace.positions },
                        ] as const
                      ).map((b) => (
                        <div
                          key={b.label}
                          className="rounded-none border border-white/10 bg-black/20 p-2"
                        >
                          <div className="text-[11px] text-white/50">{b.label}</div>
                          <div className="mt-1 space-y-1">
                            {b.items.length === 0 ? (
                              <div className="text-[11px] text-white/40">—</div>
                            ) : (
                              b.items.slice(0, 10).map((g, idx) => (
                                <div
                                  key={`${g.permissionKey}-${idx}`}
                                  className={cn(
                                    "rounded-none border px-2 py-1 text-[11px] font-mono",
                                    g.granted
                                      ? "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
                                      : "border-[hsl(var(--danger)/0.25)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]",
                                  )}
                                >
                                  {g.granted ? "grant" : "deny"}
                                  {g.sourceEntityId ? ` • ${g.sourceEntityId}` : ""}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-none border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/80">
                    Ações (grant/deny por camada)
                  </div>
                  <div className="text-xs text-white/50">
                    {permissionsLoading || orgLoading ? "carregando catálogo…" : "pronto"}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-white/50">Camada</div>
                    <select
                      value={actionLayer}
                      onChange={(e) => {
                        setActionLayer(e.target.value as Layer);
                        setActionEntityId("");
                      }}
                      className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                    >
                      <option value="department">department</option>
                      <option value="sector">sector</option>
                      <option value="position">position</option>
                      <option value="custom">custom (user)</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-white/50">Entidade</div>
                    <select
                      value={actionEntityId}
                      onChange={(e) => setActionEntityId(e.target.value)}
                      disabled={actionLayer === "custom"}
                      className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                    >
                      {actionLayer === "custom" ? (
                        <option value="">
                          {selectedUserId ? `user: ${selectedUserId}` : "Selecione um usuário"}
                        </option>
                      ) : (
                        <>
                          <option value="">Selecione…</option>
                          {entityOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs text-white/50">Permissão</div>
                    <select
                      value={actionPermissionId}
                      onChange={(e) => setActionPermissionId(e.target.value)}
                      className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                    >
                      <option value="">Selecione…</option>
                      {permissionOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs text-white/50">Motivo (audit)</div>
                    <Input
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Opcional — por que essa mudança?"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/50">Ação</div>
                    <select
                      value={actionGranted ? "grant" : "deny"}
                      onChange={(e) => setActionGranted(e.target.value === "grant")}
                      className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
                    >
                      <option value="grant">grant</option>
                      <option value="deny">deny</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => void applyGrantDeny()}
                      disabled={!canApplyAction || actionBusy || permissionsLoading || orgLoading}
                      className="w-full"
                    >
                      {actionBusy ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Aplicando…
                        </>
                      ) : (
                        <>
                          <Filter className="mr-2 h-4 w-4" />
                          Aplicar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {pendingRequest ? (
                  <div className="mt-3 rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white/85">
                          Mudança enviada para aprovação
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          <span className="text-white/70">Request</span>{" "}
                          <span className="font-mono text-white/75">
                            {pendingRequest.requestId}
                          </span>{" "}
                          <span className="text-white/70">• status</span>{" "}
                          <span className="text-white/75">{pendingRequest.status}</span>
                          {pendingRequest.permissionKey ? (
                            <>
                              {" "}
                              <span className="text-white/70">• permissão</span>{" "}
                              <span className="font-mono text-white/75">
                                {pendingRequest.permissionKey}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href="/admin/permissions/approvals"
                        className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 backdrop-blur-xl hover:bg-white/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir fila
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 text-[11px] text-white/40">
                  Observação: esta ação altera permissões na entidade
                  (department/sector/position/custom). O effective do usuário muda conforme
                  membership + deny-wins.
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Clock className="h-4 w-4 text-[hsl(var(--accent))]" />
                      Audit Trail (contextual)
                    </div>
                    <Button variant="secondary" type="button" onClick={() => void loadAudit()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-white/40" />
                    <Input
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Filtrar por actorId/reason…"
                      className="flex-1"
                    />
                  </div>

                  <div className="mt-3 max-h-[240px] overflow-auto space-y-2">
                    {auditLoading ? (
                      <div className="text-sm text-white/50">Carregando auditoria…</div>
                    ) : auditLogs.length === 0 ? (
                      <div className="text-sm text-white/50">
                        Selecione “Entidade” + “Permissão” nas Ações para ver o histórico
                        contextual.
                      </div>
                    ) : (
                      auditLogs.map((l) => {
                        const metaKey = l.metadata?.permissionKey;
                        const metaKeyStr = typeof metaKey === "string" ? metaKey : null;
                        const badge =
                          l.action === "granted"
                            ? "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
                            : l.action === "denied"
                              ? "border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]"
                              : "border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]";

                        return (
                          <div
                            key={l.id}
                            className="rounded-none border border-white/10 bg-white/5 p-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    "inline-flex items-center gap-2 border px-2 py-0.5 text-[11px] font-mono",
                                    badge,
                                  )}
                                >
                                  {l.action.toUpperCase()}
                                </div>
                                <div className="mt-1 text-[11px] text-white/60 font-mono truncate">
                                  {metaKeyStr ?? l.permissionId}
                                </div>
                              </div>
                              <div className="text-[11px] text-white/40">
                                {new Date(l.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
                              <span className="font-mono">actor: {l.actorId}</span>
                              {l.reason ? (
                                <span className="truncate">• reason: {l.reason}</span>
                              ) : null}
                              {typeof l.previousValue === "boolean" ? (
                                <span className="font-mono">• prev: {String(l.previousValue)}</span>
                              ) : null}
                              {typeof l.granted === "boolean" ? (
                                <span className="font-mono">• new: {String(l.granted)}</span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Signal className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Eventos & Mensageria
                  </div>

                  <div className="mt-2 rounded-none border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/50">Último sinal de refresh</div>
                    <div className="mt-2 text-sm text-white/70">
                      {lastRealtimeSignal
                        ? `${new Date(lastRealtimeSignal.at).toLocaleString()}${lastRealtimeSignal.by ? ` • ${lastRealtimeSignal.by}` : ""}`
                        : "—"}
                    </div>
                    <div className="mt-2 text-[11px] text-white/50">
                      Após aplicar grant/deny, espere o evento `Permissions.*` e a UI deve refletir
                      automaticamente.
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/admin/realtime-lab">
                      <Button type="button">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir Realtime Lab
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => selectedUserId && invalidatePermissionsCache(selectedUserId)}
                    >
                      Invalidar cache (user)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
