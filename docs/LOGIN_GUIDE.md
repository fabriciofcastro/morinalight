# Guia Rápido - Login e Autenticação

## 🚀 Como Testar o Login

### 1. Iniciar os Serviços

**Terminal 1 - Backend:**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

### 2. Acessar o Sistema

Abra o navegador em: **http://localhost:3000**

O sistema irá redirecionar automaticamente para `/login`

### 3. Credenciais de Teste

Use as credenciais criadas no backend:

```
Email: admin@morina.com
Senha: Admin@123
```

(Ou use o script `scripts/ensure-user.ts` para criar um usuário)

## 🔧 Verificação Rápida

Execute o script de teste:
```bash
./scripts/test-login.sh
```

## 📋 Fluxo de Autenticação

1. **Login** (`/login`)
   - Usuário insere email e senha
   - Sistema valida com backend (`POST /auth/login`)
   - Backend retorna: `{ token, user, organizations }`
   - Token armazenado em `localStorage`

2. **Seleção de Organização** (`/select-organization`)
   - Se usuário tem múltiplas organizações
   - Seleciona qual acessar
   - Organization ID armazenado em `localStorage`

3. **Dashboard** (`/dashboard`)
   - Acesso ao sistema
   - Sidebar com navegação
   - Stats e quick actions

## 🐛 Troubleshooting

### Backend não responde
```bash
# Verificar se está rodando
curl http://localhost:3001/health

# Se não estiver, iniciar
cd apps/api && pnpm dev
```

### Frontend não carrega
```bash
# Verificar se está rodando
curl http://localhost:3000

# Se não estiver, iniciar
cd apps/web && pnpm dev
```

### Erro "Cannot find module"
```bash
# Reinstalar dependências
cd apps/web
pnpm install
```

### Erro de CORS
O backend já está configurado para aceitar requisições do frontend.
Verifique se as URLs estão corretas:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## 📝 Variáveis de Ambiente

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`apps/api/.env`)
```env
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

## ✅ Checklist de Funcionalidades

- [x] Página de login carrega
- [x] Formulário com validação
- [x] Toggle de visibilidade de senha
- [x] Checkbox "Manter conectado"
- [x] Link para registro
- [x] Mensagens de erro claras
- [x] Estados de loading
- [ ] Login com backend (testar)
- [ ] Redirecionamento pós-login
- [ ] Seleção de organização
- [ ] Acesso ao dashboard
- [ ] Logout funcional

## 🎨 Componentes do Login

### LoginForm
- `apps/web/src/components/auth/LoginForm.tsx`
- Formulário com validação
- Integração com API

### LoginPage
- `apps/web/src/app/(auth)/login/page.tsx`
- Layout two-column
- Branding e features

### API Client
- `apps/web/src/lib/api/auth.ts`
- Métodos: login, register, logout
- Gerenciamento de token

## 🔐 Segurança

- JWT armazenado em localStorage
- Token enviado automaticamente em todas as requisições
- Interceptor para tratar 401 (logout automático)
- Organization ID enviado em header `x-organization-id`

## 📱 Responsividade

- Mobile-first design
- Breakpoints: 640px, 768px, 1024px, 1280px
- Sidebar collapsible em mobile
- Forms adaptáveis
