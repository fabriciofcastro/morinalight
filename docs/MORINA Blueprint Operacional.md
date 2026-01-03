Blueprint Operacional Modular\*\* como baseline e expandi com o que falta para operar em “modo empresa”: casos de uso, requisitos, arquitetura detalhada, DS robusto (além do shadcn), painel admin, padronizações de docs, configuração do Cursor (MCPs, contexto, economia de tokens), TurboRepo, Husky, commits, e regras de fluxo para o Cursor ser eficiente. O que já existe foi preservado e só ampliei/aperfeiçoei onde necessário.

Abaixo, entrego blocos prontos para copiar: **manifesto central**, **normas de documentação**, **.cursorignore**, **regras do Cursor**, **MCPs essenciais**, **boiler de commit/CI**, **Design System (tokens + padrões + componentes enterprise)**, **IA do painel admin**, **requisitos NFR/SLO**, **modelo de eventos e RBAC refinado** e **backlog operacional**.

---

# MANIFESTO.MD — Diretrizes Inegociáveis do MORINA

**Tese:** pequenas soluções de alto impacto por departamento vencem “ERPzão”. Cada módulo é um **bounded context** com autonomia, trilha de auditoria completa e eventos de domínio como trilho de integração.

**Princípios de produto**

- **Transparência by design:** tudo audível, cada ação liga em _notificações_ e _eventos_.
- **Controle real:** RBAC fino; permissão não declarada = acesso negado.
- **Velocidade sustentável:** Design System unificado, gerador de formulários tipados, tabelas _pro_ e Wizards.
- **Entrega incremental:** cada módulo deve entrar em produção sozinho.
- **Sem perfumaria:** métricas só do essencial; migra para observabilidade full quando doer.

**Princípios de engenharia**

- **DDD + Hexagonal + Eventos:** casos de uso isolados, portas/adaptadores, domínio limpo.
- **Contratos primeiro:** Zod/DTO antes de codar; _type-safety_ end-to-end.
- **CI que protege:** lint/format/test/build obrigatórios antes de merge.
- **Infra pragmática:** Docker Compose em VPS; migra PaaS quando justificar.
- **Automação do fluxo:** sempre que terminar uma task → **push** (Husky garante).

**Definição de Pronto (DoD)**

- Validação Zod em toda entrada; testes de caso de uso críticos; auditoria CREATE/UPDATE/DELETE/APPROVE/REJECT; evento emitido+consumido; UI acessível AA; Docker sobe tudo local.

---

# DOCS_STANDARDS.MD — Padrões de Documentação

**Objetivo:** instruir humanos e IAs (Cursor/Agents) com **conteúdo consumível e estável**.

**Estrutura de cada documento**

- **Contexto:** problema e motivação (3–6 linhas).
- **Escopo:** o que entra e o que não entra.
- **Modelo de domínio resumido:** entidades e relações essenciais (bullet).
- **Regras de negócio:** verdades do domínio (curtas, numeradas).
- **Contratos:** Zod/DTO com tipos chave (snippet).
- **Eventos:** nomes + payload mínimo.
- **Fluxos:** 1–3 diagramas em texto (mermaid opcional) ou bullets ordenados.
- **KPIs/SLIs:** o que mede sucesso técnico e de negócio.
- **Riscos & limites:** o que não faremos ainda (explícito).
- **Checklist DoD:** replicar os itens do manifesto + adicionais do módulo.

**Guidelines**

- Sem pastelaria; 80/20 do que move agulha.
- Evitar termos ambíguos. Dê nomes canonizados.
- Cada exemplo com input→output. Zero “etc.”.

---

# .cursorignore — Economizar Contexto (alta efetividade)

```gitignore
# Node/TS/Javascript
node_modules/
dist/
.build/
.next/
.out/
coverage/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Ambiente/secret
.env
.env.*
!.env.example

# Artefatos e binários
*.log
*.sqlite
tmp/
.cache/
.DS_Store
Thumbs.db

# Front caches
.next/
.vercel/
.storybook-static/

# Prisma & DB dumps
prisma/migrations/*/steps.json
*.dump
*.sql

# Docs pesados e exportações
docs/export/**
design/**/renders/**
assets/raw/**

# Testes e snapshots volumosos
__snapshots__/
playwright-report/
test-results/

# Conteúdo gerado
*.map
*.min.*
```

---

# CURSOR_START.MD — Regras para o Cursor (token-smart)

**Objetivo:** acelerar geração de código e docs com custo de tokens controlado.

**Comportamento obrigatório**

1. **Nunca refatorar o que já está sólido.** Só tocar ao corrigir bug, dívida explícita ou incompatibilidade com novas regras.
2. **Antes de gerar código:** ler `MANIFESTO.md` e `DOCS_STANDARDS.md`. Se o pedido conflitar, sinalizar e propor alternativa.
3. **Economia de tokens:**
   - Responder com **deltas** (só os trechos alterados) quando for ajuste.
   - Referenciar contratos/DTO por nome (não expandir se não for estritamente necessário).
   - Usar **esqueleto + TODO tags** para trechos previsíveis mas longos.

4. **Critérios de aceite em cada resposta:** indicar **DoD** atendida, _tests added?_ (sim/não), **eventos** emitidos/escutados, **permissões** requeridas.
5. **Formato de saída padrão:**
   - **“Arquivos tocados”**: caminho, resumo 1 linha, motivo.
   - **“Snippets”**: apenas o necessário, com marcadores `// [ADD]`, `// [MOD]`, `// [DEL]`.
   - **“Checklists”**: verificação final e próximos passos.

6. **Push automático:** ao fechar task, executar `pnpm prepush` (Husky impede push sem testes/commit válido).

**Prompt base (sempre prefixado nas tasks)**

```
Contexto: MORINA (ERP modular por departamentos, DDD, eventos, RBAC granular).
Regras: respeite MANIFESTO e DOCS_STANDARDS. Nunca reescreva o que funciona.
Output: deltas de código estritamente necessários + checklist DoD + eventos + RBAC.
Evite: boilerplate desnecessário, repetir contratos já definidos.
```

---

# MCPs — Servidores necessários (e por quê)

Configuração típica em `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "shell": {
      "command": "node",
      "args": ["-e", "require('child_process').spawn('bash',{stdio:'inherit'})"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"]
    },
    "git": { "command": "npx", "args": ["@modelcontextprotocol/server-git"] },
    "http": { "command": "npx", "args": ["@modelcontextprotocol/server-http"] },
    "openapi": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-openapi"]
    },
    "postgres": {
      "command": "npx",
      "args": ["@mcp-community/postgres-server"],
      "env": { "DATABASE_URL": "postgres://..." }
    },
    "redis": {
      "command": "npx",
      "args": ["@mcp-community/redis-server"],
      "env": { "REDIS_URL": "redis://localhost:6379" }
    },
    "s3": {
      "command": "npx",
      "args": ["@mcp-community/s3-server"],
      "env": { "S3_ENDPOINT": "http://...", "S3_BUCKET": "morina" }
    },
    "vectorstore": {
      "command": "npx",
      "args": ["@mcp-community/qdrant-server"],
      "env": { "QDRANT_URL": "http://localhost:6333" }
    }
  }
}
```

**Racional**

- **filesystem/git/shell:** o trio mínimo para IA operar repo com deltas controlados.
- **http/openapi:** consumir APIs internas/externas com contratos; bom para integrações.
- **postgres/redis/s3:** inspecionar dados/filas/arquivos em dev sem “chutar”.
- **vectorstore:** indexar **documentos canônicos** do projeto (manifesto, contratos, RBAC, eventos) para _retrieval_ barato e assertivo.

**Como tornar o contexto parte do Cursor**

- **Indexar**: MANIFESTO, DOCS_STANDARDS, contratos Zod, RBAC matrix e Eventos (somente fontes canônicas) no **vectorstore**.
- **Chaves de busca**: `dominio:catalogo|preficha|org`, `tipo:contrato|evento|regra`, `versao:v1`.
- **Política de atualização**: se documento canônico mudar, rodar `pnpm docs:index` para reindexar.

---

# TURBOREPO & QUALIDADE — Config padrão (pragmática)

**package.json (raiz)**

```json
{
  "name": "morina",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "prepush": "pnpm lint && pnpm typecheck && pnpm test && pnpm -w commit:guard",
    "commit:guard": "commitlint -E HUSKY_GIT_PARAMS || echo 'commitlint ok'",
    "docs:index": "node scripts/index-docs.mjs"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "turbo": "^2.0.0"
  }
}
```

**Husky + lint-staged**

```bash
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit "$1"
```

```json
// lint-staged.config.json
{
  "*.{ts,tsx,js,jsx}": [
    "pnpm biome check --write",
    "pnpm typecheck -w --if-present --noEmit"
  ],
  "*.{md,mdx}": ["pnpm prettier --write"]
}
```

```json
// commitlint.config.js
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"]
    ],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "docs",
        "test",
        "build",
        "ci",
        "chore",
        "revert"
      ]
    ],
    "scope-enum": [
      2,
      "always",
      [
        "auth",
        "org",
        "catalogo",
        "preficha",
        "notificacoes",
        "ds",
        "infra",
        "ci",
        "docs"
      ]
    ]
  }
}
```

**Fluxo “terminou a task → push”**

1. Abrir issue/tarefa curta; branch `feat/catalogo-wizard-grade`.
2. Commits pequenos e semânticos.
3. `pnpm prepush` roda **lint/typecheck/test**.
4. PR com checklist DoD e links dos eventos tocados.

---

# DESIGN SYSTEM — Robustez além do shadcn

**Meta:** manter o shadcn como base de componentes, mas operar com **sistema**: tokens, padrões, variações, estados, acessibilidade e telemetria leve.

## Tokens (CSS Custom Properties + Theme Engine)

```css
:root {
  /* Core */
  --bg: #0f1115;
  --fg: #e6e7ea;
  --muted: #a2a8b5;
  --primary: #5b8aff;
  --primary-contrast: #0b1220;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --border: #1b1f2a;
  --surface: #141821;

  /* Elevation */
  --elev-0: 0 0 0 1px var(--border);
  --elev-1: 0 2px 8px rgba(0, 0, 0, 0.25);

  /* Radius */
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
  --r-xl: 20px;

  /* Spacing (4px grid) */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --fs-xs: clamp(11px, 0.82vw, 12px);
  --fs-sm: clamp(13px, 0.92vw, 14px);
  --fs-md: clamp(15px, 1vw, 16px);
  --fs-lg: clamp(18px, 1.32vw, 20px);
  --fs-xl: clamp(24px, 1.85vw, 28px);
  --lh-tight: 1.2;
  --lh-base: 1.5;
  --lh-relaxed: 1.65;
  --tracking-wide: 0.28em;

  /* Typography (fluid) */
  --font-sans: ui-sans-serif, Inter, Roboto, system-ui;
  --fs-xs: clamp(11px, 0.85vw, 12px);
  --fs-sm: clamp(12px, 0.9vw, 14px);
  --fs-md: clamp(14px, 1vw, 16px);
  --fs-lg: clamp(16px, 1.1vw, 18px);
  --fs-xl: clamp(18px, 1.2vw, 22px);
}
```

## Padrões transversais (sempre)

- **Estados consistentes:** `:focus-visible`, `aria-busy`, `aria-invalid`.
- **Layout Shell:** Header com **Busca Global**, **Centro de Notificações**, **Switcher de Organização**, **Perfil**. Sidebar colapsável com **badges de pendências**.
- **Form Kit enterprise:** tipagem forte, máscaras, erros de domínio explicativos, **wizard** com validação etapa-a-etapa.
- **Tabela Pro:** 100k linhas com **server pagination**, **sort multi**, **filtro por coluna**, **bulk actions**, **export server**.
- **Auditoria timeline**: eventos com _diff humanizado_.
- **KPI Cards**: sempre com tendência (Δ dia/semana) e drill-to-list.

## Componentes “nível admin”

- **MatrixGrade** (produto): linhas=tamanhos, colunas=cores, célula=quantidade/código, geração de variantes automáticas.
- **OrgTree**: árvore navegável (org → deptos → cargos → usuários) com _inline actions_ e RBAC visível.
- **ApprovalBar**: status (em_edição/aguardando/aprovada/reprovada) + ações condicionadas por permissão.
- **AttachmentPanel** (S3-like): drag&drop, preview, versionamento leve.
- **NotificationCenter**: feed em tempo real com filtro por origem/tipo/lido.

---

# PAINEL ADMIN — IA de navegação e governança

**Informação Arquitetada**

- **Visão 360** (org atual): KPIs gerais, fila de aprovações, últimas auditorias, incidentes de validação.
- **Governança & RBAC**: matriz de permissões navegável; _who-can-do-what_.
- **Catálogo**: categorias/atributos/tags; qualidade de dados (completeness score).
- **Pré-Ficha**: status por etapa; gargalos; SLA de aprovação.
- **Alertas**: regras configuráveis: “produto sem composição”, “variante sem EAN”, “preficha parada > 48h”.

**IA embutida (regra prática)**

- **Prompt fixo de auditoria**: “resuma últimas 24h em linguagem de negócio; destaque riscos; liste decisões necessárias”.
- **Correções assistidas**: sugerir _bulk-fixes_ (ex: atribuir atributo obrigatório ausente) com _preview diff_.
- **Explain RBAC**: dado um usuário, explique por que ele não pode executar ação X e o que falta.

---

# REQUISITOS DE SISTEMA (NFR) & SLOs

**Segurança**

- JWT RS256, rotação de refresh tokens, bloqueio por IP após N falhas, CORS estrito, mascaramento de logs, **auditoria total**.
- Política de dados: **org_id** obrigatório em cada tabela e endpoint; _row-level checks_ em todos os casos de uso.

**Confiabilidade**

- Backups Postgres diários (retenção 7 dias) + teste de restauração semanal.
- **SLO** API: p95 < 300 ms (rota CRUD), **Erro rate** < 0,5% por serviço.
- **SLA** interna de triagem bug crítico: < 24h.

**Performance**

- Tabela Pro com paginação server e índices no Postgres para filtros padrão (org_id, status, created_at).
- Socket.IO segmentado por sala (org/depto/usuário).

**Observabilidade enxuta (fase 1)**

- Logs estruturados (reqId, userId, orgId).
- Métricas: _health/latência/erros por endpoint_, filas Redis (pendentes/processadas).
- Alerta: erro rate > 2% por 5min dispare notificação admin.

---

# MODELO DE EVENTOS & RBAC REFINADO

**Nomeclatura** `Contexto.Ação.v1` | Canal: `domain.events` | Payload mínimo **sempre**: `{ eventId, orgId, actorId, timestamp } + dom-specific`

**Eventos-chave**

- `Catalogo.ProdutoCadastrado.v1 {produtoId}`
- `Catalogo.VarianteCriada.v1 {produtoId, varianteId}`
- `Preficha.Criada.v1 {prefichaId}`
- `Preficha.Aprovada.v1 {prefichaId}`
- `Comunicacao.NotificacaoEmitida.v1 {notificacaoId}`

**RBAC (matriz objetivo-fina)**

- **Roles base**: `admin_org`, `gestor_departamental`, `editor`, `leitor`, `auditor`.
- **Scopes** por recurso: `Catalogo.Ler|Editar|Aprovar`, `Preficha.Ler|Editar|Aprovar`, `Usuarios.Convidar|GerirPerfis`, `Auditoria.Ler`.
- **Regra de ouro**: _check no backend_ com guard por permissão explícita + testes e2e de negação.

---

# BACKLOG EXECUTIVO — O que fazer agora

1. **Canonizar docs**: salvar `MANIFESTO.md` e `DOCS_STANDARDS.md` na raiz.
2. **Configurar Cursor**: `.cursorignore`, `.cursor/mcp.json`, `CURSOR_START.md`. Indexar documentos canônicos no vectorstore.
3. **Husky/Commitlint**: instalar hooks e regras acima; travar push sem testes/lint/typecheck.
4. **DS fundacional**: tokens + Shell + FormKit + Tabela Pro + NotificationCenter + ApprovalBar + OrgTree.
5. **Catálogo**: árvore de categorias, atributos, tags; **Wizard de produto com MatrixGrade**.
6. **Pré-Ficha**: formulário com Observações livres (snapshot + auditoria) e fluxo de aprovação.
7. **Notificações/Socket**: emissão, persistência, feed em tempo real.
8. **SLO guard**: métricas p95/erro-rate e alerta simples.

---

## Snippets de referência (apenas o essencial)

**Exemplo — Guard de permissão (Nest)**

```ts
// [ADD] src/infra/auth/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly rbac: RbacService,
    @Inject(PERMISSION) private readonly need: string,
  ) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const orgId = req.headers["x-org-id"];
    return this.rbac.has(user.id, orgId, this.need);
  }
}
```

**Exemplo — Emissão de evento (Worker Producer)**

```ts
// [ADD] src/domain/events.ts
export async function emit(
  domain: string,
  action: string,
  payload: Record<string, unknown>,
) {
  const evt = {
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    ...payload,
  };
  await redis.publish(
    "domain.events",
    JSON.stringify({ name: `${domain}.${action}.v1`, ...evt }),
  );
}
```

**Exemplo — Checklist DoD em PR (template)**

```md
- [ ] Zod/DTO validados
- [ ] Tests (use case) e2e-chave
- [ ] Evento emitido/consumido
- [ ] RBAC checado (negação coberta)
- [ ] UI acessível e integrada ao DS
```

---

# Conclusão (opinião direta)

- Seu blueprint está **maduro**; o que faltava eram **regras operacionais**, **padrão documental**, **governança de IA (Cursor)** e um **DS enterprise**.
- Com **.cursorignore**, **MCPs** e **CURSOR_START** acima, o Cursor deixa de ser “criativo” e vira **executor disciplinado**.
- Não perca tempo com cosmética. **MatrixGrade, OrgTree, ApprovalBar, Tabela Pro e NotificationCenter** destravam 80% do valor.
- **Push ao final de cada task** com Husky/commitlint é não-negociável. Protege você de si mesmo.

Se quiser, já preparo um **pacote `.zip`** com todos os arquivos acima organizados para colar no repositório e alimentar o Cursor.
