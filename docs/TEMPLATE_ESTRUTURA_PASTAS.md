# 📁 Template de Estrutura de Pastas - Frontend

> **Padrão obrigatório para organização de código frontend**

---

## 🎯 Estrutura Padrão

```
apps/web/src/
├── app/                          # Next.js App Router
│   └── (app)/                    # Grupo de rotas autenticadas
│       └── admin/                # Módulo administrativo
│           └── [module]/         # Ex: users, departments
│               ├── page.tsx      # Lista
│               ├── new/
│               │   └── page.tsx  # Criar
│               └── [id]/
│                   ├── page.tsx      # Detalhes
│                   ├── edit/
│                   │   └── page.tsx # Editar
│                   └── [submodule]/  # Ex: permissions, members
│                       └── page.tsx
│
├── components/                   # Componentes React
│   ├── admin/                   # Componentes específicos de admin
│   │   └── [module]/
│   │       ├── [module]-form-client.tsx
│   │       ├── [module]-list-client.tsx
│   │       ├── [module]-detail-client.tsx
│   │       └── [module]-[feature]-client.tsx
│   ├── ui/                      # Componentes UI reutilizáveis
│   │   ├── futuristic-input.tsx
│   │   ├── futuristic-select.tsx
│   │   └── futuristic-textarea.tsx
│   ├── templates/               # Templates de páginas
│   │   └── StandardFormPage.tsx
│   ├── layout/                  # Componentes de layout
│   │   └── PageBackground.tsx
│   └── notifications/           # Sistema de notificações
│       └── notification-center.tsx
│
├── hooks/                       # Hooks customizados
│   ├── use-auto-save.ts
│   ├── use-aria-live.tsx
│   ├── use-keyboard-navigation.ts
│   └── use-[feature].ts
│
├── lib/                         # Bibliotecas e utilitários
│   ├── api/                     # API clients
│   │   ├── base.ts              # Cliente base
│   │   ├── organizational-structure.ts
│   │   ├── permissions.ts
│   │   └── [module]-api.ts
│   ├── utils/                   # Funções utilitárias
│   │   ├── format-cpf.ts
│   │   ├── format-cnpj.ts
│   │   ├── format-currency.ts
│   │   └── [utility].ts
│   ├── constants/               # Constantes
│   │   ├── app.constants.ts
│   │   └── [module].constants.ts
│   └── integrations/            # Integrações externas
│       ├── cnpj.ts
│       ├── cpf.ts
│       └── viacep.ts
│
├── schemas/                     # Zod schemas
│   ├── user.schema.ts
│   ├── department.schema.ts
│   └── [entity].schema.ts
│
└── types/                       # TypeScript types (se necessário)
    └── [module].types.ts
```

---

## 📋 Regras de Nomenclatura

### Arquivos

- **Componentes:** `kebab-case.tsx` (ex: `user-form-client.tsx`)
- **Hooks:** `use-kebab-case.ts` (ex: `use-auto-save.ts`)
- **Utils:** `kebab-case.ts` (ex: `format-cpf.ts`)
- **Types:** `kebab-case.types.ts` (ex: `user.types.ts`)
- **Schemas:** `kebab-case.schema.ts` (ex: `user.schema.ts`)
- **API Clients:** `kebab-case-api.ts` (ex: `user-api.ts`)
- **Constants:** `kebab-case.constants.ts` (ex: `app.constants.ts`)

### Pastas

- **Módulos:** `kebab-case` (ex: `user-management`)
- **Features:** `kebab-case` (ex: `permission-matrix`)

### Componentes React

- **Client Components:** `[Module][Feature]Client` (ex: `UserFormClient`)
- **Server Components:** `[Module][Feature]` (ex: `UserList`)
- **UI Components:** `[Feature]` (ex: `FuturisticInput`)

---

## ✅ Checklist de Aplicação

Ao criar novo módulo:

- [ ] Criar estrutura de pastas seguindo template
- [ ] Nomear arquivos em kebab-case
- [ ] Criar API client padronizado
- [ ] Criar schemas Zod
- [ ] Criar componentes seguindo padrão
- [ ] Adicionar constantes se necessário
- [ ] Documentar estrutura no README do módulo

---

**Última atualização:** 2025-01-19

