# Sistema de Tratamento de Erros - Morina Light

## 📋 Visão Geral

O sistema de tratamento de erros do Morina Light é uma solução robusta, avançada e completa de alto nível, projetada para fornecer rastreamento, correlação, métricas e notificações de erros em toda a aplicação.

## 🏗️ Arquitetura

### Backend (API)

O sistema de erros no backend está localizado em `apps/api/src/core/errors/` e inclui:

#### 1. **Classes de Erro** (`app-error.ts`)

Hierarquia completa de classes de erro:

- **AppError** - Classe base para todos os erros
- **ValidationError** - Erros de validação (400)
- **AuthenticationError** - Erros de autenticação (401)
- **AuthorizationError** - Erros de autorização (403)
- **NotFoundError** - Recursos não encontrados (404)
- **ConflictError** - Conflitos de recursos (409)
- **BusinessLogicError** - Violações de regras de negócio (422)
- **UnprocessableEntityError** - Entidades não processáveis (422)
- **RateLimitError** - Rate limiting (429)
- **TooManyRequestsError** - Muitas requisições (429)
- **DatabaseError** - Erros de banco de dados (500)
- **ExternalServiceError** - Erros de serviços externos (502)
- **TimeoutError** - Timeouts (504)
- **CircuitBreakerError** - Circuit breaker aberto (503)
- **NetworkError** - Erros de rede (503)
- **ConfigurationError** - Erros de configuração (500)
- **InternalServerError** - Erros internos do servidor (500)
- **ServiceUnavailableError** - Serviço indisponível (503)
- **GatewayTimeoutError** - Gateway timeout (504)
- **ResourceExhaustedError** - Recursos esgotados (429)
- **NotImplementedError** - Funcionalidades não implementadas (501)
- **MaintenanceModeError** - Modo de manutenção (503)
- **PaymentRequiredError** - Pagamento necessário (402)
- **PreconditionFailedError** - Pré-condição falhou (412)
- **PayloadTooLargeError** - Payload muito grande (413)
- **UnsupportedMediaTypeError** - Tipo de mídia não suportado (415)

#### 2. **Códigos de Erro Padronizados** (`error-codes.ts`)

Sistema completo de códigos de erro padronizados com:

- Enum `ErrorCategory` - Categorias de erro
- Objeto `ErrorCodes` - Todos os códigos de erro
- `ErrorCodeCategoryMap` - Mapeamento de códigos para categorias
- Funções utilitárias:
  - `getErrorCategory()` - Obter categoria de um código
  - `isRecoverableError()` - Verificar se erro é recuperável
  - `isCriticalError()` - Verificar se erro é crítico

#### 3. **Correlação e Tracing** (`error-correlation.ts`)

Sistema avançado de correlação de erros:

- **ErrorCorrelationContext** - Contexto completo de correlação
- **ErrorSpan** - Spans para distributed tracing
- **ErrorCorrelationManager** - Gerenciador de correlação com:
  - Extração de contexto de requisições
  - Criação de spans
  - Enriquecimento de erros com contexto
  - Serialização para headers HTTP

#### 4. **Métricas** (`error-metrics.ts`)

Sistema de métricas Prometheus:

- Contador de erros por código
- Contador de erros por status HTTP
- Histograma de duração de requisições com erro
- Contador de erros críticos
- Contador de erros de serviços externos
- Contador de erros de banco de dados
- Gauge de taxa de erro

#### 5. **Notificações** (`error-notification.ts`)

Sistema de notificação de erros críticos:

- Múltiplos canais: Email, Slack, Webhook, Log
- Rate limiting de notificações
- Severidade configurável
- Formatação rica de mensagens

#### 6. **Error Handler** (`error-handler.ts`)

Handler global de erros do Fastify:

- Sanitização de erros
- Integração com correlação
- Registro de métricas
- Envio de notificações
- Logging estruturado
- Headers de correlação

### Frontend (Web)

O sistema de erros no frontend está localizado em `apps/web/src/lib/errors/` e inclui:

#### 1. **Tipos** (`types.ts`)

- **ApiErrorResponse** - Estrutura de resposta de erro da API
- **ErrorCode** - Enum de códigos de erro
- **ErrorCategory** - Enum de categorias
- **ErrorSeverity** - Enum de severidades
- **AppError** - Classe de erro customizada para frontend

#### 2. **Parser** (`parser.ts`)

Parser de erros da API:

- `parseAxiosError()` - Parsear erros do Axios
- `parseError()` - Parsear erros genéricos
- `isRetryableError()` - Verificar se erro é recuperável
- `getRetryDelay()` - Calcular delay de retry

#### 3. **Error Boundary** (`error-boundary.tsx`)

Error Boundary do React:

- Captura erros de renderização
- UI de fallback amigável
- Stack trace em desenvolvimento
- Botões de retry e reload

#### 4. **Hooks** (`hooks.ts`)

Hooks React para tratamento de erros:

- `useErrorHandler()` - Hook para tratamento de erros
- `useAsyncError()` - Hook para operações assíncronas com retry
- `useErrorTracking()` - Hook para rastreamento de erros

## 🚀 Uso

### Backend

#### Criar um erro customizado

```typescript
import { ValidationError, NotFoundError } from "@/core/errors";

// Erro de validação
throw new ValidationError("Dados inválidos", [
  { field: "email", message: "Email inválido" },
]);

// Erro de recurso não encontrado
throw new NotFoundError("User", userId);
```

#### Usar no handler de rotas

```typescript
import { asyncHandler } from "@/core/errors";

app.get("/users/:id", asyncHandler(async (request, reply) => {
  const user = await userRepository.findById(request.params.id);
  if (!user) {
    throw new NotFoundError("User", request.params.id);
  }
  return user;
}));
```

### Frontend

#### Usar Error Boundary

```typescript
import { ErrorBoundary } from "@/lib/errors";

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

#### Usar hooks de erro

```typescript
import { useErrorHandler, useAsyncError } from "@/lib/errors";

function MyComponent() {
  const { handleError } = useErrorHandler();
  
  const { execute, error, loading } = useAsyncError(
    async () => {
      const response = await api.get("/users");
      return response.data;
    },
    {
      autoRetry: true,
      maxRetries: 3,
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (error) {
    return <div>Erro: {error.getUserMessage()}</div>;
  }

  return <div>Loading...</div>;
}
```

#### Parsear erros da API

```typescript
import { parseError } from "@/lib/errors";

try {
  await api.post("/users", data);
} catch (error) {
  const appError = parseError(error);
  console.error("Erro:", appError.getUserMessage());
  console.error("Código:", appError.code);
  console.error("Correlation ID:", appError.correlationId);
}
```

## 📊 Métricas

As métricas de erro estão disponíveis no endpoint `/metrics`:

- `morina_errors_total` - Total de erros por código
- `morina_errors_by_status_total` - Total de erros por status HTTP
- `morina_error_request_duration_seconds` - Duração de requisições com erro
- `morina_critical_errors_total` - Total de erros críticos
- `morina_external_service_errors_total` - Erros de serviços externos
- `morina_database_errors_total` - Erros de banco de dados
- `morina_error_rate` - Taxa de erro por minuto

## 🔔 Notificações

As notificações de erros críticos podem ser configuradas via variáveis de ambiente:

```bash
# Email
ERROR_NOTIFICATION_EMAIL_RECIPIENTS=admin@example.com,dev@example.com

# Slack
ERROR_NOTIFICATION_SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Webhook customizado
ERROR_NOTIFICATION_WEBHOOK_URL=https://your-monitoring-service.com/webhook
```

## 🔍 Tracing e Correlação

Todos os erros incluem informações de correlação:

- **Correlation ID** - ID único para correlacionar requisições relacionadas
- **Trace ID** - ID para distributed tracing
- **Request ID** - ID único da requisição
- **Span ID** - ID do span atual

Esses IDs são incluídos nos headers HTTP:

- `X-Correlation-ID`
- `X-Trace-ID`
- `X-Span-ID`
- `X-Request-ID`

## 🎯 Boas Práticas

1. **Sempre use classes de erro específicas** em vez de `AppError` genérico
2. **Forneça contexto relevante** ao criar erros
3. **Use códigos de erro padronizados** do `ErrorCodes`
4. **Trate erros recuperáveis** com retry automático quando apropriado
5. **Monitore métricas** de erro regularmente
6. **Configure notificações** para erros críticos em produção
7. **Use Error Boundary** no nível raiz da aplicação React
8. **Parse erros da API** usando `parseError()` no frontend

## 📚 Referências

- [Documentação do Fastify - Error Handling](https://www.fastify.io/docs/latest/Reference/Errors/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)









