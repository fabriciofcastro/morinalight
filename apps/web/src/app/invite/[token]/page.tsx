import { GlassCard } from "@morina/ui/server";
import type { Metadata } from "next";
import Link from "next/link";

import { AcceptInviteForm } from "@/components/accept-invite-form";

export const metadata: Metadata = {
  title: "Aceitar convite — Morina Light",
  description:
    "Finalize o onboarding corporativo definido pelo Morina Light, com segurança e rastreabilidade.",
};

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token: inviteToken } = await params;


  return (
    <main className="relative flex min-h-screen flex-col justify-center bg-[var(--bg)] py-[var(--space-10)] text-[var(--fg)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,138,255,0.22)_0%,rgba(12,14,18,0.92)_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(36,54,102,0.45)_10%,rgba(11,14,20,0.85)_60%,rgba(11,14,20,0.96)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-[var(--space-8)] px-6 md:px-10">
        <header className="flex flex-col gap-[var(--space-3)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          <Link
            href="/"
            className="inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
            Morina Light · Convite corporativo
          </Link>
          <h1 className="text-[clamp(2.1rem,3vw,2.6rem)] font-semibold leading-[1.15] text-[var(--fg)]">
            Ative seu acesso à operação Morina
          </h1>
          <p>
            Você foi selecionado para atuar na central AlphaSysCore. Confirme seus dados, defina uma
            senha forte e em segundos estaremos liberando o cockpit com auditoria ativa.
          </p>
        </header>

        <GlassCard className="relative overflow-hidden bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)]/88 p-[var(--space-6)] shadow-[var(--shadow-strong)]">
          <div
            className="pointer-events-none absolute -inset-x-[80px] -top-24 h-48 bg-[radial-gradient(circle,rgba(91,138,255,0.24)_0%,transparent_72%)] blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col gap-[var(--space-6)]">
            <div className="flex flex-col gap-[var(--space-2)] text-[var(--fs-sm)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
              <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)]">
                Segurança reforçada
              </span>
              <h2 className="text-[var(--fs-xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
                Confirme o e-mail convidado e personalize sua jornada
              </h2>
              <p>
                Se tiver alguma dúvida, procure quem enviou o convite. Cada aceite gera registro no
                livro-razão e ativa monitoração do SOC corporativo.
              </p>
            </div>

            <AcceptInviteForm inviteToken={inviteToken} />
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
