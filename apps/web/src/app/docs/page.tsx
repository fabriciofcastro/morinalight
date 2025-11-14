import type { Metadata } from "next";

import { DocsKnowledgeHub } from "@/components/docs/docs-knowledge-hub";

export const metadata: Metadata = {
  title: "Documentação Viva · Morina Light",
  description:
    "Hub interativo com blueprints, design system e guias operacionais do Morina Light.",
};

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-[var(--space-6)] px-6 py-[var(--space-10)] md:px-10">
      <DocsKnowledgeHub />
    </main>
  );
}

