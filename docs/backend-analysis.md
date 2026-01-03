# Análise do Backend - Estado Atual e Próximos Passos

## 📊 Estado Atual do Backend

### ✅ O que já está implementado

#### 1. **Estrutura Base**

- ✅ Fastify como framework HTTP
- ✅ Prisma + PostgreSQL para persistência
- ✅ Redis para eventos (Streams)
- ✅ Arquitetura DDD com bounded contexts
- ✅ Repositórios com implementações Prisma e InMemory
- ✅ Docker Compose com PostgreSQL, Redis, API e Realtime
- ✅ Métricas com Prometheus (prom-client)
- ✅ Logs estruturados com Pino
- ✅ CORS e Helmet configurados
- ✅ Validação Zod em todas as rotas

#### 2. **Autenticação e Autorização**

- ✅ Login com JWT (HS256)
- ✅ Registro de usuários
- ✅ Hash de senha com bcrypt
- ✅ Auditoria de tentativas de login
- ✅ Gerenciamento de sessão (lastLoginAt)
- ⚠️ **FALTA**: Middleware de autenticação (verificação JWT nas rotas)
- ⚠️ **FALTA**: Guards/decorators para RBAC
- ⚠️ **FALTA**: Refresh tokens
- ⚠️ **FALTA**: Rate limiting
- ⚠️ **FALTA**: OAuth2/Social login

#### 3. **Organizações (Multi-tenant)**

- ✅ CRUD de organizações
- ✅ Membros (OrganizationMembership)
- ✅ Roles: owner, admin, manager, member, viewer
- ✅ Convites (UserInvite) com token e expiração
- ✅ Listagem de membros
- ✅ Atualização de papel (role)
- ✅ Remoção de membros
- ✅ Auditoria de ações organizacionais
- ⚠️ **FALTA**: Validação de acesso baseada em role nas rotas
- ⚠️ **FALTA**: Isolamento de dados multi-tenant (filtro automático por orgId)
- ⚠️ **FALTA**: Limites por organização (quota)

#### 4. **Catálogo (Produtos)**

- ✅ CRUD de produtos
- ✅ Status: rascunho, aguardando_aprovacao, ativo, inativo
- ✅ Aprovação/Rejeição de produtos
- ✅ Auditoria de produtos (ProductAuditLog)
- ✅ Feed de auditoria
- ✅ Eventos de domínio (Redis Streams)
- ⚠️ **FALTA**: SKU e variações (tamanho, cor)
- ⚠️ **FALTA**: Categorias hierárquicas
- ⚠️ **FALTA**: Ficha técnica e anexos
- ⚠️ **FALTA**: MatrixGrade (grade inteligente)
- ⚠️ **FALTA**: Busca full-text
- ⚠️ **FALTA**: Upload de imagens (S3/MinIO)

#### 5. **Company Settings (Personalização)**

- ✅ CRUD de configurações da empresa
- ✅ Logo, cores (primary, secondary), theme mode, video link
- ✅ Cache em Redis
- ✅ Fallback resiliente (Prisma → API → InMemory)
- ✅ Auditoria de alterações

#### 6. **Notificações**

- ✅ Feed de notificações unificado
- ✅ Cursor-based pagination
- ✅ Filtros por ação, data, organização
- ✅ Combinação de feed de produtos e organizações
- ⚠️ **FALTA**: Templates de notificação
- ⚠️ **FALTA**: Preferências de notificação por usuário
- ⚠️ **FALTA**: Notificações por email
- ⚠️ **FALTA**: Notificações push

#### 7. **Realtime**

- ✅ Servidor WebSocket separado
- ✅ Geração de token para conexão
- ✅ Hub de realtime
- ✅ Integração com Redis Streams
- ⚠️ **FALTA**: Reconnect automático
- ⚠️ **FALTA**: Rooms por organização
- ⚠️ **FALTA**: Métricas de conexões ativas

#### 8. **Testes**

- ✅ Testes unitários (Vitest)
- ✅ Testes de rotas HTTP
- ✅ Testes de contratos (Zod schemas)
- ⚠️ **FALTA**: Testes E2E
- ⚠️ **FALTA**: Testes de integração com banco
- ⚠️ **FALTA**: Testes de carga

#### 9. **Documentação**

- ✅ OpenAPI schema parcial
- ⚠️ **FALTA**: Documentação completa das rotas
- ⚠️ **FALTA**: Exemplos de requisições/respostas
- ⚠️ **FALTA**: Documentação de eventos

---

## 🔧 O que precisa ser ajustado

### 1. **Autenticação e Autorização**

#### Prioridade: ALTA

**Problemas atuais:**

- JWT não é verificado em rotas protegidas
- Não há middleware de autenticação
- Não há validação de roles/permissões
- Headers `x-user-id` e `x-org-id` são confiáveis sem validação
- JWT usa HS256 (deveria ser RS256 para produção)

**Soluções necessárias:**

```typescript
// apps/api/src/core/auth/jwt.middleware.ts
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return reply.status(401).send({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    request.user = decoded; // Adicionar tipo ao FastifyRequest
  } catch (error) {
    return reply.status(401).send({ message: "Token inválido" });
  }
}

// apps/api/src/core/auth/role.guard.ts
export function requireRole(...roles: OrganizationRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const membership = await getMembership(
      request.user.userId,
      request.params.orgId,
    );
    if (!membership || !roles.includes(membership.role)) {
      return reply.status(403).send({ message: "Sem permissão" });
    }
  };
}
```

**Tarefas:**

- [ ] Criar middleware de autenticação JWT
- [ ] Criar guards para RBAC
- [ ] Adicionar decorators para rotas protegidas
- [ ] Migrar JWT de HS256 para RS256
- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting (por IP e por usuário)
- [ ] Validar `x-org-id` contra membros do usuário

### 2. **Multi-tenant e Isolamento de Dados**

#### Prioridade: ALTA

**Problemas atuais:**

- `orgId` é passado via header sem validação
- Não há garantia de isolamento de dados
- Usuários podem acessar dados de outras organizações

**Soluções necessárias:**

```typescript
// apps/api/src/core/tenant/tenant.middleware.ts
export async function validateTenantAccess(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const orgId = request.params.orgId || request.headers["x-org-id"];
  const userId = request.user.userId;

  const membership = await organizationRepository.encontrarMembership(
    orgId,
    userId,
  );
  if (!membership) {
    return reply.status(403).send({ message: "Sem acesso à organização" });
  }

  request.tenant = { orgId, role: membership.role };
}

// Aplicar automaticamente em todas as rotas que requerem orgId
```

**Tarefas:**

- [ ] Criar middleware de validação de tenant
- [ ] Adicionar filtro automático de `orgId` em repositórios
- [ ] Validar acesso a recursos por organização
- [ ] Adicionar testes de isolamento multi-tenant

### 3. **Validação e Tratamento de Erros**

#### Prioridade: MÉDIA

**Problemas atuais:**

- Erros não são padronizados
- Não há códigos de erro consistentes
- Stack traces podem vazar em produção

**Soluções necessárias:**

```typescript
// apps/api/src/core/errors/app.error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

// apps/api/src/core/errors/error.handler.ts
export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Erro não tratado
  request.log.error(error);
  return reply.status(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    },
  });
}
```

**Tarefas:**

- [ ] Criar hierarquia de erros (AppError, ValidationError, etc.)
- [ ] Implementar handler global de erros
- [ ] Padronizar códigos de erro
- [ ] Adicionar mascaramento de dados sensíveis em logs
- [ ] Adicionar tracing ID em todos os logs

### 4. **Migrações Prisma**

#### Prioridade: MÉDIA

**Problemas atuais:**

- Não há migrações versionadas
- Não há seeds para dados de teste
- Schema pode estar desatualizado

**Soluções necessárias:**

```bash
# Criar migração inicial
pnpm --filter @morina/api prisma migrate dev --name init

# Criar seeds
# apps/api/prisma/seeds/index.ts
```

**Tarefas:**

- [ ] Criar migração inicial do schema
- [ ] Adicionar seeds para dados de teste
- [ ] Configurar script de migração no package.json
- [ ] Documentar processo de migração
- [ ] Adicionar rollback de migrações

### 5. **Documentação OpenAPI**

#### Prioridade: MÉDIA

**Problemas atuais:**

- OpenAPI schema está incompleto
- Não há exemplos de requisições/respostas
- Não há documentação de eventos

**Soluções necessárias:**

```typescript
// apps/api/src/core/docs/openapi.ts
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

export async function registerOpenAPI(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Morina Light API",
        version: "0.1.0",
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });
}
```

**Tarefas:**

- [ ] Completar OpenAPI schema
- [ ] Adicionar exemplos de requisições/respostas
- [ ] Documentar eventos de domínio
- [ ] Adicionar autenticação no Swagger UI
- [ ] Gerar client SDK a partir do OpenAPI

---

## 🚀 O que precisa ser criado

### 1. **Preficha (Aprovação de Produtos)**

#### Prioridade: ALTA

**Funcionalidades:**

- Workflow de aprovação com etapas
- Aprovadores por organização
- Comentários e feedback
- Histórico de aprovações
- Notificações para aprovadores

**Estrutura:**

```typescript
// apps/api/src/modules/preficha/preficha.module.ts
// apps/api/src/modules/preficha/http/create-preficha.route.ts
// apps/api/src/modules/preficha/http/approve-preficha.route.ts
// apps/api/src/modules/preficha/http/reject-preficha.route.ts
```

**Modelo Prisma:**

```prisma
model Preficha {
  id           String   @id @default(uuid())
  orgId        String
  productId    String
  status       PrefichaStatus
  aprovadores  PrefichaAprovador[]
  comentarios  PrefichaComentario[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum PrefichaStatus {
  rascunho
  pendente_aprovacao
  aprovado
  rejeitado
}
```

**Tarefas:**

- [ ] Criar módulo Preficha
- [ ] Criar modelos Prisma
- [ ] Implementar use cases
- [ ] Criar rotas HTTP
- [ ] Adicionar eventos de domínio
- [ ] Implementar notificações

### 2. **Fornecedores e Oficinas**

#### Prioridade: MÉDIA

**Funcionalidades:**

- CRUD de fornecedores
- CRUD de oficinas
- Associação com produtos
- Documentação fiscal
- Certificados

**Modelo Prisma:**

```prisma
model Fornecedor {
  id          String   @id @default(uuid())
  orgId       String
  nome        String
  cnpj        String?
  documentoFiscal Json?
  certificados Json?
  produtos    FornecedorProduto[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Oficina {
  id          String   @id @default(uuid())
  orgId       String
  nome        String
  endereco    String?
  capacidade  Int?
  produtos    OficinaProduto[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Tarefas:**

- [ ] Criar módulo Fornecedores
- [ ] Criar módulo Oficinas
- [ ] Criar modelos Prisma
- [ ] Implementar use cases
- [ ] Criar rotas HTTP
- [ ] Adicionar validações

### 3. **Catálogo Avançado**

#### Prioridade: ALTA

**Funcionalidades:**

- SKU e variações (tamanho, cor)
- Categorias hierárquicas
- Ficha técnica
- Anexos (imagens, documentos)
- MatrixGrade (grade inteligente)
- Busca full-text

**Modelo Prisma:**

```prisma
model ProductVariant {
  id          String   @id @default(uuid())
  productId   String
  sku         String
  atributos   Json // { tamanho: 'M', cor: 'azul' }
  preco       Decimal?
  estoque     Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id          String   @id @default(uuid())
  orgId       String
  nome        String
  parentId    String?
  parent      Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  produtos    Product[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProductAttachment {
  id          String   @id @default(uuid())
  productId   String
  tipo        String // 'imagem', 'documento'
  url         String
  nome        String
  tamanho     Int?
  createdAt   DateTime @default(now())
}
```

**Tarefas:**

- [ ] Adicionar variações de produtos
- [ ] Implementar categorias hierárquicas
- [ ] Adicionar ficha técnica
- [ ] Implementar upload de anexos (S3/MinIO)
- [ ] Criar MatrixGrade
- [ ] Adicionar busca full-text
- [ ] Adicionar índices de performance

### 4. **Sistema de Upload (S3/MinIO)**

#### Prioridade: MÉDIA

**Funcionalidades:**

- Upload de imagens
- Upload de documentos
- Gerenciamento de buckets
- URLs assinadas
- Redimensionamento de imagens

**Estrutura:**

```typescript
// apps/api/src/modules/storage/storage.module.ts
// apps/api/src/modules/storage/storage.service.ts
// apps/api/src/modules/storage/http/upload.route.ts
```

**Tarefas:**

- [ ] Criar módulo Storage
- [ ] Integrar com MinIO/S3
- [ ] Implementar upload de arquivos
- [ ] Adicionar redimensionamento de imagens
- [ ] Criar rotas HTTP
- [ ] Adicionar validações de tipo/tamanho

### 5. **Sistema de Email**

#### Prioridade: MÉDIA

**Funcionalidades:**

- Envio de emails transacionais
- Templates de email
- Fila de emails
- Retry automático

**Estrutura:**

```typescript
// apps/api/src/modules/email/email.module.ts
// apps/api/src/modules/email/email.service.ts
// apps/api/src/modules/email/templates/
```

**Tarefas:**

- [ ] Criar módulo Email
- [ ] Integrar com serviço de email (SendGrid, SES, etc.)
- [ ] Criar templates de email
- [ ] Implementar fila de emails
- [ ] Adicionar retry automático
- [ ] Adicionar logs de envio

### 6. **CI/CD Pipeline**

#### Prioridade: ALTA

**Funcionalidades:**

- Testes automáticos
- Build e deploy
- Migrações automáticas
- Rollback

**Estrutura:**

```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - run: pnpm migrate
      - run: pnpm deploy
```

**Tarefas:**

- [ ] Criar workflow GitHub Actions
- [ ] Configurar testes automáticos
- [ ] Configurar build e deploy
- [ ] Adicionar migrações automáticas
- [ ] Configurar rollback
- [ ] Adicionar notificações

---

## 📈 O que precisa ser expandido

### 1. **Auditoria Completa**

#### Prioridade: ALTA

**Funcionalidades:**

- Auditoria de todas as ações
- Versionamento de entidades
- Histórico de alterações
- Logs estruturados
- Exportação de logs

**Tarefas:**

- [ ] Adicionar auditoria em todas as rotas
- [ ] Implementar versionamento de entidades
- [ ] Criar histórico de alterações
- [ ] Adicionar logs estruturados
- [ ] Implementar exportação de logs

### 2. **Métricas e Monitoramento**

#### Prioridade: MÉDIA

**Funcionalidades:**

- Métricas de performance
- Métricas de negócio
- Alertas
- Dashboards
- Tracing distribuído

**Tarefas:**

- [ ] Adicionar mais métricas Prometheus
- [ ] Integrar com Grafana
- [ ] Configurar alertas
- [ ] Criar dashboards
- [ ] Implementar tracing distribuído (Jaeger, Zipkin)

### 3. **Cache e Performance**

#### Prioridade: MÉDIA

**Funcionalidades:**

- Cache de consultas frequentes
- Cache de configurações
- Invalidação de cache
- CDN para assets estáticos

**Tarefas:**

- [ ] Implementar cache Redis
- [ ] Adicionar invalidação de cache
- [ ] Configurar CDN
- [ ] Otimizar queries do banco
- [ ] Adicionar índices de performance

### 4. **Testes**

#### Prioridade: ALTA

**Funcionalidades:**

- Testes E2E
- Testes de integração
- Testes de carga
- Testes de segurança

**Tarefas:**

- [ ] Criar testes E2E
- [ ] Adicionar testes de integração
- [ ] Implementar testes de carga
- [ ] Adicionar testes de segurança
- [ ] Configurar cobertura de código

### 5. **Segurança**

#### Prioridade: ALTA

**Funcionalidades:**

- Rate limiting
- CORS configurado
- Validação de entrada
- Sanitização de dados
- Proteção contra SQL injection
- Proteção contra XSS
- Proteção contra CSRF

**Tarefas:**

- [ ] Implementar rate limiting
- [ ] Configurar CORS corretamente
- [ ] Adicionar validação de entrada
- [ ] Implementar sanitização de dados
- [ ] Adicionar proteção contra SQL injection
- [ ] Adicionar proteção contra XSS
- [ ] Adicionar proteção contra CSRF

---

## 📋 Prioridades Resumidas

### 🔴 Prioridade ALTA (Fazer primeiro)

1. ✅ Middleware de autenticação JWT
2. ✅ Guards para RBAC
3. ✅ Validação de tenant/multi-tenant
4. ✅ Preficha (Aprovação de Produtos)
5. ✅ Catálogo Avançado (SKU, variações, categorias)
6. ✅ CI/CD Pipeline
7. ✅ Testes E2E
8. ✅ Segurança (rate limiting, validações)

### 🟡 Prioridade MÉDIA (Fazer depois)

1. ✅ Fornecedores e Oficinas
2. ✅ Sistema de Upload (S3/MinIO)
3. ✅ Sistema de Email
4. ✅ Documentação OpenAPI
5. ✅ Migrações Prisma
6. ✅ Métricas e Monitoramento
7. ✅ Cache e Performance

### 🟢 Prioridade BAIXA (Fazer por último)

1. ✅ OAuth2/Social login
2. ✅ Refresh tokens
3. ✅ Notificações push
4. ✅ CDN para assets
5. ✅ Tracing distribuído

---

## 🎯 Próximos Passos Recomendados

1. **Semana 1-2**: Autenticação e Autorização
   - Implementar middleware JWT
   - Criar guards para RBAC
   - Adicionar validação de tenant

2. **Semana 3-4**: Preficha
   - Criar módulo Preficha
   - Implementar workflow de aprovação
   - Adicionar notificações

3. **Semana 5-6**: Catálogo Avançado
   - Adicionar variações de produtos
   - Implementar categorias hierárquicas
   - Adicionar busca full-text

4. **Semana 7-8**: CI/CD e Testes
   - Criar pipeline CI/CD
   - Adicionar testes E2E
   - Configurar deploy automático

5. **Semana 9-10**: Segurança e Performance
   - Implementar rate limiting
   - Adicionar cache
   - Otimizar queries

---

## 📝 Notas Adicionais

- **Banco de dados**: PostgreSQL está configurado, mas não há migrações versionadas
- **Redis**: Está configurado para eventos, mas pode ser expandido para cache
- **Docker**: Compose está funcional, mas pode ser otimizado
- **Logs**: Pino está configurado, mas pode ser melhorado com estruturação
- **Métricas**: Prometheus está configurado, mas precisa de mais métricas
- **Testes**: Vitest está configurado, mas precisa de mais cobertura
- **Documentação**: OpenAPI está parcial, precisa ser completada

---

**Última atualização**: 2024-01-XX
**Versão**: 0.1.0
