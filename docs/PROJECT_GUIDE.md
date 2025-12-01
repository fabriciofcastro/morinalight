# 🚀 Morina - Guia Completo do Projeto

## 📋 Visão Geral

**Morina** é um sistema enterprise de gestão de comissões e auditoria em tempo real, desenvolvido com arquitetura moderna e design premium.

### Stack Tecnológica
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Fastify, Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Monorepo:** Turborepo + pnpm

---

## 🏗️ Arquitetura do Projeto

```
morina2/
├── apps/
│   ├── web/          # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/      # Rotas públicas (login, register)
│   │   │   │   ├── (app)/       # Rotas protegidas (dashboard)
│   │   │   │   └── (legal)/     # Páginas legais (LGPD, termos)
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── proxy.ts         # Middleware de autenticação
│   │   └── package.json
│   └── api/          # Backend Fastify
│       ├── src/
│       │   ├── modules/
│       │   ├── core/
│       │   └── prisma/
│       └── package.json
├── packages/
│   └── ui/           # Design System compartilhado
└── docs/             # Documentação
```

---

## 🔐 Fluxo de Autenticação

### 1. Login
```
Usuario → /login → LoginForm
         ↓
    POST /api/auth/login
         ↓
    Valida credenciais
         ↓
    Retorna token + organizações
         ↓
    Cookie: auth_token
         ↓
    Redirect: /dashboard ou /select-organization
```

### 2. Rotas Protegidas
- **Middleware:** `proxy.ts` verifica token em todas as rotas
- **Rotas Públicas:** Definidas em `publicRoutes[]`
- **Sem Token:** Redirect para `/login?redirect=<url>`

### 3. Rotas Públicas Atuais
```typescript
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/lgpd",
  "/termos",
  "/privacidade",
  // ... outras páginas legais
];
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- pnpm 8+

### 1. Clonar e Instalar
```bash
git clone <repo>
cd morina2
pnpm install
```

### 2. Configurar Ambiente
```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar variáveis necessárias
DATABASE_URL="postgresql://user:pass@localhost:5432/morina"
```

### 3. Iniciar Banco de Dados
```bash
# Iniciar PostgreSQL + Redis
docker-compose up -d

# Aguardar 10 segundos
sleep 10
```

### 4. Rodar Migrations
```bash
# Aplicar schema
cd apps/api
pnpm prisma migrate deploy

# Popular dados iniciais (opcional)
pnpm prisma db seed
```

### 5. Iniciar Serviços
```bash
# Terminal 1: Backend
cd apps/api
pnpm dev
# Roda em: http://localhost:3333

# Terminal 2: Frontend
cd apps/web
pnpm dev
# Roda em: http://localhost:3000
```

### 6. Acessar Sistema
```
URL: http://localhost:3000/login

Credenciais padrão (após seed):
Email: admin@morina.com
Senha: Admin@123
```

---

## 🎨 Design System

### Cores Principais
```css
--primary: hsl(210, 100%, 50%)    /* Neon Blue */
--secondary: hsl(280, 100%, 50%)  /* Purple */
--success: hsl(142, 71%, 45%)     /* Emerald */
--warning: hsl(38, 92%, 50%)      /* Amber */
--error: hsl(0, 72%, 51%)         /* Red */
```

### Tipografia
- **Fonte:** Sans-serif (Inter)
- **Tamanhos:**
  - Headings: 2xl, xl, lg
  - Body: sm (14px)
  - Labels: xs (12px)
  - Small: [10px]

### Componentes
- Localizados em: `packages/ui/src/components/`
- Exportados via: `packages/ui/src/index.ts`
- Uso: `import { Button } from '@morina/ui'`

---

## 🐛 Troubleshooting

### Login não funciona
```bash
# 1. Verificar backend
curl http://localhost:3333/health

# 2. Verificar banco
docker ps | grep postgres

# 3. Ver logs
cd apps/api && pnpm dev
# Verificar erros no console

# 4. Criar usuário manualmente
cd apps/api
pnpm prisma studio
# Adicionar usuário via interface
```

### Páginas legais redirecionam para login
```typescript
// Verificar proxy.ts
// Adicionar rota em publicRoutes[]
const publicRoutes = [
  "/login",
  "/sua-nova-rota", // ← Adicionar aqui
];
```

### Erro de módulo não encontrado
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
pnpm install
```

### Banco de dados não conecta
```bash
# Reiniciar containers
docker-compose down
docker-compose up -d

# Aguardar e rodar migrations
sleep 10
cd apps/api && pnpm prisma migrate deploy
```

---

## 📝 Checklist de Validação

Antes de considerar uma feature completa:

- [ ] Login funciona com credenciais corretas
- [ ] Páginas legais acessíveis sem login
- [ ] Fontes consistentes (100% sans-serif)
- [ ] Layout estável (sem shifts)
- [ ] Sem erros no console
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Loading states implementados
- [ ] Mensagens de erro claras
- [ ] Testes manuais realizados

---

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
pnpm dev              # Todos os serviços
pnpm dev --filter web # Apenas frontend
pnpm dev --filter api # Apenas backend

# Build
pnpm build            # Build de produção

# Banco de Dados
pnpm db:migrate       # Rodar migrations
pnpm db:seed          # Popular dados
pnpm db:studio        # Abrir Prisma Studio

# Testes
pnpm test             # Rodar testes
pnpm lint             # Verificar código
```

---

## 📚 Recursos Adicionais

### Documentação
- `/docs/GETTING_STARTED.md` - Guia inicial
- `/docs/COMPLETE_SUMMARY.md` - Resumo de melhorias
- `/docs/LOGIN_UX_FIXES.md` - Correções de UX

### Páginas Especiais
- `/login` - Autenticação
- `/dashboard` - Painel principal
- `/lgpd` - Política LGPD
- `/termos` - Termos de uso

---

**Versão:** 2.0.0  
**Desenvolvido por:** Michel, Adriana e Fabrício  
**Última atualização:** 2025-11-26
