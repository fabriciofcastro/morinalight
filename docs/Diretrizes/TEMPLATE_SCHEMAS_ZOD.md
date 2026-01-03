# 📋 Template de Padronização de Schemas Zod - MORINA

> **Padrão obrigatório para todos os schemas Zod no sistema**

---

## 🎯 Objetivo

Garantir consistência na nomenclatura e estrutura de todos os schemas Zod, facilitando manutenção e compreensão do código.

---

## 📐 Padrão de Nomenclatura

### Estrutura Base

```typescript
// Arquivo: [entity].schema.ts
// Exemplo: user.schema.ts, department.schema.ts

import { z } from "zod";

// 1. Schema Base (campos comuns)
export const [entity]BaseSchema = z.object({
  // Campos comuns que aparecem em create, update e view
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().nullable(),
  // ...
});

// 2. Schema de Criação (Create Input)
export const create[Entity]InputSchema = [entity]BaseSchema.extend({
  orgId: z.string().uuid("orgId deve ser um UUID válido"),
  // Campos adicionais específicos de criação
});

// 3. Schema de Atualização (Update Input)
export const update[Entity]InputSchema = [entity]BaseSchema.partial().extend({
  id: z.string().uuid("id deve ser um UUID válido"),
  // Campos adicionais específicos de atualização
});

// 4. Schema de Visualização (View/Response)
export const [entity]ViewSchema = [entity]BaseSchema.extend({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Campos adicionais de resposta (relacionamentos, etc.)
});

// 5. Types TypeScript derivados
export type [Entity]Base = z.infer<typeof [entity]BaseSchema>;
export type Create[Entity]Input = z.infer<typeof create[Entity]InputSchema>;
export type Update[Entity]Input = z.infer<typeof update[Entity]InputSchema>;
export type [Entity]View = z.infer<typeof [entity]ViewSchema>;
```

---

## 📝 Exemplo Completo

### user.schema.ts

```typescript
import { z } from "zod";
import { cpfSchema, emailSchema } from "@/lib/validators/zod-schemas";

// Schema Base
export const userBaseSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(120),
  email: emailSchema,
  cpf: cpfSchema.optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z
    .string()
    .date("Data de nascimento inválida")
    .optional()
    .nullable(),
  status: z.enum(["pending", "active", "suspended"], {
    required_error: "Status é obrigatório",
  }),
  requirePasswordChange: z.boolean().default(false),
  sendWelcomeEmail: z.boolean().default(false),
});

// Schema de Criação
export const createUserInputSchema = userBaseSchema.extend({
  orgId: z.string().uuid("orgId deve ser um UUID válido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  departmentId: z.string().uuid("departmentId deve ser um UUID válido"),
  sectorId: z.string().uuid("sectorId deve ser um UUID válido"),
  positionId: z.string().uuid("positionId deve ser um UUID válido"),
  admissionDate: z
    .string()
    .date("Data de admissão inválida")
    .optional()
    .nullable(),
  observations: z.string().max(2000).optional().nullable(),
});

// Schema de Atualização
export const updateUserInputSchema = userBaseSchema.partial().extend({
  id: z.string().uuid("id deve ser um UUID válido"),
  password: z.string().min(8).optional(),
  departmentId: z.string().uuid().optional(),
  sectorId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
});

// Schema de Visualização
export const userViewSchema = userBaseSchema.extend({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  departmentId: z.string().uuid().nullable(),
  sectorId: z.string().uuid().nullable(),
  positionId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

// Types
export type UserBase = z.infer<typeof userBaseSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type UserView = z.infer<typeof userViewSchema>;
```

---

## 🔧 Regras Obrigatórias

### 1. Nomenclatura

- ✅ **Base Schema:** `[entity]BaseSchema` (camelCase)
- ✅ **Create Schema:** `create[Entity]InputSchema` (PascalCase para Entity)
- ✅ **Update Schema:** `update[Entity]InputSchema` (PascalCase para Entity)
- ✅ **View Schema:** `[entity]ViewSchema` (camelCase)
- ✅ **Types:** `[Entity]Base`, `Create[Entity]Input`, `Update[Entity]Input`, `Entity]View`

### 2. Estrutura

- ✅ Sempre começar com `BaseSchema`
- ✅ `createSchema` sempre `extend` do `BaseSchema`
- ✅ `updateSchema` sempre `partial().extend()` do `BaseSchema`
- ✅ `viewSchema` sempre `extend` do `BaseSchema` com campos de resposta

### 3. Validações

- ✅ Sempre incluir mensagens de erro descritivas
- ✅ Usar schemas reutilizáveis (cpfSchema, cnpjSchema, etc.)
- ✅ Validar UUIDs com `.uuid("mensagem")`
- ✅ Validar datas com `.date("mensagem")`
- ✅ Validar emails com `emailSchema` ou `.email("mensagem")`

### 4. Organização

- ✅ Um arquivo por entidade: `[entity].schema.ts`
- ✅ Localização: `apps/web/src/schemas/[entity].schema.ts`
- ✅ Exportar todos os schemas e types
- ✅ Documentar schemas complexos com JSDoc

---

## 📋 Checklist de Padronização

Para cada schema existente:

- [ ] Renomear para seguir padrão de nomenclatura
- [ ] Criar `BaseSchema` se não existir
- [ ] Separar `createSchema`, `updateSchema` e `viewSchema`
- [ ] Adicionar mensagens de erro descritivas
- [ ] Usar schemas reutilizáveis quando possível
- [ ] Exportar types TypeScript
- [ ] Adicionar JSDoc para schemas complexos
- [ ] Mover para `apps/web/src/schemas/` se estiver em outro local

---

## 🔍 Schemas Reutilizáveis

### Localização

`apps/web/src/lib/validators/zod-schemas.ts`

### Schemas Disponíveis

- `cpfSchema` - Validação de CPF
- `cnpjSchema` - Validação de CNPJ
- `cepSchema` - Validação de CEP
- `phoneSchema` - Validação de telefone
- `emailSchema` - Validação de email
- `passwordSchema` - Validação de senha

### Uso

```typescript
import { cpfSchema, emailSchema } from "@/lib/validators/zod-schemas";

export const userBaseSchema = z.object({
  cpf: cpfSchema.optional().nullable(),
  email: emailSchema,
  // ...
});
```

---

## 📚 Exemplos de Migração

### ❌ Antes (Inconsistente)

```typescript
// company-registration.ts
export const companyRegistrationSchema = z.object({
  name: z.string().min(2),
  // ...
});

// company-settings-advanced.ts
export const companySettingsSchema = z.object({
  // ...
});
```

### ✅ Depois (Padronizado)

```typescript
// company.schema.ts
export const companyBaseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  // ...
});

export const createCompanyInputSchema = companyBaseSchema.extend({
  orgId: z.string().uuid(),
  // ...
});

export const updateCompanyInputSchema = companyBaseSchema.partial().extend({
  id: z.string().uuid(),
  // ...
});

export const companyViewSchema = companyBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // ...
});
```

---

## 🎯 Prioridades de Migração

### Alta Prioridade

1. `company-registration.ts` → `company.schema.ts`
2. `company-settings-advanced.ts` → `company.schema.ts` (consolidar)
3. Schemas de usuário (se existirem)

### Média Prioridade

4. Schemas de entidades organizacionais (departments, sectors, etc.)
5. Schemas de fichas de custo

### Baixa Prioridade

6. Schemas de formulários específicos (login, invite, etc.)

---

**Última atualização:** 2025-01-19  
**Mantido por:** Equipe de Arquitetura MORINA




