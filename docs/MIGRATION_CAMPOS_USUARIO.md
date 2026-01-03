# 🔄 Migration - Campos Adicionais no Modelo User

## 📋 Resumo

Adicionados novos campos ao modelo `User` no Prisma schema para suportar informações pessoais completas do usuário.

---

## ✅ Campos Adicionados

### Informações Pessoais

- `cpf` (String?, VarChar(14)) - CPF formatado (000.000.000-00)
- `phone` (String?, VarChar(20)) - Telefone formatado
- `birthDate` (DateTime?) - Data de nascimento
- `admissionDate` (DateTime?) - Data de admissão
- `observations` (String?, Text) - Observações sobre o usuário

### Índices

- Índice adicionado em `cpf` para busca rápida

---

## 📝 Arquivos Modificados

### Backend

1. **`apps/api/prisma/schema.prisma`**
   - Adicionados campos ao modelo `User`
   - Adicionado índice em `cpf`

2. **`apps/api/src/modules/users/repositories/user.repository.ts`**
   - Atualizado `CreateUserInput` com novos campos
   - Atualizado `UpdateUserInput` com novos campos
   - Atualizado `UserRecord` com novos campos

3. **`apps/api/src/modules/users/infra/prisma/prisma-user.repository.ts`**
   - Atualizado método `create()` para salvar novos campos
   - Atualizado método `update()` para atualizar novos campos
   - Atualizado função `mapUser()` para mapear novos campos

4. **`apps/api/src/modules/users/http/create-user.route.ts`**
   - Atualizado schema Zod para validar novos campos
   - Atualizado lógica de criação para processar novos campos
   - Adicionado parsing de datas (birthDate, admissionDate)

### Frontend

5. **`apps/web/src/hooks/use-user.ts`**
   - Atualizado `CreateUserRequest` interface com novos campos

6. **`apps/web/src/components/admin/users/users-form-client.tsx`**
   - Atualizado `handleSubmit` para enviar todos os campos na requisição

---

## 🚀 Próximos Passos

### 1. Criar Migration do Prisma

```bash
cd apps/api
pnpm prisma migrate dev --name add_user_personal_fields
```

Isso irá:

- Criar um arquivo de migration com os novos campos
- Aplicar a migration no banco de dados de desenvolvimento
- Regenerar o Prisma Client com os novos tipos

### SQL da Migration (Referência)

O SQL gerado deve ser algo como:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "cpf" VARCHAR(14),
ADD COLUMN "phone" VARCHAR(20),
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "admissionDate" TIMESTAMP(3),
ADD COLUMN "observations" TEXT;

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");
```

### 2. Aplicar Migration em Produção

```bash
cd apps/api
pnpm prisma migrate deploy
```

**⚠️ IMPORTANTE:**

- Faça backup do banco antes de aplicar em produção
- Os campos são opcionais, então a migration é segura (não quebra dados existentes)

### 3. Regenerar Prisma Client (se necessário)

```bash
cd apps/api
pnpm prisma generate
```

---

## 🔒 Criptografia

Os campos `cpf` e `phone` serão automaticamente criptografados pelo middleware de criptografia do Prisma, conforme configurado em:

`apps/api/src/core/database/encryption.middleware.ts`

```typescript
const SENSITIVE_FIELDS: Record<string, string[]> = {
  User: ["cpf", "rg", "phone", "address", "documentNumber"],
  // ...
};
```

---

## ✅ Validações Implementadas

### Backend (Zod)

- `cpf`: String opcional
- `phone`: String opcional
- `birthDate`: String datetime ou formato YYYY-MM-DD
- `admissionDate`: String datetime ou formato YYYY-MM-DD
- `observations`: String opcional
- `avatarUrl`: URL opcional

### Frontend

- Validação de CPF (formato e dígitos verificadores)
- Máscaras de input (CPF, telefone)
- Validação de datas
- Validação de URL para avatar

---

## 📊 Impacto

### Dados Existentes

- ✅ **Seguro**: Todos os campos são opcionais
- ✅ **Compatível**: Usuários existentes não serão afetados
- ✅ **Backward Compatible**: API continua funcionando sem os novos campos

### Performance

- ✅ **Índice em CPF**: Busca rápida por CPF
- ✅ **Campos opcionais**: Não afeta queries existentes
- ✅ **Criptografia**: Apenas campos sensíveis são criptografados

---

## 🧪 Testes Recomendados

1. **Criar usuário com todos os campos**
2. **Criar usuário apenas com campos obrigatórios**
3. **Atualizar usuário existente com novos campos**
4. **Buscar usuário por CPF**
5. **Verificar criptografia de campos sensíveis**

---

## 📝 Notas Técnicas

### Formato de Datas

- Backend aceita: ISO 8601 datetime ou formato YYYY-MM-DD
- Frontend envia: YYYY-MM-DD (formato de input date)
- Banco armazena: DateTime (PostgreSQL)

### Campos Criptografados

- `cpf`: Criptografado automaticamente
- `phone`: Criptografado automaticamente
- Outros campos: Armazenados em texto plano

### Tamanhos de Campo

- `cpf`: VarChar(14) - suficiente para formato brasileiro
- `phone`: VarChar(20) - suficiente para formatos internacionais
- `observations`: Text - sem limite de tamanho

---

**Data de Implementação:** 2025-01-19  
**Status:** ✅ Código implementado, aguardando migration
