import type { Metadata } from "next";

import { OrganizationsClient } from "./organizations-client";

export const metadata: Metadata = {
  title: "Organizações — Morina Light",
  description: "Gerencie as organizações e sua estrutura.",
};

export const dynamic = "force-dynamic";

export default function OrganizationsPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-[var(--space-6)] px-6 py-[var(--space-10)] md:px-10">
      <header className="flex flex-col gap-[var(--space-3)]">
        <span className="inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Estrutura
        </span>
        <h1 className="text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
          Organizações
        </h1>
        <p className="max-w-[62ch] text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Gerencie as organizações, membros e permissões. Visualize a estrutura hierárquica e configure acessos.
        </p>
      </header>

      <OrganizationsClient />
    </main>
  );
}

