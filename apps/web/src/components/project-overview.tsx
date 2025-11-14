import { faker } from "@faker-js/faker";
import { GlassCard } from "@morina/ui";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

faker.seed(2025);

const telemetry = {
  approvalsReady: faker.number.int({ min: 18, max: 32 }),
  variantsInQA: faker.number.int({ min: 6, max: 14 }),
  releaseEta: `${faker.number.int({ min: 5, max: 12 })} dias`,
};

const milestones = [
  {
    title: "Portal de Login cinematográfico",
    status: "Entregue",
    progress: 100,
    description:
      "Vídeo imersivo, validações Zod e testes E2E garantindo narrativa de segurança para a gerência.",
    highlight: "Impacto imediato para a apresentação desta semana.",
  },
  {
    title: "Integração de auditoria e eventos",
    status: "Em andamento",
    progress: 55,
    description:
      "Time backend preparando Postgres/Redis, eventos auth.* e logs SOC. Portal já preparado para consumir.",
    highlight: "Dependência da instância responsável por infraestrutura.",
  },
  {
    title: "Cockpit Modular (catálogo + approvals)",
    status: "Planejado",
    progress: 25,
    description: "Próximo passo: matricular MatrixGrade, approval flow e visão 360° de variantes.",
    highlight: "Reforçar decisão incremental: módulo por módulo com DoD completo.",
  },
];

export function ProjectOverview() {
  return (
    <section className="grid gap-[var(--space-6)] rounded-[var(--r-xl)] border border-[color-mix(in oklab,var(--border-color) 88%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)]/88 p-[var(--space-8)] backdrop-blur-xl">
      <div className="grid gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
        <span>Telemetria atualizada com dados simulados (faker)</span>
        <div className="grid gap-[var(--space-4)] md:grid-cols-3">
          <GlassCard className="flex flex-col gap-[var(--space-2)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)]/85 p-[var(--space-4)]">
            <span>Casos de aprovação prontos</span>
            <strong className="text-2xl text-[var(--fg)]">{telemetry.approvalsReady}</strong>
            <p className="text-xs normal-case text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Fluxos de aprovação com RBAC aplicados aguardando backend.
            </p>
          </GlassCard>
          <GlassCard className="flex flex-col gap-[var(--space-2)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)]/85 p-[var(--space-4)]">
            <span>Variantes em QA</span>
            <strong className="text-2xl text-[var(--fg)]">{telemetry.variantsInQA}</strong>
            <p className="text-xs normal-case text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              MatrixGrade preparado para testes com dados gerados.
            </p>
          </GlassCard>
          <GlassCard className="flex flex-col gap-[var(--space-2)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)]/85 p-[var(--space-4)]">
            <span>ETA próxima release</span>
            <strong className="text-2xl text-[var(--primary-color)]">{telemetry.releaseEta}</strong>
            <p className="text-xs normal-case text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              Dependência: integração Postgres/Redis em andamento por outra frente.
            </p>
          </GlassCard>
        </div>
      </div>

      <header className="flex flex-col gap-[var(--space-3)]">
        <span className="inline-flex max-w-max items-center gap-[var(--space-2)] rounded-full border border-[color-mix(in oklab,var(--primary-color) 35%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 95%,transparent)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Status do Projeto
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="text-[var(--fs-xl)] font-semibold text-[var(--fg)] leading-[var(--lh-tight)]">
            Roadmap visível para o comitê
          </h3>
          <p className="text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in oklab,var(--muted-soft) 80%,var(--fg) 20%)]">
            Transparência total das entregas. Tudo reforça que eliminamos planilhas frágeis e
            estamos prontos para integrar auditoria real assim que o backend liberar.
          </p>
        </div>
      </header>

      <div className="grid gap-[var(--space-4)] md:grid-cols-3">
        {milestones.map((item) => (
          <GlassCard
            key={item.title}
            className="flex h-full flex-col gap-[var(--space-4)] bg-[color-mix(in oklab,var(--surface-color) 88%,transparent)]/85"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[var(--fs-lg)] font-semibold text-[var(--fg)] leading-[var(--lh-tight)]">
                {item.title}
              </h4>
              <Badge
                variant={
                  item.status === "Entregue"
                    ? "default"
                    : item.status === "Em andamento"
                      ? "secondary"
                      : "outline"
                }
              >
                {item.status}
              </Badge>
            </div>
            <p className="text-[var(--fs-sm)] leading-[var(--lh-base)] text-[color-mix(in oklab,var(--muted-soft) 80%,var(--fg) 20%)]">
              {item.description}
            </p>
            <div className="space-y-2">
              <Progress value={item.progress} className="h-2" />
              <p className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                {item.progress}% concluído
              </p>
            </div>
            <p className="text-[var(--fs-xs)] leading-[var(--lh-snug)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
              {item.highlight}
            </p>
          </GlassCard>
        ))}
      </div>

      <footer className="flex flex-wrap items-center gap-[var(--space-3)] text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
        <span className="rounded-full border border-[color-mix(in oklab,var(--primary-color) 35%,transparent)] px-[var(--space-4)] py-[var(--space-2)]">
          Próxima checkpoint: Demo executiva + integração eventos auth.*
        </span>
        <Link
          href="/docs"
          className="rounded-full border border-[color-mix(in oklab,var(--primary-color) 35%,transparent)] px-[var(--space-4)] py-[var(--space-2)] text-[color-mix(in oklab,var(--primary-color) 80%,var(--fg) 20%)] transition hover:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] hover:text-[var(--primary-color)]"
        >
          Documentação viva no cockpit
        </Link>
      </footer>
    </section>
  );
}
