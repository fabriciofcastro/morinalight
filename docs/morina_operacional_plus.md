# MORINA Blueprint Operacional Expandido

## 1. Caso de Uso Central

O **MORINA ERP Modular** se propõe a oferecer **soluções isoladas e altamente especializadas por departamento**, sem depender de um ERP monolítico. Cada módulo funciona de forma independente, mas se comunica por eventos de domínio (DDD + Event Sourcing leve), garantindo rastreabilidade total.

### Fluxos Chave

1. **Cadastro de produto (Grade inteligente)** → Gera variantes automaticamente (cor, tamanho, aviamento) e emite eventos `Catalogo.ProdutoCriado` e `Catalogo.VarianteGerada`.
2. **Pré-ficha de produto (Aprovação em pipeline)** → Define custos, composição e responsáveis. Workflow controlado por RBAC e logs de aprovação (`Preficha.Aprovada`, `Preficha.Reprovada`).
3. **Ordem de produção e logística interna** → Coordena corte, aviamentos, oficinas, entrega e faturamento.
4. **Suporte técnico com IA e notificações centralizadas** → Atende solicitações por categoria e recomenda soluções automáticas.

## 2. Requisitos do Sistema

### Requisitos Funcionais

- Cadastro multiempresa com estrutura organizacional completa (empresa > filial > depto > cargo > usuário).
- Controle granular de permissões (RBAC e ABAC com scopes).
- Auditoria completa: todas as ações são versionadas e registradas.
- Motor de notificações e centro de alertas.
- Painel de BI com indicadores e drill-down por módulo.

### Requisitos Não Funcionais

- **Disponibilidade:** 99,5%
- **Latência alvo:** p95 < 300ms
- **Escalabilidade:** modular por microfrontend e microserviço.
- **Segurança:** JWT RS256, logs mascarados, validação Zod em todas as entradas.
- **Backup:** diário + teste de restauração semanal.

---

## 3. Arquitetura

### 3.1. Padrão Arquitetural

- **Backend:** NestJS (DDD + Hexagonal + CQRS + EventEmitter2 + Prisma + PostgreSQL)
- **Frontend:** Next.js 15 App Router (Server Actions + Client Components + Suspense)
- **Infraestrutura:** Docker, Redis Streams (eventos), Railway (backend), Vercel (frontend)
- **CI/CD:** GitHub Actions + Husky + Commitlint + TurboRepo pipelines
- **Autenticação:** JWT + Refresh Tokens + RBAC
- **Observabilidade:** Winston + Pino + métricas básicas com Prometheus

### 3.2. Fluxo de Integração

- Cada módulo emite eventos (Redis Pub/Sub ou Kafka).
- Eventos são persistidos e consumidos por outros módulos.
- O painel Admin centraliza logs e estado de cada módulo.

---

## 4. Design System (robusto além do shadcn/ui)

### 4.1. Fundamentos

- **Tokens:** Cores, tipografia, espaçamento, bordas e elevação baseadas em variáveis CSS globais.
- **Temas:** Claro, escuro e alto contraste.
- **Animações:** Framer Motion em elementos dinâmicos.

### 4.2. Componentes Enterprise

- **OrgTree:** Visualização hierárquica (empresa → departamento → cargo → usuário)
- **MatrixGrade:** Interface de produtos com grade de cores e tamanhos.
- **ApprovalBar:** Barra de status com botões condicionais a permissões.
- **TablePro:** DataGrid virtualizado com filtros, ordenação e paginação de servidor.
- **NotificationCenter:** Feed centralizado com filtros e integrações Socket.IO.
- **KPI Widgets:** Cartões dinâmicos com tendência (Δ%) e drill para listas.

---

## 5. Painel Admin e Governança

- **Dashboard 360:** KPIs, logs recentes e auditoria.
- **RBAC Matrix:** Exibe permissões por usuário e cargo.
- **Health Monitor:** Verifica status dos serviços (API, Redis, DB, Storage).
- **Configuração de Alertas:** Regras automatizadas de falha ou SLA.
- **Relatórios Dinâmicos:** PDF/CSV gerados sob demanda.

---

## 6. Configuração do Cursor e MCPs

### .cursorignore

```gitignore
node_modules/
dist/
.next/
.env*
coverage/
*.log
.cache/
.DS_Store
test-results/
```

### MCP Servers

```json
{
  "mcpServers": {
    "git": { "command": "npx", "args": ["@modelcontextprotocol/server-git"] },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"]
    },
    "postgres": {
      "command": "npx",
      "args": ["@mcp-community/postgres-server"]
    },
    "redis": { "command": "npx", "args": ["@mcp-community/redis-server"] },
    "s3": { "command": "npx", "args": ["@mcp-community/s3-server"] },
    "vectorstore": {
      "command": "npx",
      "args": ["@mcp-community/qdrant-server"]
    }
  }
}
```

### CURSOR_START.md — Regras do Contexto

1. Sempre ler `MANIFESTO.md` e `DOCS_STANDARDS.md` antes de gerar código.
2. Nunca sobrescrever o que funciona.
3. Gerar sempre diffs curtos e objetivos.
4. Referenciar contratos e DTOs em vez de expandi-los.
5. Ao finalizar task, rodar `pnpm prepush` e enviar PR.

---

## 7. Padrões e Automação (TurboRepo + Husky + Commitlint)

### Scripts principais

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "prepush": "pnpm lint && pnpm test && pnpm typecheck"
  }
}
```

### Husky

```bash
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit $1
```

### Commitlint

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "refactor", "chore", "test"]
    ]
  }
}
```

---

## 8. Manifesto Central (Resumo)

- O código é declarativo, previsível e auditável.
- Cada módulo deve poder ser desativado sem quebrar o sistema.
- Eventos são contratos públicos; mudanças exigem versionamento.
- IA deve atuar como assistente contextual (não criador autônomo).
- Documentação é o coração do projeto e deve ser sempre viva e atualizada.

---

## 9. Estratégia de IA e Eficiência no Cursor

- IA deve usar `vectorstore` para referenciar documentos canônicos (manifesto, contratos, RBAC, eventos).
- Deve sugerir snippets incrementais e não reescrever módulos.
- IA não executa tarefas repetidas: prioriza contexto do histórico e tokens mínimos.
- Cada documento de decisão técnica vira um item no `docs/decisions` com formato ADR.

---

## 10. Conclusão Estratégica

Com este blueprint expandido, o **MORINA ERP Modular** atinge maturidade operacional e autonomia de desenvolvimento assistido por IA. A estrutura garante **padronização, rastreabilidade, modularidade e automação inteligente**. O Cursor passa a ser **executor disciplinado**, com regras claras, economia de tokens e governança documental centralizada.

---

> **Próximos Passos:**
>
> 1. Gerar pacote `.zip` com todos os arquivos (.md e configs) prontos.
> 2. Indexar manifesto, padrões e contratos no vectorstore.
> 3. Iniciar documentação dos módulos departamentais com base neste manifesto.
