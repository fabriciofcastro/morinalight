# Guia de Segurança

## 🔒 Visão Geral

O projeto implementa múltiplas camadas de segurança para proteger contra ataques comuns:

- ✅ **CSRF Protection** - Tokens para prevenir Cross-Site Request Forgery
- ✅ **Rate Limiting** - Proteção contra abuso de APIs
- ✅ **Security Headers** - CSP, XSS Protection, Clickjacking Prevention
- ✅ **Input Sanitization** - Prevenção de XSS
- ✅ **httpOnly Cookies** - Tokens seguros (não acessíveis via JavaScript)
- ✅ **Constant-Time Comparison** - Prevenção de timing attacks

---

## 🛡️ CSRF Protection

### Como Funciona

1. Cliente solicita token CSRF: `GET /api/auth/csrf`
2. Servidor gera token e seta cookie httpOnly
3. Cliente inclui token em requisições que modificam dados
4. Servidor valida token antes de processar

### Uso Automático

O sistema já está integrado no `apiClient`:

```typescript
// Automático! Não precisa fazer nada
await apiClient.post('/users', userData);
// Token CSRF é adicionado automaticamente
```

### Uso Manual

```typescript
import { useCSRFToken } from "@/lib/security";

function MyForm() {
  const csrfToken = useCSRFToken();

  const handleSubmit = async () => {
    await fetch('/api/data', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify(data),
    });
  };
}
```

### Proteger API Routes

```typescript
import { withCSRFProtection } from "@/lib/security";

async function handler(req, res) {
  // Sua lógica aqui
}

export default withCSRFProtection(handler);
```

---

## ⏱️ Rate Limiting

### Limiters Pré-configurados

```typescript
import { RateLimiters } from "@/lib/security";

// Login: 5 tentativas por 15 minutos
export default RateLimiters.login(handler);

// API Geral: 100 requisições por minuto
export default RateLimiters.api(handler);

// Criação: 10 por minuto
export default RateLimiters.create(handler);

// Upload: 5 por minuto
export default RateLimiters.upload(handler);

// Busca: 30 por minuto
export default RateLimiters.search(handler);
```

### Rate Limit Customizado

```typescript
import { rateLimit } from "@/lib/security";

const customLimiter = rateLimit({
  maxRequests: 50,
  windowMs: 60 * 1000, // 1 minuto
  message: "Limite excedido. Aguarde.",
  keyGenerator: (req) => req.headers['x-user-id'], // Por usuário
});

export default customLimiter(handler);
```

### Client-Side Rate Limiting

```typescript
import { useRateLimit } from "@/lib/security";

function LoginForm() {
  const { canAttempt, getRetryAfter } = useRateLimit(
    'login',
    5,      // max 5 tentativas
    15 * 60 * 1000  // em 15 minutos
  );

  const handleSubmit = async () => {
    if (!canAttempt()) {
      const retryAfter = getRetryAfter();
      toast.error(`Aguarde ${Math.ceil(retryAfter / 1000)}s`);
      return;
    }

    await login();
  };
}
```

---

## 🔐 Security Headers

### Headers Implementados

```typescript
// Content Security Policy
"Content-Security-Policy": "default-src 'self'; ..."

// Prevent Clickjacking
"X-Frame-Options": "DENY"

// Prevent MIME Sniffing
"X-Content-Type-Options": "nosniff"

// XSS Protection
"X-XSS-Protection": "1; mode=block"

// Referrer Policy
"Referrer-Policy": "strict-origin-when-cross-origin"

// HTTPS Only
"Strict-Transport-Security": "max-age=31536000"

// Cross-Origin Policies
"Cross-Origin-Embedder-Policy": "require-corp"
"Cross-Origin-Opener-Policy": "same-origin"
```

### Customizar CSP

Edite `/src/middleware.ts`:

```typescript
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://trusted-cdn.com;
  // ... adicione suas fontes confiáveis
`;
```

---

## 🧹 Input Sanitization

### Sanitizar Strings

```typescript
import { sanitizeInput } from "@/lib/security";

const userInput = "<script>alert('xss')</script>";
const safe = sanitizeInput(userInput);
// "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

### Validar Email

```typescript
import { isValidEmail } from "@/lib/security";

if (!isValidEmail(email)) {
  throw new Error("Email inválido");
}
```

### Validar Senha Forte

```typescript
import { isStrongPassword } from "@/lib/security";

const { valid, errors } = isStrongPassword(password);

if (!valid) {
  console.log(errors);
  // ["Senha deve ter no mínimo 8 caracteres", ...]
}
```

### Hash de Senha (Client-Side)

```typescript
import { hashPassword } from "@/lib/security";

const hashed = await hashPassword(password);
// SHA-256 hash
```

---

## 🍪 httpOnly Cookies

### Por que usar?

- ✅ Não acessível via JavaScript (previne XSS)
- ✅ Enviado automaticamente em requisições
- ✅ Pode ter flags `Secure` e `SameSite`

### Setar Cookie

```typescript
// Em API route
response.cookies.set("auth-token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: "/",
});
```

### Ler Cookie (Server-Side)

```typescript
const token = request.cookies.get("auth-token");
```

---

## 🔍 Security Utilities

### Sanitizar Objetos

```typescript
import { sanitizeObject } from "@/lib/security";

const user = {
  id: "123",
  email: "user@example.com",
  password: "secret123",
  apiKey: "key-123",
};

const safe = sanitizeObject(user);
// { id: "123", email: "...", password: "***REDACTED***", apiKey: "***REDACTED***" }
```

### Gerar ID Seguro

```typescript
import { generateSecureId } from "@/lib/security";

const id = generateSecureId(32);
// "a1b2c3d4e5f6..."
```

### Verificar Contexto Seguro

```typescript
import { isSecureContext } from "@/lib/security";

if (!isSecureContext()) {
  console.warn("Não está em HTTPS!");
}
```

### Comparação Constant-Time

```typescript
import { constantTimeCompare } from "@/lib/security";

// Previne timing attacks
if (constantTimeCompare(token, sessionToken)) {
  // Tokens são iguais
}
```

---

## 🚨 Best Practices

### 1. Nunca armazene tokens em localStorage

❌ **Ruim:**
```typescript
localStorage.setItem('token', token);
```

✅ **Bom:**
```typescript
// Use httpOnly cookies (setados pelo servidor)
```

### 2. Sempre valide input do usuário

❌ **Ruim:**
```typescript
const html = `<div>${userInput}</div>`;
```

✅ **Bom:**
```typescript
const html = `<div>${sanitizeInput(userInput)}</div>`;
```

### 3. Use HTTPS em produção

```typescript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains'
    }]
  }];
}
```

### 4. Implemente rate limiting em endpoints sensíveis

```typescript
// /api/auth/login/route.ts
import { RateLimiters } from "@/lib/security";

export async function POST(req) {
  await RateLimiters.login(req, res);
  // ... lógica de login
}
```

### 5. Valide permissões no servidor

```typescript
// Nunca confie apenas em validações client-side
async function deleteUser(userId) {
  // ✅ Validar permissões no servidor
  if (!hasPermission(currentUser, 'users:delete')) {
    throw new Error('Unauthorized');
  }
  
  await db.user.delete(userId);
}
```

---

## 📊 Security Checklist

- [x] CSRF Protection implementado
- [x] Rate Limiting configurado
- [x] Security Headers (CSP, XSS, etc)
- [x] Input Sanitization
- [x] httpOnly Cookies
- [x] Constant-Time Comparison
- [ ] Tokens em httpOnly cookies (migração pendente)
- [ ] Audit de dependências (npm audit)
- [ ] Penetration testing
- [ ] Security review

---

## 🔗 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
