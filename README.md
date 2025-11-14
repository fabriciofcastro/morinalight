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
- `pnpm dev:stack` — sobe a stack completa via Docker Compose (`docker compose up --build`).

### Stack Docker Compose

1. Copie `.env.example` para `.env` e ajuste segredos (`REALTIME_SECRET`, URLs públicas).
2. Garanta que as dependências locais estejam instaladas (`pnpm install` ou `make install`) para aproveitar o cache.
3. Execute `pnpm dev:stack` ou `make stack-up`. Os serviços iniciam em:
   - API: http://localhost:3333
   - Realtime Gateway: ws://localhost:3334
   - Web: http://localhost:3000
   - Postgres/Redis expostos nas portas padrão (5432/6379).
4. O código é montado via volumes; qualquer alteração local reflete nos contêineres.
5. Para inspecionar o estado dos serviços utilize `make stack-ps` ou `docker compose ps --status running`.

### Makefile utilitário

- `make setup` — instala dependências, aplica migrações Prisma e tenta rodar seeds (ignora caso não existam).
- `make prisma-migrate` — `pnpm --filter @morina/api prisma migrate deploy`.
- `make prisma-generate` — gera cliente Prisma.
- `make stack-up` / `make stack-down` — sobe/derruba a stack Docker com remoção de órfãos.
- `make stack-logs` — segue logs de todos os serviços com healthchecks ativos.

### Observabilidade rápida

- `GET /metrics` na API e no gateway realtime expõe métricas Prometheus (latência HTTP, eventos publicados, conexões WebSocket, backlog de streams).
- Ajuste `REALTIME_PENDING_ALERT_THRESHOLD` / `REALTIME_PENDING_ALERT_INTERVAL_MS` para controlar alertas por log quando houver muitas mensagens pendentes no Redis.
- Healthchecks ativos nos contêineres garantem que `docker compose` aguarde serviços críticos antes de liberar dependentes.

### Documentação & ferramentas

- **OpenAPI**: `docs/openapi/morina-openapi.yaml` modela todos os endpoints expostos (importável no Insomnia/Postman).
- **Postman Collection**: `docs/postman/morina-collection.json` com exemplos de headers (`x-org-id`, `x-actor-id`) e payloads.
- **ADRs**: `docs/decisions/` – destaque para o ADR 0002 descrevendo o feed de notificações unificado.
- **CLI de demo**: `pnpm demo:catalogo` executa o script `scripts/catalogo-demo.mjs`, criando um produto, aprovando-o e listando notificações via REST (variáveis opcionais `API_URL`, `ORG_ID`, `ACTOR_ID`).

## Fluxo recomendado

1. Criar branch seguindo Gitflow (`feat/...`, `fix/...`).
2. Commits semânticos respeitando `commitlint`.
3. `pnpm prepush` antes de subir alterações.
4. PR com checklist DoD e referência de eventos/RBAC.
