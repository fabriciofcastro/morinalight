# 🚀 Setup Rápido - CI/CD + Sentry + Error Boundaries

## 1. Instalar Dependências

```bash
pnpm add @tanstack/react-query react-error-boundary pino lru-cache isomorphic-dompurify

pnpm add -D @playwright/test @axe-core/playwright husky lint-staged pino-pretty @vitest/coverage-v8 @vitest/ui @sentry/cli
```

## 2. Configurar Husky (Git Hooks)

```bash
pnpm exec husky init

# Edite .husky/pre-commit
echo "pnpm lint-staged" > .husky/pre-commit

chmod +x .husky/pre-commit
```

## 3. Configurar Playwright

```bash
pnpm exec playwright install --with-deps
```

## 4. Criar Arquivos de Config

### 4.1. Sentry

Crie na raiz do projeto:

```typescript
// sentry.client.config.ts
// sentry.server.config.ts  
// sentry.edge.config.ts
```

(Copie do artifact anterior)

### 4.2. Playwright

```typescript
// playwright.config.ts
```

### 4.3. Next.js Bundle Analyzer

```javascript
// next.config.js (atualizar)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... suas configs
});
```

## 5. Criar Estrutura de Pastas

```bash
mkdir -p src/shared/ui
mkdir -p src/shared/lib
mkdir -p src/shared/config
mkdir -p e2e
mkdir -p .github/workflows
```

## 6. Copiar Arquivos do Artifact

Copie do segundo artifact:

- ✅ `src/shared/ui/error-boundary.tsx`
- ✅ `src/shared/lib/logger.ts`
- ✅ `src/shared/lib/rate-limit.ts`
- ✅ `src/shared/lib/sanitize.ts`
- ✅ `src/shared/config/env.ts`
- ✅ `src/app/global-error.tsx`
- ✅ `e2e/auth.spec.ts` (exemplo)
- ✅ `.github/workflows/ci.yml`

## 7. Atualizar Layouts Existentes

### src/app/layout.tsx

```typescript
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export default function RootLayout({ children }: Props) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### src/app/(dashboard)/layout.tsx

```typescript
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export default function DashboardLayout({ children }: Props) {
  return (
    <ErrorBoundary>
      <Sidebar />
      <main>{children}</main>
    </ErrorBoundary>
  );
}
```

## 8. Configurar Variáveis de Ambiente

```.env
# Sentry (pegue em sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=morina
SENTRY_PROJECT=web

# Logs
LOG_LEVEL=info

# ... suas outras vars
```

## 9. Testar Tudo

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Testes unitários
pnpm test

# Testes E2E
pnpm test:e2e

# Bundle analysis
pnpm analyze
```

## 10. Configurar GitHub Actions

Crie `.github/workflows/ci.yml` (copie do artifact).

**Adicione secrets no GitHub:**

1. Vá em Settings → Secrets → Actions
2. Adicione:
   - `SENTRY_AUTH_TOKEN`
   - Outras secrets necessárias

## 11. Trocar console.log por Logger

❌ **Antes:**
```typescript
console.log('User logged in', { userId: 123 });
```

✅ **Depois:**
```typescript
import { log } from '@/shared/lib/logger';

log.info('User logged in', { userId: 123 });
```

## 12. Validar Error Boundaries

Crie um botão de teste (remova depois):

```typescript
// src/app/test-error/page.tsx
'use client';

export default function TestError() {
  return (
    <button onClick={() => { throw new Error('Test Error!'); }}>
      Trigger Error
    </button>
  );
}
```

Acesse `/test-error`, clique no botão e veja o Error Boundary funcionando.

## 13. Validar Sentry

Depois de configurar o DSN:

```bash
# Build para gerar source maps
pnpm build

# Suba os source maps (se configurou SENTRY_AUTH_TOKEN)
pnpm sentry:sourcemaps
```

Acesse sentry.io → Projects → Seu projeto → Issues

Gere um erro de teste e veja aparecer lá.

## 14. Primeiro E2E Test

Crie `e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('página home carrega', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.getByRole('heading')).toBeVisible();
});
```

Rode:

```bash
pnpm test:e2e
```

## 15. Configurar CI/CD no GitHub

Após commit + push:

1. Vá em Actions no GitHub
2. Veja o workflow rodando
3. Se falhar, ajuste e commit novamente

---

## 🎯 Checklist Final

- [ ] Dependências instaladas
- [ ] Husky configurado (pre-commit hook)
- [ ] Playwright instalado
- [ ] Sentry configurado (client + server + edge)
- [ ] Error Boundaries em todos layouts
- [ ] Logger substituindo console.log
- [ ] Testes E2E básicos criados
- [ ] GitHub Actions configurado
- [ ] Secrets no GitHub configurados
- [ ] Bundle analyzer testado (`pnpm analyze`)
- [ ] Rate limiter em APIs críticas
- [ ] Sanitização de inputs implementada

---

## 📊 Rodando Análise de Bundle

```bash
ANALYZE=true pnpm build
```

Isso abrirá um gráfico interativo mostrando o tamanho de cada pacote.

**O que procurar:**
- Pacotes grandes (>100KB) que podem ser lazy loaded
- Duplicações de código
- Imports desnecessários

---

## 🔍 Debug do Playwright

```bash
# Modo UI (visual)
pnpm test:e2e:ui

# Debug mode (step-by-step)
pnpm test:e2e:debug

# Roda apenas um teste específico
pnpm test:e2e e2e/auth.spec.ts
```

---

## 🚨 Troubleshooting

### Erro: "Cannot find module 'react-error-boundary'"
```bash
pnpm install
```

### Playwright não encontra browser
```bash
pnpm exec playwright install --with-deps
```

### Husky não roda
```bash
chmod +x .husky/pre-commit
git config core.hooksPath .husky
```

### Sentry não envia erros
1. Verifique `NEXT_PUBLIC_SENTRY_DSN` no `.env`
2. Verifique se está em produção ou development (Sentry pode estar desabilitado em dev)
3. Veja no console do browser se há erros de CORS

---

## 🎓 Próximos Passos

1. **Adicionar mais testes E2E** para fluxos críticos (checkout, pagamento)
2. **Configurar Sentry Alerts** para notificações no Slack
3. **Implementar Performance Monitoring** (Web Vitals)
4. **Adicionar visual regression testing** (Percy, Chromatic)
5. **Configurar Dependabot** para updates automáticos

---

## 📚 Recursos

- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [GitHub Actions](https://docs.github.com/en/actions)