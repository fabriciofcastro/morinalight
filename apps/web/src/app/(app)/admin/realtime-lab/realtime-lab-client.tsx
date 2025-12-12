"use client";

import { createRealtimeClient, type RealtimeEvent } from "@morina/realtime-client";
import { Button, cn, GlassCard, Input } from "@morina/ui";
import {
  Activity,
  ArrowDownToLine,
  Bolt,
  CheckCircle2,
  CircleDot,
  Clock,
  Filter,
  Pause,
  Play,
  RefreshCw,
  Search,
  Shield,
  Signal,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnectionStatus } from "../../../../hooks/use-connection-status";
import {
  getPermissionsCacheSnapshot,
  invalidatePermissionsCache,
} from "../../../../hooks/use-permissions";
import { getAuthUser } from "../../../../lib/auth-client";
import { apiUrl, defaultActorId, defaultOrgId, realtimeUrl } from "../../../../lib/env";

type LabEvent = {
  id: string;
  receivedAt: number;
  name: string;
  version?: string;
  metadata?: Record<string, unknown>;
  payload?: unknown;
  raw: RealtimeEvent;
};

type LabTab = "overview" | "events" | "rbac" | "rbac-trace";

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString();
}

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) return selectedOrgId;
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      return orgs[0]?.organizationId ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

function badgeForEvent(name: string) {
  if (name.startsWith("Permissions."))
    return {
      label: "RBAC",
      className:
        "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]",
    };
  if (name.toLowerCase().includes("notification"))
    return {
      label: "NOTIF",
      className:
        "border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.10)] text-[hsl(var(--accent))]",
    };
  if (name.toLowerCase().includes("audit"))
    return {
      label: "AUDIT",
      className:
        "border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.10)] text-[hsl(var(--warning))]",
    };
  return {
    label: "EVT",
    className:
      "border-[hsl(var(--border))] bg-[hsl(var(--surface)/0.35)] text-[hsl(var(--foreground))]",
  };
}

export function RealtimeLabClient() {
  const [tab, setTab] = useState<LabTab>("overview");
  const [mounted, setMounted] = useState(false);

  const [orgId, setOrgId] = useState<string>(defaultOrgId);
  const [actorId, setActorId] = useState<string>(defaultActorId);

  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected" | "error">(
    "disconnected",
  );
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [onlyPermissions, setOnlyPermissions] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [events, setEvents] = useState<LabEvent[]>([]);
  const maxEvents = 250;

  const realtimeRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const isConnectingRef = useRef(false);
  const [lastPermissionsRefresh, setLastPermissionsRefresh] = useState<{
    at: number;
    by?: string;
  } | null>(null);

  const conn = useConnectionStatus();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const user = getAuthUser();
    queueMicrotask(() => {
      setActorId(user?.userId ?? defaultActorId);
      setOrgId(getCurrentOrgId() ?? defaultOrgId);
    });
  }, [mounted]);

  const connect = useCallback(() => {
    if (!mounted || !orgId || !actorId) return;
    if (typeof window === "undefined") return;
    if (isConnectingRef.current || realtimeRef.current) return;

    isConnectingRef.current = true;
    setWsStatus("connecting");

    const client = createRealtimeClient({
      apiUrl: typeof window !== "undefined" ? window.location.origin : "",
      realtimeUrl,
      orgId,
      actorId,
      onEvent: (event: RealtimeEvent) => {
        if (paused) return;

        const name = String(event.name ?? "unknown");
        if (onlyPermissions && !name.startsWith("Permissions.")) {
          return;
        }

        const labEvent: LabEvent = {
          id: String(event.metadata?.eventId ?? crypto.randomUUID()),
          receivedAt: Date.now(),
          name,
          version: typeof event.version === "string" ? event.version : undefined,
          metadata: (event.metadata ?? undefined) as Record<string, unknown> | undefined,
          payload: event.payload,
          raw: event,
        };

        setEvents((prev) => {
          const next = [labEvent, ...prev];
          return next.slice(0, maxEvents);
        });
      },
      onOpen: () => {
        setWsStatus("connected");
      },
      onClose: () => {
        realtimeRef.current = null;
        isConnectingRef.current = false;
        setWsStatus("disconnected");
      },
      onError: () => {
        realtimeRef.current = null;
        isConnectingRef.current = false;
        setWsStatus("error");
      },
      reconnectAttempts: 10,
      reconnectIntervalMs: 3000,
    });

    realtimeRef.current = client;
    void client.connect();
  }, [actorId, mounted, onlyPermissions, orgId, paused]);

  const disconnect = useCallback(() => {
    if (realtimeRef.current) {
      realtimeRef.current.disconnect();
      realtimeRef.current = null;
    }
    isConnectingRef.current = false;
    setWsStatus("disconnected");
  }, []);

  useEffect(() => {
    // auto-connect
    queueMicrotask(() => connect());
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (!mounted) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ event?: RealtimeEvent }>).detail;
      const eventName = detail?.event?.name ? String(detail.event.name) : "Permissions.*";
      setLastPermissionsRefresh({ at: Date.now(), by: eventName });
    };
    window.addEventListener("realtime-permissions-refreshed", handler as EventListener);
    return () =>
      window.removeEventListener("realtime-permissions-refreshed", handler as EventListener);
  }, [mounted]);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const hay =
        `${e.name} ${safeStringify(e.payload)} ${safeStringify(e.metadata)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [events, search]);

  const selected = useMemo(
    () => filteredEvents.find((e) => e.id === selectedEventId) ?? null,
    [filteredEvents, selectedEventId],
  );

  const counters = useMemo(() => {
    const byName = new Map<string, number>();
    for (const e of filteredEvents) {
      byName.set(e.name, (byName.get(e.name) ?? 0) + 1);
    }
    return Array.from(byName.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [filteredEvents]);

  const permissionsCache = getPermissionsCacheSnapshot();

  const refreshEffective = useCallback(async () => {
    // Força revalidação do RBAC no cliente (via endpoint effective)
    invalidatePermissionsCache(actorId);
    await fetch(`/api/users/${actorId}/permissions/effective`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).catch(() => null);
    setLastPermissionsRefresh({ at: Date.now(), by: "manual" });
  }, [actorId]);

  type EffectiveResponse = {
    role?: string | null;
    effective?: Array<{ permissionKey: string }>;
    denied?: string[];
    breakdown?: {
      role?: string[];
      departments?: Array<{ permissionKey: string; granted: boolean; sourceEntityId?: string }>;
      sectors?: Array<{ permissionKey: string; granted: boolean; sourceEntityId?: string }>;
      positions?: Array<{ permissionKey: string; granted: boolean; sourceEntityId?: string }>;
      custom?: Array<{ permissionKey: string; granted: boolean; sourceEntityId?: string }>;
    };
  };

  const [effectivePreview, setEffectivePreview] = useState<EffectiveResponse | null>(null);

  const loadEffectivePreview = useCallback(async () => {
    const res = await fetch(`/api/users/${actorId}/permissions/effective`, { cache: "no-store" });
    if (!res.ok) {
      setEffectivePreview(null);
      return;
    }
    const data = (await res.json()) as unknown;
    const obj =
      (data && typeof data === "object"
        ? (data as Partial<EffectiveResponse> & Record<string, unknown>)
        : null) ?? ({} as Partial<EffectiveResponse> & Record<string, unknown>);

    const roleRaw = obj.role;
    const role = typeof roleRaw === "string" || roleRaw === null ? roleRaw : undefined;
    const effectiveRaw = obj.effective;
    const deniedRaw = obj.denied;

    const effective = Array.isArray(effectiveRaw)
      ? effectiveRaw
          .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>) : null))
          .filter((p): p is Record<string, unknown> =>
            Boolean(p && typeof (p as { permissionKey?: unknown }).permissionKey === "string"),
          )
          .map((p) => ({ permissionKey: String((p as { permissionKey?: unknown }).permissionKey) }))
      : [];

    const denied = Array.isArray(deniedRaw)
      ? deniedRaw.filter((k): k is string => typeof k === "string")
      : [];

    const breakdownRaw = obj.breakdown;
    const breakdownObj =
      breakdownRaw && typeof breakdownRaw === "object"
        ? (breakdownRaw as Record<string, unknown>)
        : null;

    const safeGrantArray = (value: unknown) => {
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

    const breakdown = breakdownObj
      ? {
          role: Array.isArray(breakdownObj.role)
            ? breakdownObj.role.filter((k): k is string => typeof k === "string")
            : [],
          departments: safeGrantArray(breakdownObj.departments),
          sectors: safeGrantArray(breakdownObj.sectors),
          positions: safeGrantArray(breakdownObj.positions),
          custom: safeGrantArray(breakdownObj.custom),
        }
      : undefined;

    setEffectivePreview({ role, effective, denied, breakdown });
  }, [actorId]);

  useEffect(() => {
    if (!mounted) return;
    queueMicrotask(() => {
      void loadEffectivePreview();
    });
  }, [loadEffectivePreview, mounted]);

  const [traceKey, setTraceKey] = useState<string>("settings:permissions:view");

  const trace = useMemo(() => {
    const key = traceKey.trim();
    if (!key) return null;
    const eff = effectivePreview?.effective?.some((p) => p.permissionKey === key) ?? false;
    const denied = effectivePreview?.denied?.includes(key) ?? false;

    const breakdown = effectivePreview?.breakdown;
    const roleHas = (breakdown?.role ?? []).includes(key);
    const departments = (breakdown?.departments ?? []).filter((g) => g.permissionKey === key);
    const sectors = (breakdown?.sectors ?? []).filter((g) => g.permissionKey === key);
    const positions = (breakdown?.positions ?? []).filter((g) => g.permissionKey === key);
    const custom = (breakdown?.custom ?? []).filter((g) => g.permissionKey === key);

    const final = denied ? "denied" : eff ? "allowed" : "missing";

    return {
      key,
      final,
      roleHas,
      departments,
      sectors,
      positions,
      custom,
      hasBreakdown: Boolean(breakdown),
    };
  }, [effectivePreview, traceKey]);

  return (
    <div className="relative">
      {/* Overlays secret-lab */}
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
                <Bolt className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Realtime Lab (Mensageria & RBAC)
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  Observabilidade avançada de eventos (Redis → realtime) + sincronização de
                  permissões.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEvents([]);
                setSelectedEventId(null);
              }}
              type="button"
            >
              Limpar buffer
            </Button>
            <Button variant="secondary" onClick={() => setPaused((p) => !p)} type="button">
              {paused ? (
                <>
                  <Play className="mr-2 h-4 w-4" /> Retomar
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pausar
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                const blob = new Blob([safeStringify(events.map((e) => e.raw))], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `realtime-lab-events-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              type="button"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "overview", label: "Visão Geral", icon: Activity },
              { id: "events", label: "Stream de Eventos", icon: Signal },
              { id: "rbac", label: "RBAC (Permissões)", icon: Shield },
              { id: "rbac-trace", label: "RBAC Trace", icon: Search },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-none border px-3 py-2 text-sm backdrop-blur-xl transition",
                  active
                    ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-white shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary))/0.10,transparent_55%)]" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/80">Conectividade</div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock className="h-3.5 w-3.5" />
                    {conn.lastChecked ? conn.lastChecked.toLocaleTimeString() : "—"}
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-none border border-white/10 bg-black/20 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <CircleDot className="h-4 w-4 text-white/40" />
                      Navegador
                    </div>
                    <div className="text-sm">
                      {conn.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-300">
                          <XCircle className="h-4 w-4" /> Offline
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-none border border-white/10 bg-black/20 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Activity className="h-4 w-4 text-white/40" />
                      Backend API
                    </div>
                    <div className="text-sm">
                      {conn.backendOnline ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <TriangleAlert className="h-4 w-4" /> Indisponível
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-none border border-white/10 bg-black/20 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Signal className="h-4 w-4 text-white/40" />
                      Realtime WS
                    </div>
                    <div className="text-sm">
                      {wsStatus === "connected" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Conectado
                        </span>
                      ) : wsStatus === "connecting" ? (
                        <span className="inline-flex items-center gap-1 text-sky-300">
                          <RefreshCw className="h-4 w-4 animate-spin" /> Conectando
                        </span>
                      ) : wsStatus === "error" ? (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <TriangleAlert className="h-4 w-4" /> Erro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-white/40">
                          <XCircle className="h-4 w-4" /> Desconectado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="secondary" onClick={() => void conn.refresh()} type="button">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Revalidar
                  </Button>
                  {wsStatus === "connected" ? (
                    <Button variant="secondary" onClick={disconnect} type="button">
                      Desconectar WS
                    </Button>
                  ) : (
                    <Button onClick={connect} type="button">
                      Conectar WS
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,hsl(var(--accent))/0.10,transparent_55%)]" />
              <div className="relative space-y-3">
                <div className="text-sm font-medium text-white/80">Contexto do Tenant</div>
                <div className="grid gap-2">
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">orgId</div>
                    <div className="mt-1 font-mono text-sm text-white/80">{orgId}</div>
                  </div>
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">actorId</div>
                    <div className="mt-1 font-mono text-sm text-white/80">{actorId}</div>
                  </div>
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">API / Realtime</div>
                    <div className="mt-1 text-sm text-white/70">
                      <div className="font-mono">{apiUrl}</div>
                      <div className="font-mono">{realtimeUrl}</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,hsl(var(--primary))/0.08,transparent_55%),radial-gradient(circle_at_70%_70%,hsl(var(--accent))/0.08,transparent_55%)]" />
              <div className="relative space-y-3">
                <div className="text-sm font-medium text-white/80">Top eventos (buffer)</div>
                {counters.length === 0 ? (
                  <div className="rounded-none border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                    Nenhum evento recebido ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {counters.map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-none border border-white/10 bg-black/20 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs text-white/80">{name}</div>
                        </div>
                        <div className="ml-3 rounded-none border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "events" && (
          <div className="grid gap-4 lg:grid-cols-5">
            <GlassCard className="lg:col-span-3">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-medium text-white/80">Stream de eventos</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar em name/metadata/payload…"
                        className="w-[280px] pl-9"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setOnlyPermissions((v) => !v)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-none border px-3 py-2 text-xs backdrop-blur-xl transition",
                        onlyPermissions
                          ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.10)] text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:text-white",
                      )}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Só RBAC
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-none border border-white/10">
                  <div className="max-h-[560px] overflow-y-auto">
                    {filteredEvents.length === 0 ? (
                      <div className="p-6 text-sm text-white/50">
                        Nenhum evento no buffer (ou filtros ocultando tudo).
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {filteredEvents.map((e) => {
                          const badge = badgeForEvent(e.name);
                          const active = selectedEventId === e.id;
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => setSelectedEventId(e.id)}
                              className={cn(
                                "w-full text-left px-4 py-3 transition hover:bg-white/5",
                                active && "bg-white/5",
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-none border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                                        badge.className,
                                      )}
                                    >
                                      {badge.label}
                                    </span>
                                    <span className="truncate text-xs font-medium text-white/85">
                                      {e.name}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(e.receivedAt)}
                                    </span>
                                    <span className="font-mono">{e.id.slice(0, 8)}</span>
                                  </div>
                                </div>
                                <div className="text-xs text-white/40">{e.version ?? "—"}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="lg:col-span-2">
              <div className="space-y-3">
                <div className="text-sm font-medium text-white/80">Inspeção</div>
                {!selected ? (
                  <div className="rounded-none border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                    Selecione um evento na lista para inspecionar.
                  </div>
                ) : (
                  <>
                    <div className="rounded-none border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">name</div>
                      <div className="mt-1 wrap-break-word text-sm text-white/80">
                        {selected.name}
                      </div>
                    </div>
                    <div className="rounded-none border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">metadata</div>
                      <pre className="mt-2 max-h-[180px] overflow-auto whitespace-pre-wrap text-[11px] text-white/70">
                        {safeStringify(selected.metadata)}
                      </pre>
                    </div>
                    <div className="rounded-none border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">payload</div>
                      <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap text-[11px] text-white/70">
                        {safeStringify(selected.payload)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "rbac" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Permissões efetivas (usuário atual)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => void loadEffectivePreview()}
                      type="button"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recarregar
                    </Button>
                    <Button onClick={() => void refreshEffective()} type="button">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Forçar refresh (invalidate)
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Role (membership)</div>
                    <div className="mt-1 text-sm text-white/80">
                      {effectivePreview?.role ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Effective</div>
                    <div className="mt-1 text-sm text-white/80">
                      {effectivePreview?.effective?.length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Denied</div>
                    <div className="mt-1 text-sm text-white/80">
                      {effectivePreview?.denied?.length ?? 0}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-white/70">Lista efetiva</div>
                      <div className="text-[11px] text-white/40 font-mono">{actorId}</div>
                    </div>
                    <div className="mt-2 max-h-[360px] overflow-auto space-y-1">
                      {(effectivePreview?.effective ?? []).slice(0, 500).map((p) => (
                        <button
                          key={p.permissionKey}
                          type="button"
                          onClick={() => {
                            setTraceKey(p.permissionKey);
                            setTab("rbac-trace");
                          }}
                          className="w-full text-left rounded-none border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/75 font-mono hover:bg-white/8 transition"
                          title="Abrir RBAC Trace"
                        >
                          {p.permissionKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-white/70">Negadas (deny wins)</div>
                      <div className="text-[11px] text-white/40">
                        {lastPermissionsRefresh
                          ? `${formatTime(lastPermissionsRefresh.at)} • ${lastPermissionsRefresh.by}`
                          : "—"}
                      </div>
                    </div>
                    <div className="mt-2 max-h-[360px] overflow-auto space-y-1">
                      {(effectivePreview?.denied ?? []).slice(0, 500).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setTraceKey(k);
                            setTab("rbac-trace");
                          }}
                          className="w-full text-left rounded-none border border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] px-2 py-1 text-[11px] text-[hsl(var(--danger))] font-mono hover:bg-[hsl(var(--danger)/0.12)] transition"
                          title="Abrir RBAC Trace"
                        >
                          {k}
                        </button>
                      ))}
                      {(effectivePreview?.denied ?? []).length === 0 && (
                        <div className="text-sm text-white/50">Nenhuma negação registrada.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Signal className="h-4 w-4 text-[hsl(var(--accent))]" />
                  Cache & sinais
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Snapshot do cache (client)</div>
                  <div className="mt-2 space-y-2">
                    {permissionsCache.length === 0 ? (
                      <div className="text-sm text-white/50">Cache vazio (ainda).</div>
                    ) : (
                      permissionsCache.map(
                        (row: {
                          userId: string;
                          effectiveCount: number;
                          deniedCount: number;
                          timestamp: number;
                        }) => (
                          <div
                            key={row.userId}
                            className="rounded-none border border-white/10 bg-white/5 p-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] text-white/70 font-mono truncate">
                                {row.userId}
                              </div>
                              <div className="text-[11px] text-white/40">
                                {new Date(row.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                                {row.effectiveCount}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5 text-red-300" />
                                {row.deniedCount}
                              </span>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => invalidatePermissionsCache(actorId)}
                      type="button"
                    >
                      Invalidar (usuário)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => invalidatePermissionsCache()}
                      type="button"
                    >
                      Invalidar (global)
                    </Button>
                  </div>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">WebSocket (lab)</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm text-white/70">
                      {wsStatus === "connected" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      ) : wsStatus === "connecting" ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-sky-300" />
                      ) : wsStatus === "error" ? (
                        <TriangleAlert className="h-4 w-4 text-amber-300" />
                      ) : (
                        <XCircle className="h-4 w-4 text-white/40" />
                      )}
                      {wsStatus}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono">{orgId}</div>
                  </div>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Dica</div>
                  <div className="mt-2 text-sm text-white/60">
                    Para gerar eventos RBAC, faça um grant/deny em cargo/setor/departamento ou
                    aplique um template. A UI deve refletir sem esperar TTL.
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "rbac-trace" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                    RBAC Trace (deny wins)
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void loadEffectivePreview()}
                    type="button"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar effective
                  </Button>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">permissionKey</div>
                  <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                    <Input
                      value={traceKey}
                      onChange={(e) => setTraceKey(e.target.value)}
                      placeholder="Ex: settings:permissions:view"
                      className="font-mono"
                    />
                    <Button type="button" onClick={() => setTraceKey((v) => v.trim())}>
                      Analisar
                    </Button>
                  </div>
                  <div className="mt-2 text-[11px] text-white/40">
                    Dica: clique em qualquer item da lista “Efetiva” ou “Negadas” na aba RBAC para
                    abrir o Trace.
                  </div>
                </div>

                {!trace ? (
                  <div className="rounded-none border border-white/10 bg-black/20 p-6 text-sm text-white/50">
                    Informe um permissionKey para analisar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-none border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/50">Resultado</div>
                        <div className="text-[11px] text-white/40">
                          {trace.hasBreakdown ? "breakdown: ok" : "breakdown: —"}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <div className="font-mono text-sm text-white/80">{trace.key}</div>
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
                            <TriangleAlert className="h-4 w-4" /> NÃO ENCONTRADA
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        Regra: <span className="font-medium text-white/80">deny sempre vence</span>{" "}
                        mesmo que exista grant em outro nível.
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-none border border-white/10 bg-black/20 p-3">
                        <div className="text-xs font-medium text-white/70">Role (legacy)</div>
                        <div className="mt-2 text-sm text-white/70">
                          {trace.roleHas ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" /> grant
                            </span>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-none border border-white/10 bg-black/20 p-3">
                        <div className="text-xs font-medium text-white/70">Custom</div>
                        <div className="mt-2 space-y-1">
                          {trace.custom.length === 0 ? (
                            <div className="text-sm text-white/40">—</div>
                          ) : (
                            trace.custom.map((g, idx) => (
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
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {(
                        [
                          { label: "Departamentos", items: trace.departments },
                          { label: "Setores", items: trace.sectors },
                          { label: "Cargos", items: trace.positions },
                        ] as const
                      ).map((b) => (
                        <div
                          key={b.label}
                          className="rounded-none border border-white/10 bg-black/20 p-3"
                        >
                          <div className="text-xs font-medium text-white/70">{b.label}</div>
                          <div className="mt-2 space-y-1">
                            {b.items.length === 0 ? (
                              <div className="text-sm text-white/40">—</div>
                            ) : (
                              b.items.map((g, idx) => (
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
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Shield className="h-4 w-4 text-[hsl(var(--accent))]" />
                  Observações
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Actor / Org</div>
                  <div className="mt-2 space-y-1 text-[11px] text-white/70 font-mono">
                    <div>actorId: {actorId}</div>
                    <div>orgId: {orgId}</div>
                  </div>
                </div>

                <div className="rounded-none border border-white/10 bg-black/20 p-3">
                  <div className="text-xs text-white/50">Como validar</div>
                  <div className="mt-2 text-sm text-white/60">
                    Gere um evento de RBAC (grant/deny em cargo/setor/departamento). Depois confira:
                    <div className="mt-2 text-[11px] font-mono text-white/70">
                      - aba Events: Permissions.*
                      <br />- aba RBAC: lista efetiva/negadas
                      <br />- aba Trace: origem e regra deny-wins
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
