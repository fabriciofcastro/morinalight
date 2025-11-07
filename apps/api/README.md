# @morina/api

Backend modular do MORINA com Fastify + DDD. Esta pasta abriga a aplicação HTTP principal, responsável por orquestrar os _bounded contexts_ via portas/adaptadores.

## Estrutura

- `src/core`: infraestrutura transversal (config, servidor, middlewares).
- `src/app`: camada de aplicação (rotas HTTP, casos de uso, DTOs).
- `packages/*-domain`: agregados, serviços de domínio e contratos compartilhados.
- `tests`: suíte `vitest` (unitária, integração e futuramente e2e).

## Scripts

- `pnpm --filter @morina/api dev` — servidor com recarga.
- `pnpm --filter @morina/api build` — compilação para `dist`.
- `pnpm --filter @morina/api test` — executa testes com cobertura (`c8`).
- `pnpm --filter @morina/api typecheck` — validação de tipos.

## Próximos passos

1. Modelar contextos (`catalogo`, `preficha`, `notificacoes`, `org`) dentro de `packages/` com contratos Zod alinhados ao frontend.
2. Adicionar camadas de persistência (Prisma + PostgreSQL) e mensageria (Redis Streams) como adaptadores.
3. Implementar RBAC e auditoria conforme manifesto.
4. Documentar contratos/eventos para o QWEN CLI em `/docs` seguindo `DOCS_STANDARDS.md`.
