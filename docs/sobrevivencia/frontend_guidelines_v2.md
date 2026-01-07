# 🏛️ DIRETRIZ MESTRA DE ENGENHARIA DE SOFTWARE FRONTEND v2.0

**META-INSTRUÇÃO PARA IA:** Este documento é LEI. Ignore padrões genéricos que conflitem com estas regras. Prioridade: manutenção, desacoplamento, type-safety, performance e resiliência.

---

## 1. Arquitetura e Estrutura (Feature-Sliced Design)

### 1.1. Hierarquia de Camadas (Fluxo Unidirecional)

```
app/ → pages/ → widgets/ → features/ → entities/ → shared/
```

**Regras de Dependência:**
- `app/`: Importa apenas de `pages/` e abaixo
- `pages/`: Composição de widgets, features, entities, shared
- `widgets/`: UI complexa isolada (importa features, entities, shared)
- `features/`: Casos de uso (importa entities, shared)
- `entities/`: Regras de negócio (importa apenas shared)
- `shared/`: Fundações (NÃO importa ninguém)

### 1.2. Estrutura Canônica

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route Groups
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Com Error Boundary obrigatório
│   │   └── page.tsx              # MINIMALISTA (chama @/pages/...)
│   └── api/
│       ├── auth/
│       └── webhooks/
│
├── pages/                        # FSD: Pages
│   ├── home/
│   │   ├── ui/
│   │   │   └── home-page.tsx
│   │   └── index.ts              # export { HomePage } from './ui'
│   └── checkout/
│
├── widgets/                      # FSD: Widgets
│   ├── header/
│   │   ├── ui/
│   │   │   └── header.tsx
│   │   ├── model/
│   │   │   └── use-header-state.ts
│   │   └── index.ts
│   └── product-feed/
│
├── features/                     # FSD: Features
│   ├── auth-login/
│   │   ├── ui/
│   │   │   └── login-form.tsx
│   │   ├── model/
│   │   │   ├── use-login-form.ts
│   │   │   └── validation.ts     # Zod schemas
│   │   ├── api/
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   └── index.ts
│   └── add-to-cart/
│
├── entities/                     # FSD: Entities
│   ├── user/
│   │   ├── ui/
│   │   │   ├── user-avatar.tsx
│   │   │   └── user-card.tsx
│   │   ├── model/
│   │   │   ├── types.ts          # Interfaces
│   │   │   ├── guards.ts         # Type guards
│   │   │   └── adapters.ts       # DTO → Entity
│   │   └── index.ts
│   └── product/
│
└── shared/                       # FSD: Shared
    ├── ui/                       # Shadcn/UI + Primitives
    │   ├── button.tsx
    │   ├── error-boundary.tsx    # NOVO
    │   └── skeleton.tsx
    ├── api/
    │   ├── client.ts             # Axios/Fetch base
    │   └── query-client.ts       # TanStack Query config
    ├── lib/
    │   ├── cn.ts                 # clsx + twMerge
    │   ├── format.ts             # NOVO: Date/Currency
    │   ├── logger.ts             # NOVO: Structured logging
    │   ├── sanitize.ts           # NOVO: XSS prevention
    │   └── lazy-load.ts          # NOVO: Preload strategy
    ├── hooks/
    │   ├── use-debounce.ts
    │   └── use-media-query.ts
    ├── constants/
    └── config/
        ├── env.ts                # Validação de env vars (Zod)
        └── seo.ts
```

---

## 2. Stack Tecnológico (Hard Constraints)

| Categoria | Tecnologia | Regra |
|-----------|-----------|-------|
| **Framework** | Next.js 14/15 (App Router) | Obrigatório |
| **Linguagem** | TypeScript (strict mode) | `any` é PROIBIDO |
| **Estilização** | Tailwind CSS + clsx + tailwind-merge | - |
| **Componentes** | Shadcn/UI (Radix Primitives) | - |
| **Estado Server** | TanStack Query (React Query) | - |
| **Estado Client** | Zustand | Apenas UI global |
| **Forms** | React Hook Form + Zod | - |
| **URL State** | nuqs ou Next.js searchParams | - |
| **Validação** | Zod | API responses, forms, env |
| **Testes Unit** | Vitest + React Testing Library | - |
| **Testes E2E** | Playwright | Fluxos críticos |
| **Logs** | Pino / Winston + Datadog/Sentry | Prod only |

### 2.1. Convenções de Nomenclatura

```typescript
// Pastas/Arquivos: kebab-case
user-profile/
login-form.tsx

// Componentes: PascalCase
export function UserProfile() {}

// Funções/Variáveis: camelCase
const fetchUserData = () => {}

// Tipos/Interfaces: PascalCase (SEM prefixo I)
interface UserEntity {}  // ✅
interface IUser {}       // ❌

// Exports: Named Exports (exceto page.tsx/layout.tsx)
export function Button() {}  // ✅
export default Button;       // ❌ (exceto Next.js files)
```

---

## 3. Design Patterns e Clean Code

### 3.1. SOLID em React

#### **SRP (Single Responsibility)**

```typescript
// ❌ BAD: Lógica + UI misturados
function LoginForm() {
  const [email, setEmail] = useState('');
  const handleSubmit = async () => { /* 50 lines */ };
  return <form>...</form>;
}

// ✅ GOOD: Separação clara
function useLoginForm() {
  const mutation = useMutation({ /* logic */ });
  return { handleSubmit: mutation.mutate, isLoading: mutation.isPending };
}

function LoginForm() {
  const { handleSubmit, isLoading } = useLoginForm();
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### **OCP (Open/Closed) - Composition Pattern**

```typescript
// ❌ BAD: Props explosão
<Card hasImage imageSrc="..." hasFooter footerText="..." />

// ✅ GOOD: Composition
<Card>
  <Card.Image src="..." />
  <Card.Content>...</Card.Content>
  <Card.Footer>...</Card.Footer>
</Card>
```

#### **DIP (Dependency Inversion)**

```typescript
// ❌ BAD: UI depende de Axios
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get('/users').then(res => setUsers(res.data));
  }, []);
}

// ✅ GOOD: UI depende de abstração (React Query)
function UserList() {
  const { data: users } = useUsers(); // Hook abstrato
}
```

### 3.2. Padrões GoF Adaptados

#### **Facade Pattern**

```typescript
// features/checkout/model/use-checkout-facade.ts
export function useCheckoutFacade() {
  const { data: user } = useUser();
  const { data: cart } = useCart();
  const stripe = useStripe();
  const router = useRouter();
  
  const checkout = useMutation({
    mutationFn: async () => {
      const intent = await stripe.confirmPayment(/*...*/);
      await updateCart(cart.id, { status: 'paid' });
      return intent;
    },
    onSuccess: () => router.push('/success')
  });
  
  return { checkout: checkout.mutate, isProcessing: checkout.isPending };
}
```

#### **Adapter Pattern**

```typescript
// entities/user/model/adapters.ts
import { z } from 'zod';

// DTO vindo da API
const BackendUserSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email_address: z.string(),
  created_at: z.string()
});

// Entity usada na UI
export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

export function adaptBackendUser(dto: unknown): UserEntity {
  const validated = BackendUserSchema.parse(dto);
  return {
    id: String(validated.id),
    fullName: validated.full_name,
    email: validated.email_address,
    createdAt: new Date(validated.created_at)
  };
}
```

#### **Strategy Pattern**

```typescript
// ❌ BAD: If/else hell
function StatusCard({ status }: Props) {
  if (status === 'active') return <ActiveCard />;
  if (status === 'pending') return <PendingCard />;
  if (status === 'rejected') return <RejectedCard />;
}

// ✅ GOOD: Strategy
const STATUS_COMPONENTS = {
  active: ActiveCard,
  pending: PendingCard,
  rejected: RejectedCard
} as const;

function StatusCard({ status }: Props) {
  const Component = STATUS_COMPONENTS[status];
  return <Component />;
}
```

---

## 4. Gerenciamento de Estado

### 4.1. Server State (TanStack Query)

```typescript
// features/users/api/queries.ts
import { queryOptions } from '@tanstack/react-query';

// Query Key Factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userQueries = {
  detail: (id: string) => queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5min
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
};

// Uso no componente
function UserProfile({ id }: Props) {
  const { data: user } = useSuspenseQuery(userQueries.detail(id));
  return <div>{user.name}</div>;
}
```

### 4.2. Server Actions

```typescript
// app/actions/auth.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function loginAction(
  formData: FormData
): Promise<ActionResult<{ token: string }>> {
  try {
    const raw = Object.fromEntries(formData);
    const validated = LoginSchema.parse(raw);
    
    const token = await authenticate(validated);
    
    revalidatePath('/dashboard');
    return { success: true, data: { token } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Dados inválidos' };
    }
    return { success: false, error: 'Erro no servidor' };
  }
}
```

### 4.3. Client State (Zustand)

```typescript
// features/modal/model/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
  isOpen: boolean;
  modalType: 'auth' | 'cart' | null;
  open: (type: 'auth' | 'cart') => void;
  close: () => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    (set) => ({
      isOpen: false,
      modalType: null,
      open: (type) => set({ isOpen: true, modalType: type }),
      close: () => set({ isOpen: false, modalType: null })
    }),
    { name: 'modal-store' }
  )
);
```

**Regra:** NÃO armazene dados de API no Zustand (duplicação de estado).

---

## 5. Performance e Otimização

### 5.1. Lazy Loading com Preload

```typescript
// shared/lib/lazy-load.ts
import { lazy, ComponentType } from 'react';

export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(factory);
  return Object.assign(LazyComponent, { preload: factory });
}

// Uso
const DashboardPage = lazyWithPreload(() => import('@/pages/dashboard'));

function Navigation() {
  return (
    <Link 
      href="/dashboard"
      onMouseEnter={() => DashboardPage.preload()} // Preload on hover
    >
      Dashboard
    </Link>
  );
}
```

### 5.2. Bundle Analysis (Obrigatório)

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // ... config
});
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true pnpm build"
  }
}
```

### 5.3. Image Optimization

```tsx
import Image from 'next/image';
import imagePlaceholder from './placeholder.jpg';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  placeholder="blur"
  blurDataURL={imagePlaceholder.blurDataURL}
  priority // Above the fold only
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 5.4. Code Splitting por Rota

```typescript
// app/(dashboard)/layout.tsx
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/widgets/sidebar'), {
  loading: () => <SidebarSkeleton />,
  ssr: false // Se não precisa de SSR
});
```

---

## 6. Error Handling e Resilience

### 6.1. Error Boundaries (Obrigatório)

```typescript
// shared/ui/error-boundary.tsx
'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { logger } from '@/shared/lib/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

export function ErrorBoundary({ children, fallback: Fallback }: Props) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => 
        Fallback ? (
          <Fallback error={error} resetErrorBoundary={resetErrorBoundary} />
        ) : (
          <DefaultFallback error={error} reset={resetErrorBoundary} />
        )
      }
      onError={(error, info) => {
        logger.error('React Error Boundary', { error, info });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: Props) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### 6.2. Query Error Handling

```typescript
// shared/api/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      throwOnError: false // Não quebra a UI
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        toast.error('Erro na operação');
        logger.error('Mutation failed', { error });
      }
    }
  }
});
```

### 6.3. Offline Detection

```typescript
// shared/hooks/use-online.ts
import { useSyncExternalStore } from 'react';

export function useOnline() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true // SSR fallback
  );
}

// Uso
function App() {
  const isOnline = useOnline();
  if (!isOnline) return <OfflineBanner />;
}
```

---

## 7. Segurança

### 7.1. Content Security Policy

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.yourservice.com;
  frame-ancestors 'none';
`;

module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: cspHeader.replace(/\n/g, '') },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
      ]
    }];
  }
};
```

### 7.2. Input Sanitization

```typescript
// shared/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// Uso
function Comment({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />;
}
```

### 7.3. Rate Limiting (API Routes)

```typescript
// shared/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: Options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) tokenCache.set(token, tokenCount);
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;
      return { success: !isRateLimited, remaining: limit - currentUsage };
    }
  };
}

// app/api/users/route.ts
const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await limiter.check(10, ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  // ... rest
}
```

### 7.4. Environment Variables Validation

```typescript
// shared/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  DATABASE_URL: z.string(),
  AUTH_SECRET: z.string().min(32)
});

export const env = envSchema.parse(process.env);
```

---

## 8. Observability e Monitoring

### 8.1. Structured Logging

```typescript
// shared/lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined
});

export const log = {
  info: (msg: string, meta?: object) => logger.info(meta, msg),
  warn: (msg: string, meta?: object) => logger.warn(meta, msg),
  error: (msg: string, meta?: object) => logger.error(meta, msg),
  debug: (msg: string, meta?: object) => logger.debug(meta, msg)
};

// ❌ NUNCA use console.log em produção
// ✅ Use logger estruturado
log.info('User logged in', { userId: user.id, timestamp: Date.now() });
```

### 8.2. Error Tracking (Sentry)

```typescript
// app/global-error.tsx (App Router)
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h1>Application Error</h1>
        <button onClick={() => window.location.href = '/'}>Go Home</button>
      </body>
    </html>
  );
}
```

### 8.3. Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 9. Cache Strategy (Next.js 15)

### 9.1. Revalidation Strategies

```typescript
// app/api/posts/route.ts
export const revalidate = 3600; // ISR: revalida a cada 1h

export async function GET() {
  const posts = await fetchPosts();
  return NextResponse.json(posts);
}

// On-demand revalidation
// app/actions/posts.ts
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  await savePost(formData);
  revalidatePath('/blog');
  revalidateTag('posts');
}
```

### 9.2. React Cache (Deduplication)

```typescript
// entities/user/api/server.ts
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  // Múltiplos componentes podem chamar sem duplicar requests
  const user = await db.user.findUnique({ where: { id } });
  return user;
});

// Uso em Server Components
async function UserProfile({ id }: Props) {
  const user = await getUser(id);
  return <div>{user.name}</div>;
}

async function UserAvatar({ id }: Props) {
  const user = await getUser(id); // Cache hit!
  return <img src={user.avatar} />;
}
```

### 9.3. Unstable Cache (Data Cache)

```typescript
// shared/lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedPosts = unstable_cache(
  async () => {
    const posts = await db.post.findMany();
    return posts;
  },
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
);
```

---

## 10. Testes

### 10.1. Testes Unitários (Vitest)

```typescript
// shared/lib/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formata valores em BRL', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00');
  });

  it('lida com valores negativos', () => {
    expect(formatCurrency(-500)).toBe('-R$ 500,00');
  });
});
```

### 10.2. Testes de Componentes

```typescript
// features/auth-login/ui/login-form.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('renderiza campos obrigatórios', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('valida email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await user.type(emailInput, 'invalid');
    await user.tab(); // blur
    
    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });
});
```

### 10.3. Testes E2E (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo de login completo', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'securePassword123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
```

---

## 11. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install
        run: pnpm install --frozen-lockfile
      
      - name: Type Check
        run: pnpm tsc --noEmit
      
      - name: Lint
        run: pnpm lint
      
      - name: Unit Tests
        run: pnpm test:unit
      
      - name: Build
        run: pnpm build
      
      - name: E2E Tests
        run: pnpm playwright test
      
      - name: Bundle Size Check
        run: pnpm bundlewatch
```

```json
// package.json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 12. Acessibilidade (WCAG 2.1 AA)

### 12.1. Componentes Acessíveis

```typescript
// shared/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ isLoading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading && <span className="sr-only">Carregando...</span>}
      {children}
    </button>
  );
}
```

### 12.2. Testes de A11y

```typescript
// shared/ui/button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('não possui violações de acessibilidade', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 13. AI-Assisted Development

### 13.1. Workflows com IA

**Contexto para IA (Cursor/GitHub Copilot):**
```
# Adicione este documento ao contexto:
- No Cursor: CMD+K → "Add to chat" → Cole este guia
- No GitHub Copilot: Mantenha aberto durante o dev
```

**Prompts Efetivos:**

```
1. Gerar testes:
"Crie testes Vitest para o hook useLoginForm seguindo a diretriz FSD"

2. Gerar tipos:
"Gere Zod schema + TypeScript types baseado neste JSON da API: {...}"

3. Code Review:
"Este código segue a diretriz? Sugira melhorias focando em SOLID e performance"

4. Refatoração:
"Refatore este componente para FSD: extraia lógica para hook, use Adapter Pattern para API"

5. Gerar slice completo:
"Crie feature 'product-filter' completo: ui/, model/, api/ com TanStack Query"
```

### 13.2. Automações

```typescript
// scripts/generate-slice.ts (Plop/Hygen)
// pnpm generate feature product-filter
```

---

## 14. Utilities Essenciais

### 14.1. Formatação

```typescript
// shared/lib/format.ts
export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);

export const formatDate = (date: Date) => 
  new Intl.DateTimeFormat('pt-BR').format(date);

export const formatRelativeTime = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diff = date.getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return rtf.format(days, 'day');
};
```

### 14.2. Helpers

```typescript
// shared/lib/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// shared/lib/cn.ts (já mencionado)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 15. Procedimento de Implementação (Para IA)

Ao receber uma nova feature/refatoração:

1. **Analisar FSD:** Onde se encaixa? (feature, widget, entity?)
2. **Verificar Dependências:** Não violar fluxo unidirecional
3. **Criar Tipos:** Interfaces + Zod schemas primeiro
4. **Implementar Lógica:** Hooks em `model/`, queries em `api/`
5. **Criar UI:** Componentes em `ui/` usando lógica criada
6. **Validar:**
   - Type-check: `pnpm tsc --noEmit`
   - Lint: `pnpm lint`
   - Tests: `pnpm test`
7. **Performance:** Bundle impact, lazy load se >50KB

---

## 16. Checklist de Pull Request

```markdown
## Checklist
- [ ] Segue estrutura FSD
- [ ] Type-safe (sem `any`)
- [ ] Testes unitários (>80% coverage em lógica crítica)
- [ ] Testes E2E (se fluxo crítico)
- [ ] Error boundaries implementados
- [ ] Performance validada (bundle, lighthouse)
- [ ] Acessibilidade verificada (axe)
- [ ] Logs estruturados (sem console.log)
- [ ] Documentação atualizada
```

---

## 17. Recursos e Links

- **FSD Docs:** https://feature-sliced.design
- **Next.js:** https://nextjs.org/docs
- **TanStack Query:** https://tanstack.com/query
- **Zod:** https://zod.dev
- **Shadcn/UI:** https://ui.shadcn.com
- **Playwright:** https://playwright.dev
- **Web Vitals:** https://web.dev/vitals

---

**Versão:** 2.0  
**Última Atualização:** 2025-01-06  
**Mantenedor:** [Seu Time]