# Validações e Segurança - Documentação

## 📋 Visão Geral

Este documento descreve o sistema completo de validações e segurança implementado no projeto MORINA.

## 🔒 Validações de Formulário

### Validações Brasileiras

Localização: `apps/web/src/lib/validators/brazilian.ts`

#### CPF

- **Função**: `validateCpf(cpf: string): boolean`
- **Formato aceito**: "000.000.000-00" ou "00000000000"
- **Validação**: Módulo 11 com dígitos verificadores
- **Formatação**: `formatCpf(cpf: string): string`

#### CNPJ

- **Função**: `validateCnpj(cnpj: string): boolean`
- **Formato aceito**: "00.000.000/0000-00" ou "00000000000000"
- **Validação**: Módulo 11 com dígitos verificadores
- **Formatação**: `formatCnpj(cnpj: string): string`

#### CEP

- **Função**: `validateCep(cep: string): boolean`
- **Formato aceito**: "00000-000" ou "00000000"
- **Validação**: 8 dígitos numéricos
- **Formatação**: `formatCep(cep: string): string`

#### Telefone

- **Função**: `validatePhone(phone: string): boolean`
- **Formato aceito**: (00) 0000-0000, (00) 00000-0000, etc.
- **Validação**: 10 ou 11 dígitos
- **Formatação**: `formatPhone(phone: string): string`

#### Email

- **Função**: `validateEmail(email: string, checkDomain?: boolean): boolean`
- **Validação**: Regex + verificação de domínio opcional
- **Formatação**: Trim + lowercase automático

#### Data

- **Função**: `validateDate(dateStr: string): boolean`
- **Formato**: DD/MM/YYYY
- **Validação**: Formato e lógica de data válida

#### Senha

- **Função**: `validatePasswordStrength(password: string)`
- **Retorna**:
  - `strength`: 0-4 (força da senha)
  - `valid`: boolean
  - `errors`: array de mensagens
  - `requirements`: objeto com requisitos atendidos
- **Requisitos**:
  - Mínimo 8 caracteres
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
  - Pelo menos um caractere especial

### Validações de Upload

Localização: `apps/web/src/lib/validators/upload.ts`

#### Validação de Arquivo

- **Função**: `validateFile(file: File, options?: FileValidationOptions)`
- **Opções**:
  - `maxSize`: Tamanho máximo em bytes
  - `allowedTypes`: MIME types permitidos
  - `allowedExtensions`: Extensões permitidas
  - `minWidth/maxWidth`: Dimensões de imagem
  - `minHeight/maxHeight`: Dimensões de imagem
  - `maxFiles`: Máximo de arquivos (para múltiplos)

#### Presets Comuns

- `fileValidationPresets.image`: Imagens (JPEG, PNG, GIF, WebP, 5MB)
- `fileValidationPresets.document`: Documentos (PDF, DOC, DOCX, 10MB)
- `fileValidationPresets.avatar`: Avatar (JPEG, PNG, WebP, 2MB, 100-2000px)
- `fileValidationPresets.userDocument`: Documentos de usuário (PDF, JPEG, PNG, 5MB)

### Schemas Zod

Localização: `apps/web/src/lib/validators/zod-schemas.ts`

Schemas Zod pré-configurados com validações brasileiras:

- `cpfSchema`
- `cnpjSchema`
- `cepSchema`
- `phoneSchema`
- `emailSchema(checkDomain?: boolean)`
- `passwordSchema`
- `dateSchema`
- `urlSchema`
- `documentSchema` (CPF ou CNPJ)

## 🛡️ Segurança Backend

### Rate Limiting

Localização: `apps/api/src/core/middleware/rate-limit.middleware.ts`

#### Presets Disponíveis

- `rateLimits.general`: 100 requisições / 15 minutos
- `rateLimits.auth`: 5 tentativas / 15 minutos (login)
- `rateLimits.create`: 10 criações / 1 minuto
- `rateLimits.sensitive`: 5 operações / 1 hora (senha, 2FA)
- `rateLimits.search`: 30 buscas / 1 minuto
- `rateLimits.upload`: 5 uploads / 1 minuto

#### Uso

```typescript
app.addHook("onRequest", async (request, reply) => {
  await rateLimits.auth(request, reply);
});
```

### Sanitização de Inputs

Localização: `apps/api/src/core/middleware/sanitize.middleware.ts`

#### Funções

- `sanitizeString(input: string)`: Remove tags HTML, scripts, event handlers
- `sanitizeObject<T>(obj: T)`: Sanitiza objeto recursivamente
- `sanitizeEmail(email: string)`: Valida e sanitiza email
- `sanitizeUrl(url: string)`: Valida e sanitiza URL (apenas http/https)

#### Middleware Automático

Aplicado automaticamente em todas as requisições via hook `onRequest`.

### Security Headers

Localização: `apps/api/src/core/middleware/security-headers.middleware.ts`

Headers de segurança configurados:

- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy
- Strict-Transport-Security (HTTPS apenas)

### Verificação de Permissões

Localização: `apps/api/src/core/middleware/permission-check.middleware.ts`

#### Middleware

- `requirePermission(options)`: Verifica permissão específica
- `requireAnyPermission(permissions[])`: Verifica se tem qualquer uma das permissões

#### Uso

```typescript
app.post("/users", requirePermission({ permission: "users.create" }), handler);
```

### Helmet (Já Configurado)

O Helmet já está configurado em `create-server.ts` com:

- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- Cross-Origin Policies

## 📝 Notas de Implementação

### Prisma e SQL Injection

- Prisma usa prepared statements, protegendo contra SQL injection
- Validação adicional com Zod em todas as rotas

### Criptografia

- Senhas: bcryptjs (hash)
- Tokens JWT: jsonwebtoken
- Dados sensíveis: Considerar criptografia adicional se necessário

### Auditoria

- Todas as ações críticas registradas em `OrganizationAuditLog`
- Rate limit warnings também são auditados

## 🔄 Próximos Passos

1. Implementar CSRF tokens para formulários
2. Adicionar validação de permissões em todas as rotas sensíveis
3. Implementar criptografia de dados sensíveis no banco
4. Adicionar logging de segurança mais detalhado
5. Implementar verificação de integridade de dados
