# Contexto - Morina

## Arquitetura
- Frontend: Next.js 16.13 + React 19.0.4
- Backend: API Routes + Server Actions
- Database: PostgreSQL + Prisma
- Real-time: Socket.io
- Auth: NextAuth.js + WebAuthn
- AI: OpenAI
- Observability: Datadog
- CI/CD: GitHub Actions
- Deploy: Vercel
- Sentry: Error Tracking
- Casl: Authorization
- Build: Vercel
- ABCA: Access Control
- RBAC: Role-Based Access Control
- ABAC: Attribute-Based Access Control
- TBAC: Time-Based Access Control
- AUBAC: Attribute-Based User Access Control
- TAILWINDCSS: Tailwind CSS
- NEXTAUTH: NextAuth
- RADIXUI: Radix UI
- TANSTACK: Query + React Table + Virtualized List
- ZOD: Schema Validation
- HUSKY: Git Hooks
- PRETTIER: Code Formatting
- ESLINT: Linting
- HOOKS FORM: Form Validation
- SHADUI: UI Components
- STORYBOOK: UI Components

## Monorepo
```
apps/web/
apps/api/
apps/observability/
apps/ai/
packages/
├── @morina/ui/
├── @morina/shared-kernel/
└── @morina/observability/
```

## Domínios
- Auth (Login, 2FA, WebAuthn)
- Organizational Structure
- Permissions (CASL)
- Real-time

## Comandos
```bash
pnpm dev
pnpm build
pnpm test
pnpm test:e2e
pnpm type-check
pnpm analyze
```