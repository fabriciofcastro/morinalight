# 📋 Logs Estruturados - Documentação

## Visão Geral

O sistema de logs estruturados foi implementado para centralizar e facilitar a busca de logs, integrando Pino (logger do Fastify) com Loki (agregação de logs) via Promtail.

## Arquitetura

```
API (Pino) → stdout (JSON) → Promtail → Loki → Grafana
```

### Componentes

1. **Pino**: Logger do Fastify que gera logs em formato JSON estruturado
2. **Promtail**: Coletor de logs que envia para Loki
3. **Loki**: Sistema de agregação e armazenamento de logs
4. **Grafana**: Visualização e busca de logs

## Funcionalidades Implementadas

### 1. Middleware de Logging Estruturado

**Arquivo:** `apps/api/src/core/logging/structured-logging.middleware.ts`

- Adiciona `requestId` único para cada requisição
- Inclui `userId` e `orgId` automaticamente nos logs
- Adiciona contexto de requisição (method, url, ip, userAgent)
- Loga requisições e respostas automaticamente

**Uso:**
```typescript
// O middleware é aplicado automaticamente em todas as rotas
// Os logs incluem automaticamente:
// - requestId
// - userId (se autenticado)
// - orgId (se presente no header)
// - method, url, ip, userAgent
```

### 2. Helpers de Logging

**Arquivo:** `apps/api/src/core/logging/logger.helper.ts`

Funções utilitárias para logging contextualizado:

- `getContextualLogger(request)`: Obtém logger com contexto do request
- `createChildLogger(logger, context)`: Cria logger filho com contexto adicional
- `logWithContext(logger, level, message, context)`: Log com contexto customizado
- `logError(logger, error, context)`: Log estruturado de erros
- `logBusinessOperation(logger, operation, entityType, entityId, action, context)`: Log de operações de negócio
- `logAccess(logger, resource, action, granted, reason, context)`: Log de controle de acesso

**Exemplo de uso:**
```typescript
import { getContextualLogger, logError, logBusinessOperation } from "@/core/logging";

// Em uma rota
export async function someRoute(request: FastifyRequest, reply: FastifyReply) {
  const logger = getContextualLogger(request);
  
  try {
    // Operação de negócio
    logBusinessOperation(logger, "user_management", "user", userId, "created", {
      email: user.email,
    });
    
    // Log normal com contexto
    logger.info({ customField: "value" }, "Operação realizada");
  } catch (error) {
    logError(logger, error, { operation: "someRoute" });
    throw error;
  }
}
```

### 3. Configuração do Pino

**Arquivo:** `apps/api/src/core/server/create-server.ts`

- Serializadores customizados para req, res, err
- Formato JSON em produção (para Loki)
- Formato legível em desenvolvimento (pino-pretty)

### 4. Configuração do Promtail

**Arquivo:** `devops/observability/promtail/promtail-config.yml`

- Coleta logs JSON do Pino
- Extrai campos estruturados (level, requestId, userId, orgId, etc.)
- Envia para Loki com labels apropriados
- Suporte para logs de containers Docker

## Campos Estruturados nos Logs

Todos os logs incluem automaticamente:

- `requestId`: ID único da requisição
- `userId`: ID do usuário (se autenticado)
- `orgId`: ID da organização (se presente)
- `method`: Método HTTP
- `url`: URL da requisição
- `ip`: IP do cliente
- `userAgent`: User-Agent do cliente
- `statusCode`: Código de status HTTP (em respostas)
- `duration`: Duração da requisição em ms (em respostas)
- `level`: Nível do log (trace, debug, info, warn, error, fatal)
- `time`: Timestamp do log
- `msg`: Mensagem do log

## Busca de Logs no Grafana

### Queries LogQL

**Buscar por requestId:**
```logql
{service="api"} |= "requestId=abc-123"
```

**Buscar por userId:**
```logql
{service="api"} | json | userId="user-123"
```

**Buscar por orgId:**
```logql
{service="api"} | json | orgId="org-456"
```

**Buscar erros:**
```logql
{service="api"} | json | level="error"
```

**Buscar por tipo de log:**
```logql
{service="api"} | json | type="business_operation"
```

**Buscar requisições lentas (>1s):**
```logql
{service="api"} | json | duration > 1000
```

**Buscar por método HTTP:**
```logql
{service="api"} | json | method="POST"
```

## Iniciando a Stack de Observabilidade

```bash
cd devops/observability
docker-compose -f docker-compose.observability.yml up -d
```

Serviços disponíveis:
- **Loki**: http://localhost:3100
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## Configuração do Grafana

1. Acesse http://localhost:3001
2. Login: admin / admin
3. Adicione Loki como data source:
   - URL: http://loki:3100
   - Access: Server (Default)
4. Crie dashboards ou use queries LogQL diretamente

## Boas Práticas

1. **Use contexto sempre**: Sempre use o logger do request para ter contexto automático
2. **Log operações importantes**: Use `logBusinessOperation` para operações de negócio críticas
3. **Log erros estruturados**: Use `logError` para erros, não apenas `logger.error`
4. **Adicione contexto relevante**: Inclua campos adicionais que facilitem a busca
5. **Evite logs sensíveis**: Não logue senhas, tokens, ou dados pessoais sensíveis

## Exemplos de Uso

### Log de criação de usuário
```typescript
logBusinessOperation(
  request.log,
  "user_management",
  "user",
  user.id,
  "created",
  {
    email: user.email,
    role: user.role,
  }
);
```

### Log de acesso negado
```typescript
logAccess(
  request.log,
  "users",
  "delete",
  false,
  "Insufficient permissions",
  {
    targetUserId: targetUser.id,
  }
);
```

### Log de erro com contexto
```typescript
try {
  await someOperation();
} catch (error) {
  logError(request.log, error, {
    operation: "someOperation",
    input: sanitizedInput,
  });
  throw error;
}
```

## Troubleshooting

### Logs não aparecem no Loki

1. Verifique se Promtail está rodando: `docker ps | grep promtail`
2. Verifique logs do Promtail: `docker logs morina-promtail`
3. Verifique se Loki está acessível: `curl http://localhost:3100/ready`
4. Verifique se os logs estão sendo gerados: `docker logs morina-api`

### Logs sem contexto

1. Certifique-se de que o middleware está registrado (já está por padrão)
2. Use `request.log` em vez de criar novo logger
3. Verifique se o request tem `requestId` definido

### Performance

- Logs são assíncronos e não bloqueiam requisições
- Em produção, considere usar níveis de log apropriados (info ou warn)
- Logs muito verbosos podem impactar performance do Loki


