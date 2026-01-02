# Guia de Observability

## 🔍 Visão Geral

Sistema completo de observability para monitorar performance, erros e comportamento da aplicação em produção.

---

## 📊 Web Vitals Tracking

### Core Web Vitals

Monitoramos as 3 métricas principais do Google:

- **LCP** (Largest Contentful Paint) - Tempo até maior elemento visível
- **FID** (First Input Delay) - Tempo até primeira interação
- **CLS** (Cumulative Layout Shift) - Estabilidade visual

### Outras Métricas

- **FCP** (First Contentful Paint)
- **INP** (Interaction to Next Paint)
- **TTFB** (Time to First Byte)

### Uso Básico

```typescript
// app/layout.tsx
import { initWebVitals } from "@/lib/observability";

export default function RootLayout({ children }) {
  useEffect(() => {
    initWebVitals();
  }, []);

  return <html>{children}</html>;
}
```

### Exibir Métricas (Dev Only)

```typescript
import { WebVitalsDisplay } from "@/lib/observability";

export default function App() {
  return (
    <>
      <YourApp />
      <WebVitalsDisplay /> {/* Apenas em desenvolvimento */}
    </>
  );
}
```

### Hook para Componentes

```typescript
import { useWebVitals } from "@/lib/observability";

function PerformanceMonitor() {
  const metrics = useWebVitals();

  return (
    <div>
      {metrics.map((metric) => (
        <div key={metric.id}>
          {metric.name}: {metric.value} ({metric.rating})
        </div>
      ))}
    </div>
  );
}
```

### Thresholds

| Métrica | Good | Needs Improvement | Poor |
|---------|------|-------------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

---

## 📝 Structured Logging

### Níveis de Log

```typescript
import { logger, LogLevel } from "@/lib/observability";

logger.debug("Debug message", { data: "..." });
logger.info("Info message", { userId: "123" });
logger.warn("Warning message", { issue: "..." });
logger.error("Error occurred", error, { context: "..." });
logger.fatal("Fatal error", error, { critical: true });
```

### Contexto Global

```typescript
// Definir contexto para todos os logs
logger.setContext({
  userId: "123",
  sessionId: "abc",
  organizationId: "org-1",
});

logger.info("User action"); // Inclui contexto automaticamente

// Limpar contexto
logger.clearContext();
```

### Logs Especiais

```typescript
// Performance
logger.performance("Heavy Operation", 1234, { items: 100 });

// Auditoria
logger.audit("User deleted", { userId: "123", deletedBy: "admin" });
```

### Hook para Componentes

```typescript
import { useLogger } from "@/lib/observability";

function MyComponent() {
  const logger = useLogger({ component: "MyComponent" });

  const handleClick = () => {
    logger.info("Button clicked");
  };
}
```

### HOC com Logging

```typescript
import { withLogging } from "@/lib/observability";

const MyComponent = () => <div>Hello</div>;

export default withLogging(MyComponent, "MyComponent");
// Logs automáticos de mount/unmount
```

### Formato de Log

**Desenvolvimento:**
```
ℹ️ [INFO] User logged in
  Context: { userId: "123", sessionId: "abc" }
  Metadata: { method: "email" }
```

**Produção (JSON):**
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-12-31T10:00:00.000Z",
  "context": { "userId": "123" },
  "metadata": { "method": "email" }
}
```

---

## 🚨 Sentry Integration

### Instalação

```bash
# 1. Instalar
pnpm add @sentry/nextjs

# 2. Executar wizard
npx @sentry/wizard@latest -i nextjs

# 3. Configurar .env.local
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Configuração

Os arquivos de configuração já estão prontos em `/lib/observability/sentry-config.ts`.

O wizard criará automaticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### Capturar Exceções

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  throw new Error("Something went wrong");
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "user-management" },
    extra: { userId: "123" },
    level: "error",
  });
}
```

### Capturar Mensagens

```typescript
Sentry.captureMessage("User logged in", {
  level: "info",
  tags: { action: "login" },
});
```

### Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: "auth",
  message: "User attempted login",
  level: "info",
  data: { email: "user@example.com" },
});
```

### Contexto de Usuário

```typescript
Sentry.setUser({
  id: "123",
  email: "user@example.com",
  username: "john_doe",
});

// Limpar
Sentry.setUser(null);
```

### Performance Monitoring

```typescript
const transaction = Sentry.startTransaction({
  name: "Heavy Operation",
  op: "task",
});

try {
  await heavyOperation();
} finally {
  transaction.finish();
}
```

### Configurações

```typescript
// Já configurado em sentry-config.ts
{
  tracesSampleRate: 0.1,        // 10% das transações
  replaysSessionSampleRate: 0.1, // 10% das sessões
  replaysOnErrorSampleRate: 1.0, // 100% em erros
}
```

---

## 📈 Analytics API

### Web Vitals Endpoint

```typescript
// POST /api/analytics/web-vitals
{
  "id": "v3-1234",
  "name": "LCP",
  "value": 2345,
  "rating": "good",
  "delta": 123,
  "navigationType": "navigate"
}
```

### Logs Endpoint

```typescript
// POST /api/logs
{
  "level": "error",
  "message": "API call failed",
  "timestamp": "2024-12-31T10:00:00.000Z",
  "context": { "userId": "123" },
  "error": {
    "name": "Error",
    "message": "Network error",
    "stack": "..."
  }
}
```

---

## 🎯 Best Practices

### 1. Use Níveis Apropriados

```typescript
// ✅ Bom
logger.debug("Cache hit", { key: "user:123" });
logger.info("User logged in", { userId: "123" });
logger.warn("Rate limit approaching", { remaining: 10 });
logger.error("API call failed", error);
logger.fatal("Database connection lost", error);

// ❌ Ruim
logger.info("Cache hit"); // Use debug
logger.error("User logged in"); // Use info
```

### 2. Adicione Contexto

```typescript
// ✅ Bom
logger.error("Payment failed", error, {
  userId: "123",
  amount: 99.99,
  paymentMethod: "credit_card",
});

// ❌ Ruim
logger.error("Payment failed", error);
```

### 3. Não Logue Dados Sensíveis

```typescript
// ❌ NUNCA faça isso
logger.info("User logged in", {
  password: "secret123",
  creditCard: "1234-5678-9012-3456",
});

// ✅ Bom
logger.info("User logged in", {
  userId: "123",
  method: "password",
});
```

### 4. Use Sentry para Erros Críticos

```typescript
// ✅ Bom
try {
  await criticalOperation();
} catch (error) {
  logger.error("Critical operation failed", error);
  Sentry.captureException(error, { level: "fatal" });
}
```

### 5. Monitore Performance

```typescript
// ✅ Bom
const start = performance.now();
await heavyOperation();
const duration = performance.now() - start;

logger.performance("Heavy Operation", duration, {
  items: 1000,
});

if (duration > 1000) {
  logger.warn("Slow operation detected", { duration });
}
```

---

## 📊 Dashboards

### Métricas para Monitorar

**Performance:**
- Web Vitals (LCP, FID, CLS)
- API response times
- Bundle size
- Cache hit rate

**Errors:**
- Error rate por endpoint
- Error rate por usuário
- Tipos de erros mais comuns
- Stack traces

**Usage:**
- Usuários ativos
- Páginas mais visitadas
- Features mais usadas
- Conversão de funis

### Ferramentas Recomendadas

1. **Sentry** - Error tracking e performance
2. **Vercel Analytics** - Web Vitals e usage
3. **Google Analytics** - User behavior
4. **Datadog/New Relic** - APM completo

---

## 🔧 Troubleshooting

### Logs não aparecem

```typescript
// Verificar se está em produção
console.log(process.env.NODE_ENV);

// Forçar logs em dev
logger.setContext({ forceLog: true });
```

### Sentry não captura erros

```typescript
// Verificar configuração
console.log(process.env.NEXT_PUBLIC_SENTRY_DSN);

// Testar manualmente
Sentry.captureMessage("Test");
```

### Web Vitals não são enviados

```typescript
// Verificar se initWebVitals foi chamado
useEffect(() => {
  initWebVitals();
  console.log("Web Vitals initialized");
}, []);
```

---

## 📚 Recursos

- [Web Vitals](https://web.dev/vitals/)
- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Structured Logging](https://www.loggly.com/ultimate-guide/node-logging-basics/)
