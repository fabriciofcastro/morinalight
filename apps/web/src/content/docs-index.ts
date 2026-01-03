export type DocStatus = "atualizado" | "em andamento" | "rascunho";

export type DocLink = {
  title: string;
  description: string;
  path: string;
  status: DocStatus;
  progress: number;
  tags: string[];
  updatedAt: string;
};

export type DocSection = {
  id: string;
  title: string;
  description: string;
  insights: string[];
  docs: DocLink[];
};

const REPO_BASE_URL =
  process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/fabriciofcastro/morinalight";

const withRepoLink = (path: string) => `${REPO_BASE_URL}/blob/Main/${path}`;

export const docSections: DocSection[] = [
  {
    id: "design-system",
    title: "Design System · Clean Vibrant",
    description:
      "Tokens, componentes e decisões de UX que sustentam a experiência futurista do Morina Light.",
    insights: [
      "Tokens revisados com suporte a temas claro/escuro e densidades (web x erp).",
      "Componentes reativos com telemetria visual e feedbacks cinematográficos.",
      "Blueprint conectado ao manifesto operacional com foco em escalabilidade.",
    ],
    docs: [
      {
        title: "Design Manifesto",
        description: "Princípios visuais, grids e diretrizes para escalabilidade de tela.",
        path: withRepoLink("docs/design.md"),
        status: "atualizado",
        progress: 0.95,
        tags: ["Guidelines", "Escalabilidade"],
        updatedAt: "2025-03-01",
      },
      {
        title: "Clean Vibrant Theme",
        description: "Tokens dark/light, densidades e animações translúcidas.",
        path: withRepoLink("docs/clean_vibrant_dark_design_system.md"),
        status: "atualizado",
        progress: 1,
        tags: ["Tokens", "Tailwind v4"],
        updatedAt: "2025-03-03",
      },
      {
        title: "Documentação viva no produto",
        description: "Planos para evoluir a documentação dentro do próprio cockpit.",
        path: withRepoLink("docs/usage/personalization.md"),
        status: "em andamento",
        progress: 0.6,
        tags: ["UX Writing", "In-App Docs"],
        updatedAt: "2025-02-21",
      },
    ],
  },
  {
    id: "operacoes",
    title: "Blueprint Operacional",
    description:
      "Fluxos críticos, integrações e decisões que garantem auditoria e governança ponta a ponta.",
    insights: [
      "Playbooks assistidos por IA descrevem jornadas críticas com checkpoint claros.",
      "Auditoria com timeline viva conectada à personalização de tema.",
      "Integrações prontas para eventos versionados e RBAC explícito.",
    ],
    docs: [
      {
        title: "MORINA Blueprint Operacional",
        description: "Visão macro de módulos, integrações e SLAs da plataforma.",
        path: withRepoLink("docs/MORINA Blueprint Operacional.md"),
        status: "atualizado",
        progress: 0.9,
        tags: ["Blueprint", "Governança"],
        updatedAt: "2025-02-10",
      },
      {
        title: "Notificações Realtime",
        description: "Modelo de eventos, streams e métricas do hub realtime.",
        path: withRepoLink("docs/notificacoes-realtime.md"),
        status: "em andamento",
        progress: 0.7,
        tags: ["Realtime", "Redis Stream"],
        updatedAt: "2025-02-18",
      },
      {
        title: "Decisão · Portal de Login",
        description: "ADR com diretrizes de segurança, MFA opcional e storytelling.",
        path: withRepoLink("docs/decisions/0001-auth-portal.md"),
        status: "atualizado",
        progress: 1,
        tags: ["ADR", "Segurança"],
        updatedAt: "2025-01-29",
      },
    ],
  },
  {
    id: "uso",
    title: "Guias de Uso e Personalização",
    description:
      "Manual rápido para times ativarem o cockpit, personalizarem tema e navegarem pelos módulos.",
    insights: [
      "Personalização da identidade funciona 100% em tempo real com persistência fallback.",
      "Guias de login exibem validações, feedbacks e uso de dados sintéticos (Faker).",
      "Roadmap apresenta próximos módulos e integrações planejadas.",
    ],
    docs: [
      {
        title: "Guia do Portal de Login",
        description: "Copywriting, validações Zod e métricas do formulário cinematográfico.",
        path: withRepoLink("docs/usage/login.md"),
        status: "atualizado",
        progress: 0.85,
        tags: ["UX", "Validações"],
        updatedAt: "2025-02-26",
      },
      {
        title: "Project Overview · Catalogo",
        description: "Resumo das entregas com telemetria de progresso e fake data.",
        path: withRepoLink("docs/usage/project-overview.md"),
        status: "em andamento",
        progress: 0.65,
        tags: ["Catálogo", "Fake Data"],
        updatedAt: "2025-02-14",
      },
      {
        title: "Personalização de Tema (AlphaSysCore)",
        description: "Campos suportados, persistência e integração com empresas.",
        path: withRepoLink("docs/usage/personalization.md"),
        status: "em andamento",
        progress: 0.6,
        tags: ["Tema", "Persistência"],
        updatedAt: "2025-02-21",
      },
    ],
  },
];

export const docChangelog = [
  {
    title: "Tema Clean Vibrant publicado",
    description: "Tokens dark/light alinhados ao manifesto operacional e UX futurista.",
    date: "2025-03-03",
  },
  {
    title: "Painel de documentação viva",
    description: "Blueprint de navegação e agrupamento de conteúdos implementado no cockpit.",
    date: "2025-03-02",
  },
  {
    title: "Portal de login revisado",
    description: "Formulário cinematográfico com dados sintéticos e copywriting empático.",
    date: "2025-02-26",
  },
];
