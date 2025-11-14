"use client";

import { GlassCard } from "@morina/ui";
import { useMemo, useState } from "react";

import { AuditTimeline } from "./audit-timeline";

type Props = {
  produtoId?: string;
};

export function AuditTimelineSection({ produtoId }: Props) {
  const [inputValue, setInputValue] = useState(produtoId ?? "");
  const [activeId, setActiveId] = useState(produtoId ?? "");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [startFilter, setStartFilter] = useState<string>("");
  const [endFilter, setEndFilter] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<{
    action?: string;
    inicio?: Date;
    fim?: Date;
  }>({});

  const isValid = useMemo(() => activeId.trim().length > 0, [activeId]);

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="flex flex-col gap-3 border border-[color-mix(in oklab,var(--primary-color) 25%,transparent)]">
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed) {
              setActiveId(trimmed);
            }

            const parsedAction = actionFilter === "all" ? undefined : actionFilter;
            const inicioDate = startFilter ? new Date(`${startFilter}T00:00:00`) : undefined;
            const fimDate = endFilter ? new Date(`${endFilter}T23:59:59`) : undefined;

            setAppliedFilters({
              action: parsedAction,
              inicio: inicioDate && !Number.isNaN(inicioDate.getTime()) ? inicioDate : undefined,
              fim: fimDate && !Number.isNaN(fimDate.getTime()) ? fimDate : undefined,
            });
          }}
        >
          <label className="flex flex-col gap-2 text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] md:col-span-6">
            Produto ID
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full rounded-lg border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 96%,transparent)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] md:col-span-2">
            Ação
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="w-full rounded-lg border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 96%,transparent)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="produto_criado">Criado</option>
              <option value="produto_aprovado">Aprovado</option>
              <option value="produto_reprovado">Reprovado</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] md:col-span-2">
            Início
            <input
              type="date"
              value={startFilter}
              onChange={(event) => setStartFilter(event.target.value)}
              className="w-full rounded-lg border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 96%,transparent)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] md:col-span-2">
            Fim
            <input
              type="date"
              value={endFilter}
              onChange={(event) => setEndFilter(event.target.value)}
              className="w-full rounded-lg border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 96%,transparent)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-[color-mix(in oklab,var(--primary-color) 90%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--primary-contrast)] transition hover:bg-[color-mix(in oklab,var(--primary-color) 100%,transparent)] disabled:opacity-60 md:col-span-12 md:w-auto"
            disabled={!inputValue.trim()}
          >
            Aplicar
          </button>
        </form>
        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          O ID pode ser encontrado na resposta da API de catálogo ou no painel de produtos. Eventos
          recentes serão carregados automaticamente via socket.
        </p>
      </GlassCard>

      {isValid ? (
        <AuditTimeline
          produtoId={activeId}
          acao={appliedFilters.action}
          inicio={appliedFilters.inicio}
          fim={appliedFilters.fim}
        />
      ) : (
        <GlassCard className="text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Informe um identificador de produto para carregar a linha do tempo.
        </GlassCard>
      )}
    </div>
  );
}
