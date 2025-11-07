"use client";

import { GlassCard } from "@morina/ui";
import { useMemo } from "react";

import { useAuditTimeline } from "@/hooks/use-audit-timeline";

type AuditTimelineProps = {
  produtoId: string;
  orgId?: string;
  acao?: string;
  inicio?: Date;
  fim?: Date;
};

export function AuditTimeline({ produtoId, orgId, acao, inicio, fim }: AuditTimelineProps) {
  const { items, loading, error, hasMore, loadMore, isRealtimeActive, refresh } = useAuditTimeline({
    produtoId,
    orgId,
    acao,
    inicio,
    fim,
  });

  const grouped = useMemo(() => groupByDate(items), [items]);

  return (
    <GlassCard className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)]">Linha do tempo</h2>
          <p className="text-sm text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
            Auditoria consolidada do produto
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
              isRealtimeActive
                ? "border-[color-mix(in_oklab,var(--primary)_50%,transparent)] text-[color-mix(in_oklab,var(--primary)_80%,var(--fg)_20%)]"
                : "border-[color-mix(in_oklab,var(--border)_80%,transparent)]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isRealtimeActive ? "bg-[var(--primary)]" : "bg-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]"}`}
            />
            {isRealtimeActive ? "Socket ativo" : "Aguardando socket"}
          </span>
          <button
            type="button"
            className="rounded-full border border-[color-mix(in_oklab,var(--border)_80%,transparent)] px-3 py-1 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] transition hover:text-[var(--fg)]"
            onClick={() => refresh()}
            disabled={loading}
          >
            Atualizar
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--danger)_80%,var(--fg)_20%)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6">
        {grouped.length === 0 && !loading ? (
          <p className="text-sm text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
            Sem eventos registrados ainda.
          </p>
        ) : null}

        {grouped.map(({ date, entries }) => (
          <div key={date} className="flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              {date}
            </h3>
            <ul className="space-y-3">
              {entries.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_90%,transparent)] px-4 py-3"
                >
                  <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    <span className="font-semibold text-[color-mix(in_oklab,var(--fg)_85%,var(--muted)_15%)]">
                      {mapAction(item.acao)}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(new Date(item.criadoEm))}
                    </span>
                  </header>
                  <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
                    executado por <span className="font-medium">{item.actorId}</span>
                  </p>
                  {item.payload ? (
                    <pre className="mt-2 overflow-x-auto rounded bg-[color-mix(in_oklab,var(--surface-muted)_94%,transparent)] px-3 py-2 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="flex items-center justify-between gap-3 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
        <span>
          {loading ? "Carregando..." : `${items.length} eventos`}
          {isRealtimeActive ? " · sincronização automática" : ""}
        </span>
        {hasMore ? (
          <button
            type="button"
            className="rounded-full border border-[color-mix(in_oklab,var(--primary)_45%,transparent)] px-3 py-1 text-[color-mix(in_oklab,var(--primary)_85%,var(--fg)_15%)] transition hover:border-[color-mix(in_oklab,var(--primary)_70%,transparent)] hover:text-[var(--primary)]"
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

  return Array.from(map.entries()).map(([date, entries]) => ({ date, entries }));
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
