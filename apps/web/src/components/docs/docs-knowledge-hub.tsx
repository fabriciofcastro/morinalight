"use client";

import { GlassCard } from "@morina/ui";
import { ArrowUpRight, Layers, NotebookPen, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { docChangelog, docSections } from "@/content/docs-index";

const statusPalette: Record<string, string> = {
  atualizado:
    "border-[color-mix(in_oklab,var(--success-color) 40%,transparent)] bg-[color-mix(in_oklab,var(--success-color),transparent)]/14 text-[color-mix(in_oklab,var(--success-color)_70%,var(--fg)_30%)]",
  "em andamento":
    "border-[color-mix(in_oklab,var(--warning-color) 40%,transparent)] bg-[color-mix(in_oklab,var(--warning-color),transparent)]/14 text-[color-mix(in_oklab,var(--warning-color)_70%,var(--fg)_30%)]",
  rascunho:
    "border-[color-mix(in_oklab,var(--muted-soft) 40%,transparent)] bg-[color-mix(in_oklab,var(--muted-soft),transparent)]/14 text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]",
};

const statusLabel: Record<string, string> = {
  atualizado: "Atualizado",
  "em andamento": "Em andamento",
  rascunho: "Rascunho",
};

const heroHighlights = [
  {
    icon: Sparkles,
    title: "Camada viva",
    description: "Tokens e componentes mudam em tempo real com as entregas.",
  },
  {
    icon: Layers,
    title: "Documentos encadeados",
    description: "Blueprint, design system e uso caminham em sincronia.",
  },
  {
    icon: NotebookPen,
    title: "Copy orientada ao negócio",
    description: "Jornadas contam a história para diretoria e squads.",
  },
];

export function DocsKnowledgeHub() {
  const { totalDocs, avgProgress, updatedDocs } = useMemo(() => {
    const docs = docSections.flatMap((section) => section.docs);
    const total = docs.length;
    const progressSum = docs.reduce((sum, doc) => sum + doc.progress, 0);
    const recentlyUpdated = docs
      .filter((doc) => doc.status === "atualizado")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3);

    return {
      totalDocs: total,
      avgProgress: total > 0 ? Math.round((progressSum / total) * 100) : 0,
      updatedDocs: recentlyUpdated,
    };
  }, []);

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <GlassCard className="relative overflow-hidden bg-[color-mix(in_oklab,var(--surface-color) 96%,transparent)]/85 p-[var(--space-6)] md:p-[var(--space-8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(var(--primary) / 0.22) 0%,transparent 65%)] opacity-70" />
        <div className="pointer-events-none absolute inset-y-0 right-[-25%] hidden w-1/2 rotate-12 bg-[linear-gradient(135deg,hsla(var(--primary) / 0.35),transparent)] blur-3xl md:block" />
        <div className="relative z-10 grid gap-[var(--space-6)] md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] md:items-center">
          <div className="flex flex-col gap-[var(--space-4)]">
            <Badge variant="secondary" className="w-fit">
              Documentação Viva
            </Badge>
            <h1 className="text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
              Blueprint operacional e design system pulsando dentro do cockpit.
            </h1>
            <p className="text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in_oklab,var(--muted-soft) 68%,var(--fg) 32%)]">
              Agrupamos cada decisão relevante — do manifesto visual às integrações críticas — para
              você navegar sem precisar abrir planilhas ou apresentações externas. Tudo acontece
              aqui, com status, progresso e links para o repositório.
            </p>
            <div className="flex flex-wrap gap-[var(--space-3)]">
              <Link
                href="/catalogo/auditoria"
                className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--r-pill)] border border-[color-mix(in_oklab,var(--primary-color) 45%,transparent)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--primary-color) 85%,var(--fg) 15%)] transition hover:border-[color-mix(in_oklab,var(--primary-color) 65%,transparent)] hover:text-[var(--primary-color)]"
              >
                Ver auditoria em tempo real
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link
                href="https://github.com/fabriciofcastro/morinalight"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--r-pill)] border border-[color-mix(in_oklab,var(--border-color) 70%,transparent)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)] transition hover:border-[color-mix(in_oklab,var(--primary-color) 45%,transparent)] hover:text-[var(--primary-color)]"
              >
                Abrir repositório
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <GlassCard className="flex flex-col gap-[var(--space-4)] bg-[color-mix(in_oklab,var(--surface-color) 98%,transparent)]/92">
            <div className="grid gap-[var(--space-3)]">
              <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                Telemetria do conhecimento
              </span>
              <div className="grid gap-[var(--space-3)]">
                <div className="flex items-center justify-between gap-[var(--space-3)]">
                  <div>
                    <strong className="text-[var(--fs-2xl)] font-semibold text-[var(--fg)]">
                      {totalDocs.toString().padStart(2, "0")}
                    </strong>
                    <p className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 72%,var(--fg) 28%)]">
                      Documentos rastreados
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-[var(--space-1)]">
                    <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      Progresso médio
                    </span>
                    <div className="flex items-center gap-[var(--space-2)]">
                      <Progress value={avgProgress} className="h-[var(--space-2)] w-24" />
                      <span className="text-[var(--fs-sm)] font-semibold text-[var(--fg)]">
                        {avgProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-[var(--space-2)]">
                  {updatedDocs.map((doc) => (
                    <Link
                      key={doc.title}
                      href={doc.path}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-[var(--space-3)] rounded-[var(--r-md)] border border-[color-mix(in_oklab,var(--border-color) 80%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)] transition hover:border-[color-mix(in_oklab,var(--primary-color) 45%,transparent)] hover:text-[var(--primary-color)]"
                    >
                      <span className="font-medium text-[var(--fg)] group-hover:text-[var(--primary-color)]">
                        {doc.title}
                      </span>
                      <span>{doc.updatedAt}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="relative z-10 grid gap-[var(--space-3)] md:grid-cols-3">
          {heroHighlights.map((item) => (
            <GlassCard
              key={item.title}
              className="flex items-start gap-[var(--space-3)] bg-[color-mix(in_oklab,var(--surface-color) 98%,transparent)]/90 p-[var(--space-4)]"
            >
              <div className="flex h-[var(--space-8)] w-[var(--space-8)] items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--primary-color) 35%,transparent)] bg-[color-mix(in_oklab,var(--primary-color),transparent)]/12 text-[color-mix(in_oklab,var(--primary-color) 85%,var(--fg) 15%)]">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-[var(--space-1)]">
                <span className="text-[var(--fs-sm)] font-semibold text-[var(--fg)]">
                  {item.title}
                </span>
                <p className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 72%,var(--fg) 28%)]">
                  {item.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-[var(--space-6)]">
        {docSections.map((section) => (
          <section
            key={section.id}
            className="grid gap-[var(--space-4)] rounded-[var(--r-xl)] border border-[color-mix(in_oklab,var(--border-color) 85%,transparent)] bg-[color-mix(in_oklab,var(--surface-color) 94%,transparent)]/85 p-[var(--space-6)] backdrop-blur-xl"
          >
            <header className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-[var(--space-2)]">
                <Badge variant="secondary">{section.title}</Badge>
                <h2 className="text-[var(--fs-xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
                  {section.description}
                </h2>
              </div>
              <div className="flex flex-wrap gap-[var(--space-2)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                {section.insights.map((insight) => (
                  <span
                    key={insight}
                    className="rounded-full border border-[color-mix(in_oklab,var(--primary-color) 30%,transparent)] px-[var(--space-3)] py-[var(--space-2)]"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            </header>

            <ul className="grid gap-[var(--space-3)] md:grid-cols-3">
              {section.docs.map((doc) => (
                <li key={doc.title}>
                  <GlassCard className="flex h-full flex-col gap-[var(--space-3)] bg-[color-mix(in_oklab,var(--surface-color) 98%,transparent)]/90 p-[var(--space-4)]">
                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <span
                        className={`inline-flex items-center gap-[var(--space-2)] rounded-full border px-[var(--space-3)] py-[var(--space-1)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] ${statusPalette[doc.status]}`}
                      >
                        {statusLabel[doc.status]}
                      </span>
                      <span className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 65%,var(--fg) 35%)]">
                        {doc.updatedAt}
                      </span>
                    </div>
                    <div className="flex flex-col gap-[var(--space-2)]">
                      <h3 className="text-[var(--fs-lg)] font-semibold text-[var(--fg)] leading-[var(--lh-tight)]">
                        {doc.title}
                      </h3>
                      <p className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 72%,var(--fg) 28%)] leading-[var(--lh-relaxed)]">
                        {doc.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-[var(--space-2)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Progress
                          value={Math.round(doc.progress * 100)}
                          className="h-[var(--space-2)] flex-1"
                        />
                        <span>{Math.round(doc.progress * 100)}%</span>
                      </div>
                      <div className="flex flex-wrap gap-[var(--space-2)]">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[color-mix(in_oklab,var(--primary-color) 35%,transparent)] px-[var(--space-2)] py-[var(--space-1)] text-[color-mix(in_oklab,var(--primary-color) 80%,var(--fg) 20%)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={doc.path}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center gap-[var(--space-2)] rounded-[var(--r-md)] border border-[color-mix(in_oklab,var(--primary-color) 35%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-xs)] font-medium text-[color-mix(in_oklab,var(--primary-color) 85%,var(--fg) 15%)] transition hover:border-[color-mix(in_oklab,var(--primary-color) 70%,transparent)] hover:text-[var(--primary-color)]"
                    >
                      Abrir documento
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </GlassCard>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="grid gap-[var(--space-4)] rounded-[var(--r-xl)] border border-[color-mix(in_oklab,var(--border-color) 85%,transparent)] bg-[color-mix(in_oklab,var(--surface-color) 94%,transparent)]/85 p-[var(--space-6)] backdrop-blur-xl">
        <header className="flex flex-col gap-[var(--space-2)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-[var(--space-2)]">
            <Badge variant="secondary">Linha do tempo do conhecimento</Badge>
          </div>
          <Link
            href="https://github.com/fabriciofcastro/morinalight/commits/Main"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-[var(--space-2)] text-[var(--fs-xs)] font-medium text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)] transition hover:text-[var(--primary-color)]"
          >
            ver commits relacionados
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </header>

        <ul className="grid gap-[var(--space-3)] md:grid-cols-3">
          {docChangelog.map((entry) => (
            <li
              key={entry.title}
              className="rounded-[var(--r-md)] border border-[color-mix(in_oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in_oklab,var(--surface-color) 98%,transparent)]/92 p-[var(--space-4)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft) 70%,var(--fg) 30%)]"
            >
              <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted-soft) 65%,var(--fg) 35%)]">
                {entry.date}
              </span>
              <h3 className="mt-[var(--space-2)] text-[var(--fs-md)] font-semibold text-[var(--fg)]">
                {entry.title}
              </h3>
              <p className="mt-[var(--space-2)] text-[var(--fs-xs)] leading-[var(--lh-relaxed)]">
                {entry.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
