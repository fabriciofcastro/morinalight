"use client";

import { GlassCard } from "@morina/ui";
import { useEffect, useMemo } from "react";

import { useAuditTimeline, type AuditTimelineItem } from "@/hooks/use-audit-timeline";

type AuditTimelineProps = {
  produtoId: string;
  orgId?: string;
  acao?: string;
  inicio?: Date;
  fim?: Date;
};

export function AuditTimeline({ produtoId, orgId, acao, inicio, fim }: AuditTimelineProps) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    isRealtimeActive,
    refresh,
    realtimeHighlights,
    acknowledgeRealtime,
  } = useAuditTimeline({
    produtoId,
    orgId,
    acao,
    inicio,
    fim,
  });

  const grouped = useMemo(() => groupByDate(items), [items]);

  useEffect(() => {
    if (!realtimeHighlights) return;

    const timer = window.setTimeout(() => {
      acknowledgeRealtime();
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [acknowledgeRealtime, realtimeHighlights]);

  return (
    <GlassCard className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)]">Linha do tempo</h2>
          <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
            Auditoria consolidada do produto
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          {realtimeHighlights > 0 ? (
            <button
              type="button"
              onClick={() => acknowledgeRealtime()}
              className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in oklab,var(--primary-color) 60%,transparent)] bg-[color-mix(in oklab,var(--primary-color) 20%,transparent)] px-3 py-1 font-medium text-[color-mix(in oklab,var(--primary-color) 85%,var(--fg) 15%)] transition hover:border-[color-mix(in oklab,var(--primary-color) 80%,transparent)] hover:text-[var(--primary-color)]"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary-color)]" />
              {realtimeHighlights === 1
                ? "1 novo evento"
                : `${realtimeHighlights} novos eventos`}
            </button>
          ) : null}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
              isRealtimeActive
                ? "border-[color-mix(in oklab,var(--primary-color) 50%,transparent)] text-[color-mix(in oklab,var(--primary-color) 80%,var(--fg) 20%)]"
                : "border-[color-mix(in oklab,var(--border-color) 80%,transparent)]"
            }`}
          >
            <span
            className={`h-2 w-2 rounded-full ${
              isRealtimeActive
                ? "bg-[var(--primary-color)]"
                : "bg-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]"
            }`}
            />
            {isRealtimeActive ? "Socket ativo" : "Aguardando socket"}
          </span>
          <button
            type="button"
            className="rounded-full border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] px-3 py-1 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] transition hover:text-[var(--fg)]"
            onClick={() => refresh()}
            disabled={loading}
          >
            Atualizar
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in oklab,var(--danger-color) 30%,transparent)] bg-[color-mix(in oklab,var(--danger-color) 10%,transparent)] px-4 py-3 text-sm text-[color-mix(in oklab,var(--danger-color) 80%,var(--fg) 20%)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6">
        {grouped.length === 0 && !loading ? (
          <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
            Sem eventos registrados ainda.
          </p>
        ) : null}

        {grouped.map(({ date, entries }) => (
          <div key={date} className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              {date}
            </h3>
            <ul className="space-y-3">
              {entries.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-lg border px-4 py-3 transition-all ${
                    item.isRealtime
                      ? "border-[color-mix(in oklab,var(--primary-color) 60%,transparent)] bg-[color-mix(in oklab,var(--primary-color) 15%,var(--surface-color) 85%)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--primary-color)_35%,transparent)]"
                      : "border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)]"
                  }`}
                >
                  <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    <span className="font-semibold text-[color-mix(in oklab,var(--fg) 85%,var(--muted-soft) 15%)]">
                      {mapAction(item.acao)}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isRealtime ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in oklab,var(--primary-color) 20%,transparent)] px-2 py-0.5 text-[color-mix(in oklab,var(--primary-color) 85%,var(--fg) 15%)]">
                          Ao vivo
                        </span>
                      ) : null}
                      <span>
                        {new Intl.DateTimeFormat("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).format(new Date(item.criadoEm))}
                      </span>
                    </div>
                  </header>
                  <p className="mt-2 text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
                    executado por <span className="font-medium">{item.actorId}</span>
                  </p>
                  {item.payload ? (
                    <pre className="mt-2 overflow-x-auto rounded bg-[color-mix(in oklab,var(--surface-color) 94%,transparent)] px-3 py-2 text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="flex items-center justify-between gap-3 text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
        <span>
          {loading ? "Carregando..." : `${items.length} eventos`}
          {isRealtimeActive ? " · sincronização automática" : ""}
        </span>
        {hasMore ? (
          <button
            type="button"
            className="rounded-full border border-[color-mix(in oklab,var(--primary-color) 45%,transparent)] px-3 py-1 text-[color-mix(in oklab,var(--primary-color) 85%,var(--fg) 15%)] transition hover:border-[color-mix(in oklab,var(--primary-color) 70%,transparent)] hover:text-[var(--primary-color)]"
            onClick={() => loadMore()}
            disabled={loading}
          >
            Carregar mais
          </button>
        ) : null}
      </footer>
    </GlassCard>
  );
}

export function groupByDate(items: AuditTimelineItem[]) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const map = new Map<string, AuditTimelineItem[]>();
  items.forEach((item) => {
    const date = formatter.format(new Date(item.criadoEm));
    const entry = map.get(date) ?? [];
    entry.push(item);
    map.set(date, entry);
  });

  return Array.from(map.entries()).map(([date, entries]) => ({
    date,
    entries: [...entries].sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    ),
  }));
}

function mapAction(action: string) {
  switch (action) {
    case "produto_criado":
      return "Produto criado";
    case "produto_aprovado":
      return "Produto aprovado";
    case "produto_reprovado":
      return "Produto reprovado";
    default:
      return action;
  }
}
