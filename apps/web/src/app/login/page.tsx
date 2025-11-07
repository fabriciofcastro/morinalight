import { faker } from "@faker-js/faker";
import { GlassCard } from "@morina/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Acesso Seguro — Morina Light",
  description:
    "Portal seguro para líderes acompanharem operações modulares do Morina Light com autenticação reforçada.",
};

faker.seed(2025);

const HERO_VIDEO =
  "https://cdn.coverr.co/videos/coverr-a-really-close-up-shot-of-a-circuit-board-7780/1080p.mp4";

const loginInsights = {
  sessionCount: faker.number.int({ min: 182, max: 264 }),
  threatsBlocked: faker.number.int({ min: 9, max: 22 }),
  lastAudit: `há ${faker.number.int({ min: 3, max: 12 })} minutos`,
};

const spotlight = [
  {
    label: "Tentativas validadas nesta manhã",
    value: faker.number.int({ min: 36, max: 68 }),
    hint: "MFA inteligente em 24% dos acessos.",
  },
  {
    label: "Anomalias encaminhadas ao SOC",
    value: faker.number.int({ min: 2, max: 6 }),
    hint: "Bloqueio automático e alerta por IA.",
  },
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        poster="/window.svg"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--bg)_25%,rgba(10,12,18,0.92)_65%,rgba(10,12,18,0.98)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(91,138,255,0.18)_0%,rgba(10,12,18,0.78)_55%,rgba(10,12,18,0.94)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between gap-[var(--space-12)] px-6 py-[var(--space-12)] md:flex-row md:items-center md:px-10">
        <header className="flex w-full flex-col gap-[var(--space-6)] md:max-w-sm">
          <Link
            href="/"
            className="group inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in_oklab,var(--muted)_68%,var(--fg)_32%)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--primary)] transition group-hover:scale-110" />
            Morina Light
          </Link>
          <div className="flex flex-col gap-[var(--space-3)]">
            <h1 className="text-balance text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)]">
              Login cinematográfico com governança corporate-grade.
            </h1>
            <p className="text-balance text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in_oklab,var(--muted)_78%,var(--fg)_22%)]">
              Substituímos planilhas frágeis por uma jornada segura, auditável e encantadora. Cada
              campo tem validações fortes, alerts automáticos e copy pensada para ganhar a gerência.
            </p>
          </div>

          <GlassCard className="max-w-md bg-[color-mix(in_oklab,var(--surface-muted)_88%,transparent)]/80 p-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-3)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <Badge
                  variant="secondary"
                  className="tracking-[var(--tracking-wide)] text-[var(--fs-xs)]"
                >
                  Segurança ativa
                </Badge>
                <span className="text-[color-mix(in_oklab,var(--muted)_65%,var(--fg)_35%)]">
                  Atualizado {loginInsights.lastAudit}
                </span>
              </div>
              <ul className="grid gap-2">
                <li className="flex items-center justify-between">
                  <span>Criptografia ponta-a-ponta</span>
                  <strong className="text-[var(--fs-md)] text-[var(--fg)]">AES-256</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Logs prontos para auditoria</span>
                  <strong className="text-[var(--fs-md)] text-[var(--fg)]">
                    {loginInsights.sessionCount}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Intrusões bloqueadas hoje</span>
                  <strong className="text-[var(--fs-md)] text-[var(--fg)]">
                    {loginInsights.threatsBlocked}
                  </strong>
                </li>
              </ul>
              <div className="grid gap-2 text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted)_65%,var(--fg)_35%)]">
                {spotlight.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-[color-mix(in_oklab,var(--primary)_75%,var(--fg)_25%)] font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}
                <span>{spotlight[1].hint}</span>
              </div>
            </div>
          </GlassCard>
        </header>

        <section className="w-full max-w-xl">
          <GlassCard className="relative overflow-visible bg-[color-mix(in_oklab,var(--surface-muted)_90%,transparent)]/88 p-0 shadow-[var(--shadow-strong)]">
            <div
              className="absolute -inset-x-[60px] -top-16 h-36 bg-[radial-gradient(circle,rgba(91,138,255,0.24)_0%,transparent_72%)] blur-3xl"
              aria-hidden
            />
            <div className="relative z-10 flex flex-col gap-[var(--space-4)] p-[var(--space-6)]">
              <div className="flex flex-col gap-[var(--space-3)]">
                <Badge variant="secondary" className="w-fit">
                  Área Restrita
                </Badge>
                <h2 className="text-[var(--fs-xl)] font-semibold text-[var(--fg)] leading-[var(--lh-tight)]">
                  Entrar na central Morina
                </h2>
                <p className="text-[var(--fs-sm)] leading-[var(--lh-base)] text-[color-mix(in_oklab,var(--muted)_82%,var(--fg)_18%)]">
                  Credenciais corporativas com dupla validação acionada de forma inteligente.
                  Auditoria e alertas SOC rodam em segundo plano para você impressionar a liderança.
                </p>
              </div>
              <LoginForm insights={loginInsights} />
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
