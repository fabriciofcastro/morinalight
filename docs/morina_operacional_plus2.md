# Execução Rápida MORINA — Estratégia Completa (.md)

## 1. Objetivo

Acelerar a entrega funcional do **MORINA ERP Modular**, garantindo solidez arquitetural, automação CI/CD, escalabilidade e integração IA contextual. Não é sobre fazer o mínimo: é sobre construir rápido, com visão longa.

---

## 2. Fases de Execução

### **Fase 1 — Estrutura Base e Deploy Imediato**

**Meta:** rodar local e em nuvem (Railway + Vercel) com CI/CD funcional.

#### Backend

- **NestJS (DDD + CQRS + Prisma)**
- Banco: PostgreSQL (Railway)
- Cache/Eventos: Redis (Railway)
- Storage: S3 (Backblaze ou MinIO local)
- Docker Compose: PostgreSQL + Redis + MinIO + MailDev
- Env: `.env.example` padrão pronto para subir.

#### Frontend (ERP Client + Admin)

- **Next.js 15 (App Router + Server Actions)**
- DS: ShadCN + Tokens customizados (tema escuro/claro)
- Deploy Vercel → Preview por PR (workflow automático)

#### CI/CD (GitHub Actions)

```yaml
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 9 }
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - name: Deploy
        run: pnpm run deploy
```

#### Monitoramento Inicial

- **UptimeRobot** (API e Front)
- **Logtail** para logs estruturados (orgId, userId, statusCode)

---

### **Fase 2 — IA Contextual e Eficiência do Cursor**

**Meta:** IA 100% integrada ao contexto do projeto.

#### Indexação de Contexto (MCP Vectorstore)

- Documentos canônicos indexados: `MANIFESTO.md`, `DOCS_STANDARDS.md`, `contracts/*.ts`, `events/*.ts`, `rbac/*.ts`
- Embeddings ≤ 512 tokens
- Atualização automática via script `pnpm docs:index`

#### MCPs obrigatórios

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"]
    },
    "git": { "command": "npx", "args": ["@modelcontextprotocol/server-git"] },
    "postgres": {
      "command": "npx",
      "args": ["@mcp-community/postgres-server"]
    },
    "redis": { "command": "npx", "args": ["@mcp-community/redis-server"] },
    "vectorstore": {
      "command": "npx",
      "args": ["@mcp-community/qdrant-server"]
    }
  }
}
```

#### Cursor Configuration

- **.cursorignore** pronto para reduzir custo de tokens.
- **CURSOR_START.md** define prompt base e comportamento.
- **Regras:**
  - Nunca reescrever código estável.
  - Gerar diffs apenas.
  - Incluir checklist DoD e RBAC.

---

### **Fase 3 — Design System e Painel Admin**

**Meta:** criar base visual e operacional robusta.

#### Componentes

- `MatrixGrade` — grade de cores/tamanhos dinâmica.
- `OrgTree` — hierarquia organizacional com permissões inline.
- `ApprovalBar` — controle de status com RBAC condicional.
- `TablePro` — DataGrid com filtros avançados e paginação server-side.
- `NotificationCenter` — feed em tempo real (Socket.IO).

#### Tokens Globais (Tailwind + CSS Vars)

```css
:root {
  --primary: #5b8aff;
  --danger: #ef4444;
  --success: #22c55e;
  --warning: #f59e0b;
  --radius-md: 12px;
  --spacing-4: 16px;
}
```

---

### **Fase 4 — Infraestrutura e Escalabilidade**

**Meta:** preparar ambiente de produção e expansão.

#### Deploy Fase 1 (rápido)

- **Backend:** Render (API + Redis + PostgreSQL)
- **Frontend:** Vercel (ERP + Admin)
- **Storage:** Backblaze S3 compatível

#### Deploy Fase 2 (escalável)

- VPS Docker Compose (Dokku ou CapRover)
- Proxy reverso: Nginx + SSL Let's Encrypt
- Migração futura → Kubernetes (AKS ou DigitalOcean)

#### Observabilidade

- Logs: Pino + Logtail + Prometheus
- Dashboards: Grafana (latência, erros, filas Redis)

---

### **Fase 5 — Segurança e Backup**

- JWT RS256 com rotação de chave semanal.
- Rate limit + proteção de IP.
- Backup PostgreSQL diário + teste semanal.
- Snapshot do bucket S3 semanal.
- Auditoria de login, permissão e dados sensíveis.

---

### **Fase 6 — Roadmap Operacional (4 Semanas)**

| Semana | Entrega                           | Foco                  |
| ------ | --------------------------------- | --------------------- |
| 1      | Infra, CI/CD, DS base             | Estrutura de execução |
| 2      | Catálogo + Notificações           | Core operacional      |
| 3      | Pré-ficha + Auditoria + Painel IA | Valor de negócio      |
| 4      | Suporte Técnico + Deploy final    | Experiência completa  |

---

## 3. Princípios Operacionais

- Cada módulo deve rodar isoladamente.
- IA nunca reescreve, apenas amplia contexto.
- Push automático pós-task com Husky.
- Documentação viva, gerada via `docs:update`.

---

## 4. Entregáveis e Automação

- **Zip principal:** blueprint + padrões + manifesto.
- **ADR automático:** cada decisão gera arquivo `docs/decisions/YYYYMMDD_*.md`.
- **CI/CD ativo** no primeiro push.
- **Indexação MCP** ativa pós-merge.

---

## 5. Conclusão Estratégica

Este plano permite subir o MORINA em **48h com base funcional completa**, mas com estrutura para escalar, documentar e automatizar o crescimento. É o modelo de startup pragmática: **velocidade com consistência e controle**.
