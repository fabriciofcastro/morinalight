# Morina Light

Monorepo TurboRepo iniciado conforme blueprint operacional MORINA. Estrutura base com pnpm, Husky, commitlint e lint-staged para garantir entregas incrementais com qualidade.

## Estrutura

- `apps/` — aplicações (ex.: web, admin, APIs).
- `packages/` — bibliotecas compartilháveis (design system, domínio, utils).
- `docs/` — documentação canônica (manifesto, padrões, ADRs).

## Scripts principais

- `pnpm dev` — executa `turbo run dev` em paralelo.
- `pnpm lint` — roda lint dos pacotes.
- `pnpm test` — executa suites de teste definidas.
- `pnpm typecheck` — validação de tipos.
- `pnpm prepush` — lint + typecheck + test + `commit:guard`.

## Fluxo recomendado

1. Criar branch seguindo Gitflow (`feat/...`, `fix/...`).
2. Commits semânticos respeitando `commitlint`.
3. `pnpm prepush` antes de subir alterações.
4. PR com checklist DoD e referência de eventos/RBAC.
