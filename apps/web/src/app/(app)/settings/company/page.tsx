import { GlassCard } from "@morina/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { PersonalizationPanel } from "@/components/settings/PersonalizationPanel";

export const metadata: Metadata = {
  title: "Configurações de Personalização — AlphaSysCore",
  description:
    "Ajuste a identidade visual corporativa, modo padrão e vídeo institucional do AlphaSysCore by Morina.",
};

export default function CompanySettingsPage() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10 overflow-hidden rounded-[var(--r-lg)]">
      {/* Overlays futuristas */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 holo-grid opacity-20" />
        <div className="beam-line absolute left-[10%] top-0 h-full w-[1px] opacity-35" />
        <div className="beam-line absolute right-[18%] top-0 h-full w-[1px] opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(109,213,255,0.08),transparent_38%)]" />
      </div>

      <header className="flex flex-col gap-[var(--space-3)]">
        <Link
          href="/"
          className="inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          AlphaSysCore
        </Link>
        <h1 className="text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
          Configurações da Empresa
        </h1>
        <p className="max-w-[60ch] text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Defina a estética oficial da sua operação: logo, cores, tema e narrativa visual aplicada
          ao cockpit em tempo real. Tudo alinhado ao manifesto da Morina.
        </p>
      </header>

      <GlassCard
        glow
        className="bg-[color-mix(in oklab,var(--surface) 90%,transparent_10%)]/70 border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] shadow-[0_22px_90px_-32px_rgba(109,213,255,0.3)] backdrop-blur-2xl"
      >
        <div className="grid gap-[var(--space-4)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] md:grid-cols-2">
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]">
              Diretrizes
            </span>
            <p>
              Evite o termo <strong>ERP</strong> em textos e cadastros. Nome oficial:{" "}
              <strong>AlphaSysCore by Morina</strong>. Utilize terminologia de <em>Ambientes</em> e{" "}
              <em>Soluções</em>.
            </p>
          </div>
          <div className="flex flex-col gap-[var(--space-2)]">
            <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]">
              Boas práticas
            </span>
            <ul className="grid gap-[var(--space-1)]">
              <li>Prefira vídeos curtos (até 8s) em loop, sem áudio.</li>
              <li>Respeite contraste mínimo 4.5:1 para acessibilidade.</li>
              <li>Use logos em PNG/SVG com fundo transparente.</li>
              <li>Salve após aplicar para persistir em todos os operadores.</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      <PersonalizationPanel />
    </div>
  );
}
