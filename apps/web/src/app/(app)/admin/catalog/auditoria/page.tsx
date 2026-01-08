import { Suspense } from "react";

import { AuditTimelineSection } from "@/components/catalogo/audit-timeline-section";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const metadata = {
  title: "Auditoria do Catálogo",
};

export default function CatalogoAuditoriaPage({ searchParams }: PageProps) {
  const produtoIdParam = searchParams?.produtoId;
  const produtoId = Array.isArray(produtoIdParam) ? produtoIdParam[0] : produtoIdParam;

  return (
    <main className="min-h-screen bg-[color-mix(in oklab,var(--surface-color) 95%,transparent)] px-6 py-12 text-[var(--fg)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Auditoria do produto</h1>
          <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
            Acompanhe os eventos críticos do produto em tempo real. Informe o identificador do
            produto para carregar os detalhes da linha do tempo.
          </p>
        </header>

        <Suspense
          fallback={
            <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
              Carregando...
            </p>
          }
        >
          <AuditTimelineSection produtoId={produtoId} />
        </Suspense>
      </div>
    </main>
  );
}
