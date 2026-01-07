# ESLint Custom Rules - Clean Architecture

## 📋 Regras Implementadas

### 1. `no-domain-dependencies` (ERROR)

**Objetivo**: Garantir que a camada Domain não tenha dependências externas.

**Bloqueia**:
- ❌ Imports de `application/`
- ❌ Imports de `infrastructure/`
- ❌ Imports de `presentation/`
- ❌ Imports de `app/`
- ❌ Imports de bibliotecas externas (exceto `shared/kernel`)

**Permite**:
- ✅ Imports relativos dentro de `domain/`
- ✅ Imports de `@/domain`
- ✅ Imports de `@/shared/kernel`

**Exemplo de Violação**:
```typescript
// ❌ ERRO
import { IUserRepository } from '@/application/ports';
import { PrismaClient } from '@prisma/client';

export class UserEntity {
  // ...
}
```

**Correção**:
```typescript
// ✅ CORRETO
import { ValidationError } from '../errors';
import { Email } from '../value-objects';

export class UserEntity {
  // ...
}
```

---

### 2. `no-application-infrastructure-imports` (ERROR)

**Objetivo**: Garantir que Application dependa apenas de abstrações (ports).

**Bloqueia**:
- ❌ Imports de `infrastructure/`
- ❌ Imports de `presentation/`
- ❌ Imports de `app/`

**Permite**:
- ✅ Imports de `domain/`
- ✅ Imports de `shared/`
- ✅ Imports de `application/ports` (interfaces)

**Exemplo de Violação**:
```typescript
// ❌ ERRO
import { PrismaUserRepository } from '@/infrastructure/database';

export class CreateUserUseCase {
  constructor(private repo: PrismaUserRepository) {} // ❌ Implementação concreta
}
```

**Correção**:
```typescript
// ✅ CORRETO
import { IUserRepository } from '../ports';

export class CreateUserUseCase {
  constructor(private repo: IUserRepository) {} // ✅ Interface (abstração)
}
```

---

### 3. `no-presentation-infrastructure-imports` (ERROR)

**Objetivo**: Garantir que Presentation use Application layer, não Infrastructure.

**Bloqueia**:
- ❌ Imports de `infrastructure/`

**Permite**:
- ✅ Imports de `application/` (use cases, queries)
- ✅ Imports de `domain/` (para tipos de DTO)
- ✅ Imports de `presentation/` (hooks, components)

**Exemplo de Violação**:
```typescript
// ❌ ERRO
import { PrismaClient } from '@prisma/client';
import { InMemoryEventBus } from '@/infrastructure/events';

export function useCreateUser() {
  const prisma = new PrismaClient(); // ❌ Acesso direto à infra
}
```

**Correção**:
```typescript
// ✅ CORRETO
import { CreateUserUseCase } from '@/application/use-cases';
import { useInjection } from '@/app/providers';

export function useCreateUser() {
  const useCase = useInjection<CreateUserUseCase>('CreateUserUseCase'); // ✅ Via DI
  return useMutation({
    mutationFn: (dto) => useCase.execute(dto)
  });
}
```

---

### 4. `no-business-logic-in-components` (WARNING)

**Objetivo**: Detectar lógica de negócio em componentes React.

**Detecta**:
- ⚠️ Validações inline (`if (name.length < 3)`)
- ⚠️ Cálculos de negócio
- ⚠️ Regras de negócio (`.includes()`, `.some()`, `.every()`)

**Ignora**:
- ✅ Componentes que usam `useMutation` ou `useQuery` (delegando)
- ✅ Hooks customizados (`use*`)

**Exemplo de Violação**:
```typescript
// ⚠️ WARNING
export function ProductForm() {
  const handleSubmit = () => {
    if (price < 0) { // ⚠️ Validação de negócio no componente
      toast.error('Invalid price');
      return;
    }
    
    const discount = price * 0.1; // ⚠️ Cálculo de negócio
  };
}
```

**Correção**:
```typescript
// ✅ CORRETO
export function ProductForm() {
  const { mutate } = useCreateProduct(); // ✅ Delega para use case
  
  const handleSubmit = (data) => {
    mutate(data); // ✅ Sem lógica de negócio
  };
}
```

---

## 🚀 Como Usar

### Rodar ESLint

```bash
npm run lint
```

### Rodar com Fix Automático

```bash
npm run lint:fix
```

### Verificar Apenas Clean Architecture

```bash
npx eslint . --rule 'clean-arch/*: error'
```

---

## 📊 Benefícios

1. ✅ **Prevenção Automática** - Erros de arquitetura detectados no CI/CD
2. ✅ **Feedback Imediato** - IDE mostra erros em tempo real
3. ✅ **Documentação Viva** - Regras explicam a arquitetura
4. ✅ **Onboarding** - Novos devs aprendem as regras automaticamente
5. ✅ **Refactoring Seguro** - Impossível quebrar dependency rule

---

## 🎯 Próximos Passos

### Adicionar Mais Regras

1. **no-domain-events-outside-domain** - Eventos só podem ser criados em domain
2. **no-dto-in-domain** - DTOs não podem estar em domain
3. **enforce-use-case-naming** - Use cases devem terminar com `UseCase`
4. **enforce-query-naming** - Queries devem terminar com `Query`
5. **no-prisma-outside-infrastructure** - Prisma só em infrastructure

### Integrar com CI/CD

```yaml
# .github/workflows/lint.yml
- name: Lint Clean Architecture
  run: npm run lint
```

---

## 📝 Notas

- Regras são **error** por padrão (bloqueiam build)
- `no-business-logic-in-components` é **warning** (não bloqueia)
- Regras podem ser desabilitadas por arquivo com `// eslint-disable`
- Regras customizadas estão em `eslint-rules/`

---

**Última Atualização**: 2026-01-06
