# Guia de Testes - Morina Light

Este documento descreve a estrutura de testes do sistema e como executá-los.

## Estrutura de Testes

```
morina2/
├── apps/
│   ├── api/
│   │   └── tests/
│   │       ├── permissions/
│   │       │   ├── permissions.route.test.ts
│   │       │   └── permissions.use-case.test.ts
│   │       ├── clientes/
│   │       └── catalogo/
│   └── web/
│       └── src/
│           └── __tests__/
│               └── integration/
│                   └── permissions.test.ts
```

## Tipos de Testes

### 1. Testes Unitários

Testam componentes isolados, funções e use cases individualmente.

**Localização:** `apps/api/tests/**/*.test.ts`

**Exemplo:**
```bash
cd apps/api
pnpm test permissions.use-case.test.ts
```

### 2. Testes de Integração

Testam a interação entre componentes, rotas HTTP e banco de dados.

**Localização:** `apps/api/tests/**/*.route.test.ts`

**Exemplo:**
```bash
cd apps/api
pnpm test permissions.route.test.ts
```

### 3. Testes E2E (End-to-End)

Testam fluxos completos do usuário, incluindo frontend e backend.

**Localização:** `apps/web/src/__tests__/integration/`

**Exemplo:**
```bash
cd apps/web
pnpm test permissions.test.ts
```

## Executando Testes

### Todos os Testes

```bash
# Raiz do projeto
pnpm test

# Backend apenas
cd apps/api
pnpm test

# Frontend apenas
cd apps/web
pnpm test
```

### Testes Específicos

```bash
# Por arquivo
pnpm test permissions.test.ts

# Por padrão
pnpm test permissions

# Com watch mode
pnpm test --watch
```

### Coverage

```bash
# Gerar relatório de cobertura
pnpm test --coverage

# Ver relatório
open coverage/index.html
```

## Testes de Permissões

### Estrutura

Os testes de permissões estão organizados em:

1. **Use Cases** (`permissions.use-case.test.ts`)
   - Testa lógica de negócio
   - Verifica mapeamento de roles para permissões
   - Testa validações

2. **Rotas HTTP** (`permissions.route.test.ts`)
   - Testa endpoints da API
   - Verifica autenticação e autorização
   - Testa validação de inputs

3. **Integração Frontend** (`permissions.test.ts`)
   - Testa hooks React
   - Verifica chamadas à API
   - Testa cache de permissões

### Exemplos de Teste

#### Use Case

```typescript
describe("ListarUserPermissionsUseCase", () => {
  it("deve listar permissões do usuário admin", async () => {
    const useCase = new ListarUserPermissionsUseCase({ ... });
    const resultado = await useCase.execute({ orgId, userId });
    
    expect(resultado.permissions).toBeDefined();
    expect(resultado.role).toBe("admin");
  });
});
```

#### Rota HTTP

```typescript
describe("GET /users/:userId/permissions", () => {
  it("deve retornar permissões do usuário", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/users/${userId}/permissions`,
      headers: { authorization: `Bearer ${token}`, "x-org-id": orgId },
    });
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty("permissions");
  });
});
```

## Testes de Componentes (Frontend)

### Setup

O frontend usa Vitest para testes. Para testar componentes React:

```bash
cd apps/web
pnpm test --component
```

### Exemplo

```typescript
import { render, screen } from "@testing-library/react";
import { NotificationCenter } from "@/components/notifications/notification-center";

describe("NotificationCenter", () => {
  it("deve renderizar corretamente", () => {
    render(<NotificationCenter />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

## Mocks e Fixtures

### Mocks de Repositórios

Para isolar testes, use mocks de repositórios:

```typescript
const mockRepository = {
  encontrarPorId: vi.fn().mockResolvedValue(mockData),
  salvar: vi.fn().mockResolvedValue(undefined),
} as PermissionRepository;
```

### Fixtures

Crie fixtures para dados de teste reutilizáveis:

```typescript
export const mockUser = {
  userId: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
};

export const mockOrg = {
  id: "test-org-id",
  name: "Test Org",
  slug: "test-org",
};
```

## CI/CD

### GitHub Actions

O projeto inclui workflow de CI que executa testes automaticamente:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
```

## Boas Práticas

### 1. Nomear Testes Claramente

```typescript
// ❌ Ruim
it("works", () => { ... });

// ✅ Bom
it("deve retornar permissões do usuário quando usuário é admin", () => { ... });
```

### 2. Testar Comportamento, Não Implementação

```typescript
// ❌ Ruim
it("deve chamar encontrarPorId", () => { ... });

// ✅ Bom
it("deve retornar permissão quando existe", () => { ... });
```

### 3. Usar Arrange-Act-Assert

```typescript
it("deve criar permissão", () => {
  // Arrange
  const useCase = new CriarPermissionUseCase({ ... });
  const input = { name: "test", resource: "test", action: "view" };
  
  // Act
  const resultado = await useCase.execute(input);
  
  // Assert
  expect(resultado).toBeDefined();
  expect(resultado.name).toBe("test");
});
```

### 4. Limpar Dados de Teste

```typescript
afterEach(async () => {
  await cleanup();
});
```

## Troubleshooting

### Testes falhando por timeout

Aumente o timeout:

```typescript
it("teste lento", async () => {
  // ...
}, { timeout: 10000 });
```

### Testes flaky

- Verificar dependências assíncronas
- Usar `waitFor` para aguardar operações
- Evitar dependências externas (mock quando necessário)

### Problemas com Prisma

Em testes, use transações ou mocks:

```typescript
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Setup de teste
  });
});
```

## Coverage Mínimo

O projeto visa manter:
- **Unitários:** 80%+
- **Integração:** 70%+
- **E2E:** 50%+

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)

