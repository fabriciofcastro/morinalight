import type { ILogger } from '@/application/ports';

/**
 * Console Logger
 * 
 * Implementação simples de logger usando console.
 * Para produção, considerar Winston, Pino ou integração com Sentry.
 */

export class ConsoleLogger implements ILogger {
  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, context || '');
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...context,
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  profile(label: string): () => void {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      this.info(`[PROFILE] ${label} took ${duration}ms`);
    };
  }
}
