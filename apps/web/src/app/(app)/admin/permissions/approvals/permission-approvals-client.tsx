"use client";

import { Button, cn, GlassCard, Input } from "@morina/ui";
import { CheckCircle2, Clock, ExternalLink, RefreshCw, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type PermissionChangeRequest = {
  id: string;
  orgId: string;
  entityType: "position" | "sector" | "department" | "user";
  entityId: string;
  permissionId: string;
  granted: boolean | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled" | string;
  requestedBy: string;
  decidedBy: string | null;
  decidedAt: string | Date | null;
  decisionReason: string | null;
  slaDueAt?: string | Date | null;
  slaNotifiedAt?: string | Date | null;
  slaBreachedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Page = {
  itens: PermissionChangeRequest[];
  proximoCursor?: string;
};

type StatusFilter = "pending" | "approved" | "rejected" | "cancelled";

export function PermissionApprovalsClient() {
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [entityType, setEntityType] = useState<"" | PermissionChangeRequest["entityType"]>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState<Page>({ itens: [] });
  const [decisionReason, setDecisionReason] = useState<Record<string, string>>({});

  const sweep = useCallback(async () => {
    try {
      await fetch("/api/permissions/change-requests/sweep-sla", { method: "POST" });
    } catch {
      // best-effort
    }
  }, []);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", status);
    if (entityType) params.set("entityType", entityType);
    if (search.trim()) {
      // heuristic: allow filtering by permissionId or entityId quickly
      const term = search.trim();
      params.set("permissionId", term);
      params.set("entityId", term);
    }
    if (cursor) params.set("cursor", cursor);
    params.set("limite", "20");
    return params.toString();
  }, [cursor, entityType, search, status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // roda sweep antes de carregar, para manter SLA e alertas vivos
      await sweep();
      const res = await fetch(`/api/permissions/change-requests?${qs}`, { cache: "no-store" });
      if (!res.ok) {
        setPage({ itens: [] });
        return;
      }
      const data = (await res.json()) as Page;
      setPage({
        itens: Array.isArray(data?.itens) ? data.itens : [],
        proximoCursor: data?.proximoCursor,
      });
    } catch (e) {
      console.error(e);
      setPage({ itens: [] });
    } finally {
      setLoading(false);
    }
  }, [qs, sweep]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset cursor when filtros mudam (efeito intencional)
  useEffect(() => {
    setCursor(null);
  }, [status, entityType, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = useCallback(
    async (id: string, action: "approve" | "reject" | "cancel") => {
      const body = { decisionReason: decisionReason[id]?.trim() || undefined };
      const res = await fetch(`/api/permissions/change-requests/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Falha ao decidir request");
      }
      await load();
    },
    [decisionReason, load],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <div className="border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Aprovações RBAC</h1>
              <p className="mt-1 text-sm text-white/50">
                Fila de mudanças sensíveis (grant/deny) que exigem workflow.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/permissions/matrix"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 backdrop-blur-xl hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voltar à Matriz
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>

        <GlassCard className="p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs text-white/50">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-white/50">Tipo</div>
              <select
                value={entityType}
                onChange={(e) =>
                  setEntityType(e.target.value as "" | PermissionChangeRequest["entityType"])
                }
                className="mt-1 w-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none"
              >
                <option value="">todos</option>
                <option value="user">user</option>
                <option value="department">department</option>
                <option value="sector">sector</option>
                <option value="position">position</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-white/50">Busca rápida (entityId / permissionId)</div>
              <div className="mt-1 flex items-center gap-2">
                <Search className="h-4 w-4 text-white/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cole um id…"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-sm text-white/50">Carregando…</div>
            ) : page.itens.length === 0 ? (
              <div className="text-sm text-white/50">Nenhum item.</div>
            ) : (
              page.itens.map((r) => {
                const badge =
                  r.status === "pending"
                    ? "border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]"
                    : r.status === "approved"
                      ? "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
                      : r.status === "rejected"
                        ? "border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]"
                        : "border-white/15 bg-white/5 text-white/60";

                const verb = r.granted === null ? "remove" : r.granted ? "grant" : "deny";

                const dueAt = r.slaDueAt
                  ? r.slaDueAt instanceof Date
                    ? r.slaDueAt
                    : new Date(r.slaDueAt)
                  : null;
                const now = Date.now();
                const msLeft = dueAt ? dueAt.getTime() - now : null;
                const slaLabel =
                  dueAt && msLeft !== null
                    ? msLeft <= 0
                      ? `SLA estourado (${Math.abs(Math.ceil(msLeft / 60_000))} min)`
                      : `SLA em ${Math.ceil(msLeft / 60_000)} min`
                    : null;
                const slaBadge =
                  msLeft === null
                    ? null
                    : msLeft <= 0
                      ? "border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]"
                      : msLeft <= 10 * 60_000
                        ? "border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning))]"
                        : "border-white/15 bg-white/5 text-white/60";

                return (
                  <div key={r.id} className="rounded-none border border-white/10 bg-black/20 p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center border px-2 py-0.5 text-[11px] font-mono",
                              badge,
                            )}
                          >
                            {r.status}
                          </span>
                          {slaLabel && slaBadge ? (
                            <span
                              className={cn(
                                "inline-flex items-center border px-2 py-0.5 text-[11px] font-mono",
                                slaBadge,
                              )}
                            >
                              {slaLabel}
                            </span>
                          ) : null}
                          <span className="text-xs text-white/60">
                            {r.entityType}:{r.entityId}
                          </span>
                          <span className="text-xs text-white/60">•</span>
                          <span className="text-xs text-white/80">{verb}</span>
                          <span className="text-xs text-white/60">•</span>
                          <span className="text-xs font-mono text-white/75">{r.permissionId}</span>
                        </div>
                        {r.reason ? (
                          <div className="mt-1 text-xs text-white/55">Motivo: {r.reason}</div>
                        ) : null}
                        <div className="mt-1 text-[11px] text-white/45">
                          requestedBy{" "}
                          <span className="font-mono text-white/65">{r.requestedBy}</span>
                        </div>
                      </div>

                      {r.status === "pending" ? (
                        <div className="flex w-full flex-col gap-2 md:w-[360px]">
                          <Input
                            value={decisionReason[r.id] ?? ""}
                            onChange={(e) =>
                              setDecisionReason((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            placeholder="Decisão (opcional)"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={() =>
                                void decide(r.id, "approve").catch((e) =>
                                  alert(String(e?.message ?? e)),
                                )
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                void decide(r.id, "reject").catch((e) =>
                                  alert(String(e?.message ?? e)),
                                )
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeitar
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                void decide(r.id, "cancel").catch((e) =>
                                  alert(String(e?.message ?? e)),
                                )
                              }
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-white/50">
              {page.proximoCursor ? "Há mais itens" : "Fim"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={!page.proximoCursor || loading}
                onClick={() => setCursor(page.proximoCursor ?? null)}
              >
                Próxima página
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
