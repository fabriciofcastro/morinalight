# 📝 Padrão de Nomenclatura - MORINA

> **Regras obrigatórias para nomenclatura de arquivos, variáveis e funções**

---

## 📁 Arquivos

### Frontend (apps/web/src/)

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente Client | `[module]-[feature]-client.tsx` | `user-form-client.tsx` |
| Componente UI | `[feature].tsx` | `futuristic-input.tsx` |
| Hook | `use-[feature].ts` | `use-auto-save.ts` |
| Utilitário | `[action]-[target].ts` | `format-cpf.ts` |
| Schema Zod | `[entity].schema.ts` | `user.schema.ts` |
| API Client | `[module]-api.ts` | `user-api.ts` |
| Constantes | `[module].constants.ts` | `app.constants.ts` |
| Types | `[module].types.ts` | `user.types.ts` |

### Backend (apps/api/src/)

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Entity | `[entity].ts` | `user.ts` |
| Use Case | `[action]-[entity].use-case.ts` | `criar-user.use-case.ts` |
| Repository | `prisma-[entity].repository.ts` | `prisma-user.repository.ts` |
| Schema | `[entity].schema.ts` | `user.schema.ts` |
| Route | `[action]-[entity].route.ts` | `create-user.route.ts` |

---

## 🏷️ Variáveis e Funções

### Variáveis
- **camelCase** para variáveis e funções
- **PascalCase** para classes e componentes
- **UPPER_SNAKE_CASE** para constantes
- **kebab-case** para arquivos e pastas

### Exemplos

```typescript
// ✅ Correto
const userName = "John";
const MAX_RETRIES = 3;
function formatCpf(cpf: string): string { }
class UserRepository { }
export function UserFormClient() { }

// ❌ Incorreto
const user_name = "John";
const maxRetries = 3; // constante deve ser UPPER_SNAKE_CASE
function FormatCPF(cpf: string) { } // função deve ser camelCase
```

---

## 📦 Componentes React

### Nomenclatura
- **Client Components:** `[Module][Feature]Client`
- **Server Components:** `[Module][Feature]`
- **UI Components:** `[Feature]`

### Exemplos

```typescript
// ✅ Correto
export function UserFormClient() { } // Client component
export function UserList() { } // Server component
export function FuturisticInput() { } // UI component

// ❌ Incorreto
export function userForm() { } // deve ser PascalCase
export function UserForm() { } // client component deve ter Client
```

---

## 🔧 Hooks Customizados

### Padrão
```typescript
// Nome do arquivo: use-[feature].ts
// Nome da função: use[Feature]

export function useAutoSave(options: UseAutoSaveOptions) {
  // ...
}
```

### Exemplos
- `use-auto-save.ts` → `useAutoSave()`
- `use-form-validation.ts` → `useFormValidation()`
- `use-debounce.ts` → `useDebounce()`

---

## 📡 API Clients

### Padrão
```typescript
// Nome do arquivo: [module]-api.ts
// Nome do export: [module]Api

export const userApi = {
  list: async () => { },
  get: async (id: string) => { },
  // ...
};
```

---

## 📋 Schemas Zod

### Padrão
```typescript
// Nome do arquivo: [entity].schema.ts

export const [entity]BaseSchema = z.object({ /* ... */ });
export const create[Entity]InputSchema = [entity]BaseSchema.extend({ /* ... */ });
export const update[Entity]InputSchema = [entity]BaseSchema.partial().extend({ /* ... */ });
export const [entity]ViewSchema = [entity]BaseSchema.extend({ /* ... */ });
```

---

## 🎯 Regras Gerais

1. **Sempre kebab-case para arquivos**
2. **Sempre camelCase para variáveis/funções**
3. **Sempre PascalCase para classes/componentes**
4. **Sempre UPPER_SNAKE_CASE para constantes**
5. **Nomes descritivos e claros**
6. **Evitar abreviações desnecessárias**

---

**Última atualização:** 2025-01-19

