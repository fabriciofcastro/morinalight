// ============================================
// 1. CI/CD - .github/workflows/ci.yml
// ============================================
/*
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type Check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Unit Tests
        run: pnpm test:coverage
      
      - name: Build
        run: pnpm build
        env:
          SKIP_ENV_VALIDATION: true
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: E2E Tests
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000
      
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
      
      - name: Bundle Size Check
        run: pnpm analyze
        env:
          ANALYZE: true

  deploy:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        run: echo "Deploy to Vercel/AWS/etc"
        # Adicione seu processo de deploy aqui
*/

// ============================================
// 2. SENTRY CONFIG - sentry.client.config.ts
// ============================================
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filtra erros conhecidos que não precisam tracking
    const error = hint.originalException;
    
    if (error instanceof Error) {
      // Ignora erros de extensões do browser
      if (error.message.includes('chrome-extension://')) {
        return null;
      }
      
      // Ignora erros de network do usuário
      if (error.message.includes('Failed to fetch')) {
        return null;
      }
    }
    
    return event;
  },
});

// ============================================
// 3. SENTRY CONFIG - sentry.server.config.ts
// ============================================
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  debug: false,
  
  environment: process.env.NODE_ENV,
});

// ============================================
// 4. SENTRY CONFIG - sentry.edge.config.ts
// ============================================
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});

// ============================================
// 5. ERROR BOUNDARY - src/shared/ui/error-boundary.tsx
// ============================================
'use client';

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-900">Algo deu errado</h2>
        <p className="mt-2 text-sm text-red-700">
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={resetErrorBoundary}
          variant="outline"
        >
          Tentar novamente
        </Button>
        
        <Button 
          onClick={() => window.location.href = '/'}
          variant="default"
        >
          Ir para home
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm font-medium text-red-800">
            Stack trace (dev only)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-red-100 p-4 text-xs text-red-900">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={fallback || DefaultFallback}
      onError={(error, info) => {
        // Log no console em dev
        if (process.env.NODE_ENV === 'development') {
          console.error('Error Boundary caught:', error, info);
        }
        
        // Envia para Sentry em produção
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: info.componentStack,
            },
          },
        });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// ============================================
// 6. GLOBAL ERROR - src/app/global-error.tsx
// ============================================
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Erro Crítico</h1>
          <p className="mt-4 text-gray-600">
            Estamos trabalhando para resolver isso.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </body>
    </html>
  );
}

// ============================================
// 7. LAYOUT COM ERROR BOUNDARY - src/app/layout.tsx
// ============================================
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

// ============================================
// 8. LOGGER - src/shared/lib/logger.ts
// ============================================
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss',
        },
      }
    : undefined,
  
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  
  base: {
    env: process.env.NODE_ENV,
  },
});

// Helpers
export const log = {
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(meta, message);
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(meta, message);
  },
  
  error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
    logger.error({ error, ...meta }, message);
  },
  
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(meta, message);
  },
};

// ============================================
// 9. PLAYWRIGHT CONFIG - playwright.config.ts
// ============================================
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

// ============================================
// 10. E2E TEST EXAMPLE - e2e/auth.spec.ts
// ============================================
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Auth Flow', () => {
  test('login completo + acessibilidade', async ({ page }) => {
    await page.goto('/login');
    
    // Testa acessibilidade
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Preenche formulário
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Aguarda redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Verifica se carregou
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();
  });
  
  test('valida erros de formulário', async ({ page }) => {
    await page.goto('/login');
    
    // Submit vazio
    await page.click('button[type="submit"]');
    
    // Verifica mensagens de erro
    await expect(page.getByText(/email obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha obrigatória/i)).toBeVisible();
  });
});

// ============================================
// 11. BUNDLE ANALYZER CONFIG - next.config.js
// ============================================
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ... suas configs existentes
  
  // Source maps para Sentry (apenas prod)
  productionBrowserSourceMaps: true,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

// ============================================
// 12. HUSKY PRE-COMMIT - .husky/pre-commit
// ============================================
/*
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
*/

// ============================================
// 13. ENV VALIDATION - src/shared/config/env.ts
// ============================================
import { z } from 'zod';

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // URLs
  NEXT_PUBLIC_API_URL: z.string().url(),
  
  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);

// ============================================
// 14. RATE LIMITER - src/shared/lib/rate-limit.ts
// ============================================
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (limit: number, token: string) => {
      const tokenCount = tokenCache.get(token) || [0];
      
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      
      tokenCount[0] += 1;
      
      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;
      
      return {
        success: !isRateLimited,
        limit,
        remaining: Math.max(0, limit - currentUsage),
        reset: Date.now() + options.interval,
      };
    },
  };
}

// Uso em API Route
// const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
// const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
// const { success, remaining } = await limiter.check(10, ip);

// ============================================
// 15. SANITIZER - src/shared/lib/sanitize.ts
// ============================================
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Bloqueia protocolos perigosos
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}