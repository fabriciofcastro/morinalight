# 📐 Padronizações Completas do Projeto MORINA

> **Documento consolidado de todas as padronizações aplicadas e necessárias**

---

## 📊 Status Geral

**Score:** 8.5/10 ✅  
**Última Atualização:** 2025-01-19

---

## ✅ Padronizações Implementadas

### 1. Design System ✅
- **Localização:** `packages/ui/`
- **Componentes:** Button, Input, Select, FormField, GlassCard, Alert, Badge, DataTable
- **Tokens:** Cores, tipografia, espaçamento, animações
- **Temas:** Dark/Light mode
- **Documentação:** `docs/DESIGN_SYSTEM_GUIA_COMPLETO.md`

### 2. Templates de Telas ✅
- **StandardFormPage:** Template padrão para formulários
- **Auto-save:** Hook `useAutoSave` padronizado
- **Atalhos:** Ctrl+S, Esc padronizados
- **Documentação:** `docs/Diretrizes/PADRAO-TEMPLATE-TELAS.md`

### 3. Código e Formatação ✅
- **Linter:** Biome configurado
- **Formatter:** Prettier + Biome
- **TypeScript:** Strict mode
- **Commits:** Commitlint (conventional commits)
- **Husky:** Pre-commit hooks

### 4. Arquitetura Backend ✅
- **DDD:** Domain-Driven Design
- **Estrutura:** Domain → Application → Infrastructure
- **Eventos:** Domain events padronizados
- **Repositórios:** Interfaces padronizadas
- **Use Cases:** Padrão de casos de uso

### 5. Tratamento de Erros ✅
- **Classes:** Hierarquia completa de erros
- **Códigos:** Códigos padronizados
- **Handler:** Error handler global
- **Logging:** Logs estruturados
- **Documentação:** `docs/SISTEMA_TRATAMENTO_ERROS.md`

### 6. APIs e Rotas ✅
- **Fastify:** Framework padronizado
- **Validação:** Zod schemas
- **Respostas:** Formato JSON padronizado
- **Headers:** X-Organization-Id padronizado
- **OpenAPI:** Swagger configurado

### 7. Segurança ✅
- **RBAC/ABAC/PBAC:** Controle de acesso multi-camadas
- **Rate Limiting:** Redis com fallback
- **CORS:** Configurado
- **Helmet:** Headers de segurança
- **Auditoria:** Logs de ações críticas

---

## ⚠️ Padronizações Necessárias

### 1. Estrutura de Pastas Frontend 🔴 CRÍTICO

**Problema:** Estrutura inconsistente entre módulos

**Padrão Proposto:**
```
apps/web/src/
├── components/
│   ├── admin/
│   │   └── [module]/
│   │       ├── [module]-form-client.tsx
│   │       ├── [module]-list-client.tsx
│   │       └── [module]-detail-client.tsx
│   ├── ui/              # Componentes UI reutilizáveis
│   └── templates/       # Templates de páginas
├── hooks/               # Hooks customizados
├── lib/
│   ├── api/            # API clients
│   ├── utils/          # Utilitários
│   └── constants/      # Constantes
├── schemas/            # Zod schemas
└── app/                # Next.js app router
```

**Ação:** Criar template de estrutura

---

### 2. Nomenclatura de Arquivos 🔴 CRÍTICO

**Padrão:**
- **Componentes:** `kebab-case.tsx` (ex: `user-form-client.tsx`)
- **Hooks:** `use-kebab-case.ts` (ex: `use-auto-save.ts`)
- **Utils:** `kebab-case.ts` (ex: `format-cpf.ts`)
- **Types:** `kebab-case.types.ts` (ex: `user.types.ts`)
- **Schemas:** `kebab-case.schema.ts` (ex: `user.schema.ts`)
- **API Clients:** `kebab-case-api.ts` (ex: `user-api.ts`)

**Ação:** Documentar e aplicar em novos arquivos

---

### 3. Hooks Customizados 🟡 ALTA

**Padrão:**
```typescript
// Estrutura padrão de hook
export function use[Feature](options: Use[Feature]Options) {
  // 1. Estados
  const [state, setState] = useState();
  
  // 2. Efeitos
  useEffect(() => {
    // ...
  }, [deps]);
  
  // 3. Callbacks
  const handleAction = useCallback(() => {
    // ...
  }, [deps]);
  
  // 4. Retorno
  return {
    state,
    actions: { handleAction },
    // ...
  };
}
```

**Hooks Padronizados:**
- ✅ `useAutoSave`
- ✅ `useAriaLive`
- ✅ `useKeyboardNavigation`
- ⏳ `useFormValidation` (criar)
- ⏳ `useDebounce` (criar)
- ⏳ `useLocalStorage` (criar)

**Ação:** Criar hooks faltantes

---

### 4. API Clients 🟡 ALTA

**Padrão:**
```typescript
// Estrutura padrão de API client
export const [module]Api = {
  // Listar
  list: async (params?: ListParams): Promise<ListResponse<Type>> => {
    return api.get(`/[module]`, { params });
  },
  
  // Buscar por ID
  get: async (id: string): Promise<Type> => {
    return api.get(`/[module]/${id}`);
  },
  
  // Criar
  create: async (data: CreateInput): Promise<Type> => {
    return api.post(`/[module]`, data);
  },
  
  // Atualizar
  update: async (data: UpdateInput): Promise<Type> => {
    return api.put(`/[module]/${data.id}`, data);
  },
  
  // Deletar
  delete: async (id: string): Promise<void> => {
    return api.delete(`/[module]/${id}`);
  },
};
```

**Ação:** Padronizar todos os API clients existentes

---

### 5. Validação com Zod 🟡 ALTA

**Padrão:**
```typescript
// Schema base
export const [entity]BaseSchema = z.object({
  name: z.string().min(2).max(255),
  // ...
});

// Schema de criação
export const create[Entity]InputSchema = [entity]BaseSchema.extend({
  orgId: z.string().uuid(),
});

// Schema de atualização
export const update[Entity]InputSchema = [entity]BaseSchema.partial().extend({
  id: z.string().uuid(),
});

// Schema de view (resposta)
export const [entity]ViewSchema = [entity]BaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

**Ação:** Revisar e padronizar todos os schemas

---

### 6. Constantes e Enums 🟢 MÉDIA

**Padrão:**
```typescript
// Constantes em arquivo separado
export const [MODULE]_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  // ...
} as const;

// Enums
export enum [Entity]Status {
  ACTIVE = "ativo",
  INACTIVE = "inativo",
  ARCHIVED = "arquivado",
}
```

**Ação:** Consolidar constantes espalhadas

---

### 7. Utilitários 🟢 MÉDIA

**Padrão:**
```typescript
// Funções puras, bem testadas
export function format[Feature](value: Type): string {
  // ...
}

// Validações
export function isValid[Feature](value: unknown): value is Type {
  // ...
}

// Transformações
export function transform[Feature](data: Input): Output {
  // ...
}
```

**Ação:** Organizar utilitários por categoria

---

### 8. Testes 🟡 ALTA

**Padrão:**
```typescript
// Estrutura de teste
describe("[Feature]", () => {
  describe("quando [condição]", () => {
    it("deve [comportamento esperado]", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});

// Mocks padronizados
const mock[Entity] = {
  id: "uuid",
  // ...
} as [Entity];
```

**Cobertura Mínima:**
- Domain: > 90%
- Application: > 80%
- Infrastructure: > 70%
- Components: > 60%

**Ação:** Criar templates de teste

---

### 9. Documentação de Código 🟢 MÉDIA

**Padrão:**
```typescript
/**
 * [Descrição curta do que faz]
 * 
 * @param {Type} param - Descrição do parâmetro
 * @returns {Type} Descrição do retorno
 * @throws {ErrorType} Quando ocorre erro
 * 
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
export function functionName(param: Type): ReturnType {
  // ...
}
```

**Ação:** Documentar funções complexas

---

### 10. Variáveis de Ambiente 🟡 ALTA

**Padrão:**
```typescript
// apps/api/src/core/config/env.ts
export const env = {
  NODE_ENV: z.enum(["development", "production", "test"]).parse(process.env.NODE_ENV),
  DATABASE_URL: z.string().url().parse(process.env.DATABASE_URL),
  // ...
} as const;
```

**Ação:** Consolidar todas as variáveis de ambiente

---

### 11. Logging 🟢 MÉDIA

**Padrão:**
```typescript
// Estrutura de log padronizada
logger.info({
  action: "user.created",
  userId: user.id,
  orgId: org.id,
  metadata: { /* contexto adicional */ },
});
```

**Ação:** Padronizar formato de logs

---

### 12. Configurações 🟢 MÉDIA

**Padrão:**
```typescript
// Configurações por módulo
export const [module]Config = {
  cache: {
    ttl: 3600,
    keyPrefix: "[module]:",
  },
  limits: {
    maxItems: 100,
  },
} as const;
```

**Ação:** Consolidar configurações

---

## 📋 Checklist de Aplicação

### Prioridade CRÍTICA (1-2 semanas)
- [ ] Estrutura de pastas frontend padronizada
- [ ] Nomenclatura de arquivos documentada
- [ ] API clients padronizados
- [ ] Variáveis de ambiente consolidadas

### Prioridade ALTA (1 mês)
- [ ] Hooks customizados padronizados
- [ ] Schemas Zod revisados
- [ ] Templates de teste criados
- [ ] Constantes consolidadas

### Prioridade MÉDIA (2-3 meses)
- [ ] Utilitários organizados
- [ ] Documentação de código
- [ ] Logging padronizado
- [ ] Configurações consolidadas

---

## 📚 Documentação Relacionada

- `docs/DESIGN_SYSTEM_GUIA_COMPLETO.md` - Design System
- `docs/Diretrizes/PADRAO-TEMPLATE-TELAS.md` - Templates
- `docs/SISTEMA_TRATAMENTO_ERROS.md` - Erros
- `docs/Diretrizes/Guia-Desenvolvimento-Deploy-Produção.md` - Desenvolvimento

---

**Última atualização:** 2025-01-19

