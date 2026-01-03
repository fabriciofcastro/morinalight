# CLI Demo — Catálogo

Script: `scripts/catalogo-demo.mjs`  
Atalho: `pnpm demo:catalogo`

## Pré-requisitos

- API rodando localmente (`pnpm dev:stack` ou `make stack-up`).
- Node 22+ (incluído na stack PNPM configurada).

## Variáveis

| Variável   | Default                 | Descrição                                   |
| ---------- | ----------------------- | ------------------------------------------- |
| `API_URL`  | `http://localhost:3333` | Base da API.                                |
| `ORG_ID`   | `demo-org`              | Organização usada nos headers.              |
| `ACTOR_ID` | `cli-actor`             | Identificador do usuário que executa ações. |

## Fluxo automatizado

1. Cria um produto rascunho (`POST /catalogo/produtos`).
2. Aprova o produto (`POST /catalogo/produtos/{id}/aprovar`).
3. Lista produtos ativos (`GET /catalogo/produtos?status=ativo`).
4. Consulta feeds REST (`GET /notifications/feed`) e imprime as três notificações mais recentes.

O script falha com mensagem detalhada caso algum passo retorne HTTP diferente de 2xx.
