import type { Metadata } from "next";

import { OrganizationalCommandCenter } from "./organizational-command-center";

export const metadata: Metadata = {
  title: "Estrutura Organizacional — Morina Light",
  description: "Gerencie a estrutura organizacional da sua organização.",
};

export const dynamic = "force-dynamic";

export default function OrganizationalStructurePage() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-(--space-3)">
        <span className="inline-flex max-w-max items-center gap-(--space-2) text-(--fs-xs) uppercase tracking-(--tracking-wide) text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          <span className="h-2 w-2 rounded-full bg-(--primary)" />
          Configurações
        </span>
        <h1 className="text-(length:--fs-3xl) font-semibold leading-(--lh-tight) text-(--fg)">
          Estrutura Organizacional
        </h1>
        <p className="max-w-[62ch] text-(length:--fs-sm) leading-(--lh-relaxed) text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
          Controle corporativo: Empresa → Departamento → Subdepartamento → Setor → Cargo. Auditoria,
          RBAC e trilhas de mudança em padrão “secure lab”.
        </p>
      </header>

      <OrganizationalCommandCenter />
    </div>
  );
}
