# Guia de Migração para httpOnly Cookies

## 🔒 Por que Migrar?

### Problemas com localStorage

❌ **Vulnerável a XSS**
```javascript
// Qualquer script pode acessar
const token = localStorage.getItem('token');
// Se houver XSS, o atacante rouba o token!
```

❌ **Sem expiração automática**
```javascript
// Token fica para sempre até logout manual
localStorage.setItem('token', token);
```

❌ **Sem proteção CSRF**
```javascript
// Atacante pode fazer requisições em nome do usuário
```

### Benefícios dos httpOnly Cookies

✅ **Proteção contra XSS**
- JavaScript não pode acessar o cookie
- Mesmo com XSS, token está seguro

✅ **Expiração automática**
- Cookie expira automaticamente
- Renovação automática com refresh token

✅ **Proteção CSRF**
- Combinado com CSRF tokens
- Dupla camada de segurança

✅ **Flags de segurança**
- `HttpOnly`: Não acessível via JavaScript
- `Secure`: Apenas HTTPS
- `SameSite`: Proteção contra CSRF

---

## 🚀 Como Migrar

### 1. Backend Changes (Necessário)

#### Antes (retornava token)
```typescript
// ❌ Backend antigo
POST /auth/login
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Depois (seta cookie)
```typescript
// ✅ Backend novo
POST /auth/login
Response: {
  "user": { ... }
}
Headers: {
  "Set-Cookie": "auth-token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/"
}
```

### 2. Frontend Changes

#### Antes (localStorage)
```typescript
// ❌ Código antigo
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  const { token, user } = await response.json();
  
  // INSEGURO: Token em localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const apiCall = async () => {
  const token = localStorage.getItem('token');
  
  return fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

#### Depois (httpOnly cookies)
```typescript
// ✅ Código novo
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/base';

const login = async (email, password) => {
  const { user } = await authApi.login({ email, password });
  
  // Token já está no cookie httpOnly!
  // Salvar apenas dados não-sensíveis
  localStorage.setItem('user', JSON.stringify(user));
};

const apiCall = async () => {
  // Cookie é enviado automaticamente!
  return apiClient.get('/users');
  // Não precisa adicionar token manualmente
};
```

---

## 📝 Checklist de Migração

### Backend

- [ ] Configurar cookie parser
- [ ] Setar cookie com flags corretas
- [ ] Implementar /auth/refresh endpoint
- [ ] Validar token do cookie em middleware
- [ ] Remover cookie no /auth/logout
- [ ] Configurar CORS com credentials

### Frontend

- [ ] Remover `localStorage.setItem('token')`
- [ ] Remover `localStorage.getItem('token')`
- [ ] Atualizar `apiClient` para `withCredentials: true`
- [ ] Usar hooks de auth atualizados
- [ ] Implementar auto-refresh token
- [ ] Testar login/logout
- [ ] Testar requisições autenticadas

---

## 🔧 Configuração do Backend

### Express.js

```typescript
import cookieParser from 'cookie-parser';
import cors from 'cors';

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // IMPORTANTE!
}));

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar credenciais
  const user = await validateCredentials(email, password);
  const token = generateToken(user);
  
  // Setar cookie
  res.cookie('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    path: '/',
  });
  
  res.json({ user });
});

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.cookies['auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Logout
app.post('/auth/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.json({ success: true });
});

// Refresh
app.post('/auth/refresh', authMiddleware, (req, res) => {
  const newToken = generateToken(req.user);
  
  res.cookie('auth-token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  
  res.json({ user: req.user });
});
```

### Next.js API Routes

```typescript
// app/api/auth/login/route.ts
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // Validar credenciais
  const user = await validateCredentials(email, password);
  const token = generateToken(user);
  
  // Setar cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
    path: '/',
  });
  
  return Response.json({ user });
}

// app/api/auth/logout/route.ts
export async function POST() {
  cookies().delete('auth-token');
  return Response.json({ success: true });
}
```

---

## 🧪 Testando a Migração

### 1. Verificar Cookie no DevTools

1. Fazer login
2. Abrir DevTools → Application → Cookies
3. Verificar cookie `auth-token`:
   - ✅ HttpOnly: true
   - ✅ Secure: true (em produção)
   - ✅ SameSite: Strict

### 2. Verificar que JavaScript não acessa

```javascript
// No console do browser
document.cookie
// Não deve mostrar auth-token!
```

### 3. Testar Requisições

```typescript
// Deve funcionar sem adicionar token manualmente
const users = await apiClient.get('/users');
console.log(users);
```

### 4. Testar Logout

```typescript
await authApi.logout();
// Cookie deve ser removido
// Requisições devem falhar com 401
```

---

## 🚨 Troubleshooting

### Cookie não é enviado

**Problema:** Requisições não incluem cookie

**Solução:**
```typescript
// Verificar withCredentials
axios.create({
  withCredentials: true, // IMPORTANTE!
});

// Verificar CORS no backend
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // IMPORTANTE!
});
```

### Cookie não é setado

**Problema:** Login funciona mas cookie não aparece

**Solução:**
1. Verificar flags do cookie (httpOnly, secure, sameSite)
2. Em desenvolvimento, usar `secure: false`
3. Verificar domínio/path do cookie

### 401 Unauthorized

**Problema:** Todas as requisições retornam 401

**Solução:**
1. Verificar se middleware lê cookie corretamente
2. Verificar se token é válido
3. Verificar se cookie não expirou

---

## 📚 Recursos

- [MDN - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP - Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Web Security - httpOnly Cookies](https://web.dev/same-site-same-origin/)
