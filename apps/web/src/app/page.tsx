import { GlassCard } from "@morina/ui";
import Link from "next/link";

import { ProjectOverview } from "@/components/project-overview";

export default function Home() {
  const highlights = [
    {
      label: "Latência média",
      value: "98ms",
      caption: "Eventos processados com rastreabilidade completa.",
    },
    {
      label: "Playbooks automatizados",
      value: "12",
      caption: "Wizards prontos para cada operação crítica.",
    },
    {
      label: "Cobertura de auditoria",
      value: "100%",
      caption: "Toda ação registrada e assinada por IA assistente.",
    },
  ];

  const gridColumns = Array.from({ length: 12 }, (_, column) => `grid-column-${column}`);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-[var(--space-12)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(91,138,255,0.25)_0%,transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,24,33,0.8)_0%,rgba(15,17,21,0.95)_40%,rgba(15,17,21,1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(91,138,255,0.05)_0%,transparent_50%,rgba(91,138,255,0.08)_100%)] mix-blend-screen" />
        <div className="absolute inset-0 grid h-full w-full grid-cols-12 gap-[var(--space-4)] opacity-10">
          {gridColumns.map((column) => (
            <div key={column} className="border-l border-dashed border-[var(--border)]" />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-[var(--space-10)]">
        <section className="grid grid-cols-1 items-start gap-[var(--space-8)] md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="flex flex-col gap-[var(--space-5)]">
            <span className="inline-flex max-w-max items-center gap-[var(--space-2)] rounded-full border border-[color-mix(in_oklab,var(--primary)_55%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_92%,transparent)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Operações enxutas
            </span>
            <h1 className="text-balance text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] tracking-tight text-[var(--fg)] md:text-[var(--fs-3xl)]">
              Futuro operacional sem o peso do ERP monolítico.
            </h1>
            <p className="max-w-[52ch] text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in_oklab,var(--muted)_90%,var(--fg)_10%)]">
              O Morina Light acelera módulos críticos com RBAC granular, auditoria total e
              experiências assistidas por IA. Configuramos fluxos, eventos e interfaces para você
              subir em 48h.
            </p>
            <div className="flex flex-wrap items-center gap-[var(--space-4)]">
              <Link
                className="relative inline-flex items-center justify-center rounded-full px-[var(--space-6)] py-[var(--space-3)] text-[var(--fs-sm)] font-semibold text-[var(--primary-contrast)] shadow-[var(--shadow-soft)] transition hover:translate-y-[2px] hover:shadow-[var(--shadow-strong)]"
                style={{
                  background: "linear-gradient(120deg,rgba(91,138,255,0.92),rgba(91,138,255,0.72))",
                }}
                href="#blueprint"
              >
                Conferir blueprint
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--border)_80%,transparent)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--fs-sm)] font-semibold text-[var(--fg)] transition hover:border-[color-mix(in_oklab,var(--primary)_40%,transparent)] hover:text-[var(--primary)]"
                href="mailto:ops@morina.ai"
              >
                Agendar demo guiada
              </Link>
            </div>
          </div>

          <GlassCard className="min-h-[320px]" glow>
            <header className="flex items-center justify-between gap-[var(--space-3)]">
              <div>
                <p className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
                  Controle em tempo real
                </p>
                <h2 className="mt-1 text-[var(--fs-xl)] font-semibold text-[var(--fg)]">
                  Painel Polaris
                </h2>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-muted)_80%,transparent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_72%,var(--fg)_28%)]">
                Live
              </span>
            </header>
            <div className="mt-[var(--space-5)] grid gap-[var(--space-4)]">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[auto_1fr] items-start gap-[var(--space-4)]"
                >
                  <span className="text-[var(--fs-xl)] font-semibold text-[var(--primary)]">
                    {item.value}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {item.label}
                    </span>
                    <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted)_85%,var(--fg)_15%)]">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section
          id="blueprint"
          className="grid gap-[var(--space-6)] rounded-[var(--r-xl)] border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_90%,transparent)]/82 p-[var(--space-8)] backdrop-blur-xl md:grid-cols-2"
        >
          <div className="flex flex-col gap-[var(--space-3)]">
            <h3 className="text-[var(--fs-xl)] font-semibold text-[var(--fg)]">
              Baseline conectado ao manifesto
            </h3>
            <p className="text-[var(--fs-sm)] leading-[var(--lh-base)] text-[color-mix(in_oklab,var(--muted)_80%,var(--fg)_20%)]">
              Cada entrega nasce com contratos Zod, eventos versionados e RBAC explícito.
              Integrações acontecem via barramento, sem acoplamento em telas.
            </p>
          </div>
          <div className="grid gap-[var(--space-3)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
            <p>· Deploy pronto em 48h com pipelines guardadas por Husky e Turbo.</p>
            <p>· Design System com telemetria leve, states acessíveis e tokens reutilizáveis.</p>
            <p>· Playbooks assistidos por IA usando MCP para operar jornadas críticas.</p>
          </div>
        </section>

        <section className="grid gap-[var(--space-6)] rounded-[var(--r-xl)] border border-[color-mix(in_oklab,var(--primary)_25%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_92%,transparent)]/85 p-[var(--space-8)] backdrop-blur-xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="flex flex-col gap-[var(--space-3)]">
            <h3 className="text-[var(--fs-xl)] font-semibold text-[var(--fg)]">
              Login cinematográfico já pronto
            </h3>
            <p className="text-[var(--fs-sm)] leading-[var(--lh-base)] text-[color-mix(in_oklab,var(--muted)_82%,var(--fg)_18%)]">
              Trouxemos um portal com vídeo imersivo ao fundo, formulário validado com Zod e
              resposta clara para auditorias. Cada tentativa de acesso gera registro, notificando o
              time quando algo foge do padrão.
            </p>
            <p className="text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Quer ver a auditoria viva? Explore a
              <Link
                className="ml-1 text-[color-mix(in_oklab,var(--primary)_80%,var(--fg)_20%)] underline"
                href="/catalogo/auditoria"
              >
                timeline em tempo real do catálogo
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-[var(--space-2)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              <span className="rounded-full border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] px-[var(--space-3)] py-[var(--space-2)]">
                Validação MFA opcional
              </span>
              <span className="rounded-full border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] px-[var(--space-3)] py-[var(--space-2)]">
                Feedback em tempo real
              </span>
              <span className="rounded-full border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] px-[var(--space-3)] py-[var(--space-2)]">
                Pronto para logs e alertas
              </span>
            </div>
            <Link
              href="/login"
              className="w-fit rounded-full border border-[color-mix(in_oklab,var(--primary)_45%,transparent)] px-[var(--space-6)] py-[var(--space-2)] text-[var(--fs-sm)] font-semibold text-[color-mix(in_oklab,var(--primary)_85%,var(--fg)_15%)] transition hover:border-[color-mix(in_oklab,var(--primary)_70%,transparent)] hover:text-[var(--primary)]"
            >
              Abrir portal de acesso
            </Link>
          </div>

          <GlassCard className="relative overflow-hidden bg-[color-mix(in_oklab,var(--surface-muted)_90%,transparent)]/88 p-0">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--primary)_0%,transparent_60%)] opacity-60"
              aria-hidden
            />
            <div className="relative z-10 flex flex-col gap-[var(--space-3)] p-[var(--space-6)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              <header className="flex flex-col gap-1">
                <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
                  Status de entrega
                </span>
                <h4 className="text-[var(--fs-lg)] font-semibold text-[var(--fg)] leading-[var(--lh-tight)]">
                  Login preparado para demo executiva
                </h4>
              </header>
              <ul className="flex list-disc flex-col gap-2 pl-4">
                <li>Video background com fallback e camadas de segurança visual.</li>
                <li>Formulário guiado com mensagens empáticas e políticas fortes.</li>
                <li>Testes unitários, integração e E2E cobrindo fluxos críticos.</li>
              </ul>
            </div>
          </GlassCard>
        </section>
      </div>

      <div className="relative z-10 flex flex-col gap-[var(--space-8)] px-6 pb-[var(--space-12)] md:px-10">
        <ProjectOverview />
      </div>
    </main>
  );
}
