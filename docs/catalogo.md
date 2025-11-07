# Catálogo — Módulo de Produtos

## Contexto

O módulo de Catálogo mantém o cadastro de produtos corporativos, garantindo consistência de atributos, aprovação e auditoria segundo o manifesto MORINA. Ele alimenta a experiência Polaris e demais jornadas dependentes de matrizes de variantes e qualidade de dados.

## Escopo

- Inclusão de produtos com validação Zod e RBAC.
- Persistência em PostgreSQL via Prisma.
- Emissão de evento `Catalogo.ProdutoCadastrado.v1` em Redis Streams.
- Exposição HTTP para criação de produto (`POST /catalogo/produtos`).
- Fora de escopo: MatrixGrade, variantes, integrações externas.

## Modelo de domínio resumido

- `Produto`: agrega identidade (`produtoId`), estado (`status`), auditoria (`criadoPor`, `atualizadoPor`), descrição opcional e vínculo obrigatório a `orgId`.

## Regras de negócio

1. Todo produto pertence a uma organização (`orgId`).
2. Nome é único por organização.
3. Estados válidos: `rascunho`, `aguardando_aprovacao`, `ativo`, `inativo`.
4. Audit trail exige `criadoPor`/`atualizadoPor` e timestamps.
5. Apenas rascunho pode ser encaminhado para aprovação.

## Contratos (Zod)

`packages/catalogo-application/src/schemas/product.ts`

```ts
export const criarProdutoInputSchema = z.object({
  orgId: z.string().min(1),
  nome: z.string().min(3).max(180),
  descricao: z.string().max(1024).optional().nullable(),
});

export const produtoViewSchema = produtoBaseSchema.extend({
  produtoId: z.string().uuid(),
  status: z.enum(["rascunho", "aguardando_aprovacao", "ativo", "inativo"]),
  criadoPor: z.string(),
  atualizadoPor: z.string(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});
```

## Eventos

- `Catalogo.ProdutoCadastrado.v1`
  - `metadata`: `{ eventId, orgId, actorId, timestamp }`
  - `payload`: `{ produtoId, status, nome }`
- `Catalogo.ProdutoAprovado.v1`
  - `metadata`: `{ eventId, orgId, actorId, timestamp }`
  - `payload`: `{ produtoId, status }`
- `Catalogo.ProdutoReprovado.v1`
  - `metadata`: `{ eventId, orgId, actorId, timestamp }`
  - `payload`: `{ produtoId, status, motivo }`

## Fluxo HTTP (simplificado)

1. Front envia `POST /catalogo/produtos` com cabeçalhos `x-org-id` e `x-actor-id`.
2. Fastify valida cabeçalhos + body (Zod) e instancia `CriarProdutoUseCase`.
3. Use case verifica duplicidade, cria entidade, persiste via Prisma, registra auditoria e publica evento.
4. Ações de aprovação (`POST /catalogo/produtos/:produtoId/aprovar`) e reprovação (`POST /catalogo/produtos/:produtoId/reprovar`) atualizam status, disparam auditoria e eventos.
5. Auditoria consolidada disponível em `GET /catalogo/produtos/:produtoId/auditoria`.

**Query params suportados**

- `acao`: filtra ações (`produto_criado`, `produto_aprovado`, `produto_reprovado`).
- `inicio` / `fim`: janela temporal (ISO 8601).
- `limite`: até 100 registros por página (default 20).
- `cursor`: id do último log retornado para paginação progressiva.

## KPIs / SLIs

- p95 `
