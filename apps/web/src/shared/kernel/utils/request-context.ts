// RequestContext.ts
let storage: any;

// Apenas tenta importar node:async_hooks no servidor usando um require opaco para o bundler
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line no-eval
    const asyncHooks = eval('require')('node:async_hooks');
    storage = new asyncHooks.AsyncLocalStorage();
  } catch (e) {
    // Fallback se não encontrar
  }
}

/**
 * RequestContext
 * 
 * Mantém IDs de rastreabilidade (Correlation e Causation) durante o fluxo de uma requisição.
 * Seguro para uso em Server e Client components.
 */
export interface RequestContextData {
  correlationId: string;
  causationId?: string;
  userId?: string;
}

export class RequestContext {
  static run<T>(data: RequestContextData, fn: () => Promise<T>): Promise<T> {
    if (storage) {
      return storage.run(data, fn);
    }
    return fn();
  }

  static get(): RequestContextData | undefined {
    return storage?.getStore();
  }

  static getCorrelationId(): string | undefined {
    return this.get()?.correlationId;
  }

  static getCausationId(): string | undefined {
    return this.get()?.causationId;
  }
}
