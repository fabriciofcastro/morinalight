import type { Metadata } from "next";

import { ClientesClient } from "./clientes-client";

export const metadata: Metadata = {
  title: "Clientes — Morina Light",
  description: "Gerencie o cadastro de clientes da sua organização.",
};

export const dynamic = "force-dynamic";

export default function ClientesPage() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-[var(--space-3)]">
        <span className="inline-flex max-w-max items-center gap-[var(--space-2)] text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Cadastro
        </span>
        <h1 className="text-[var(--fs-3xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
          Clientes
        </h1>
        <p className="max-w-[62ch] text-[var(--fs-sm)] leading-[var(--lh-relaxed)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Gerencie o cadastro avançado de clientes da sua organização. Cadastre clientes pessoa física e jurídica, vincule representantes e acompanhe comissões.
        </p>
      </header>

      <ClientesClient />
    </div>
  );
}

