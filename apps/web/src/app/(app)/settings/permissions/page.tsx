import type { Metadata } from "next";
import { PermissionsClient } from "./permissions-client";

export const metadata: Metadata = {
  title: "Permissões — Morina Light",
  description: "Gerencie permissões e níveis de acesso dos usuários.",
};

export const dynamic = "force-dynamic";

export default function PermissionsPage() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-3">
        <span className="inline-flex max-w-max items-center gap-2 text-xs uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          Configurações
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-[var(--fg)]">
          Permissões de Usuário
        </h1>
        <p className="max-w-[62ch] text-sm leading-relaxed text-[color-mix(in_oklab,var(--muted)_75%,var(--fg)_25%)]">
          Gerencie níveis de acesso e permissões dos usuários do sistema. Configure permissões granulares por módulo e funcionalidade.
        </p>
      </header>

      <PermissionsClient />
    </div>
  );
}

