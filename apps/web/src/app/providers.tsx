'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';

// Infrastructure (Client safe)
import { InMemoryEventBus } from '@/infrastructure/events';
import { ConsoleLogger } from '@/infrastructure/logger';

// Application (Only imports that don't leak server-side dependencies)

/**
 * Dependency Injection Container
 */
class DIContainer {
  private services = new Map<string, unknown>();

  register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found in DI container: ${key}`);
    }
    return service as T;
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
  }
}

/**
 * Inicializa o DI Container com todas as dependências
 */
function initializeDIContainer(): DIContainer {
  if (typeof window === 'undefined') {
    const { getContainer } = require('@/infrastructure/di/container');
    return getContainer();
  }

  // No cliente, retornamos um container mínimo ou mock
  const container = new DIContainer();
  const eventBus = new InMemoryEventBus();
  const logger = new ConsoleLogger();
  container.register('EventBus', eventBus);
  container.register('Logger', logger);
  return container;
}

const DIContext = createContext<DIContainer | null>(null);

export function useInjection<T>(key: string): T {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useInjection must be used within DIProvider');
  }
  return container.resolve<T>(key);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Use a ref or state to ensure DI container is only initialized once
  const [container] = useState(() => initializeDIContainer());

  return (
    <DIContext.Provider value={container}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </DIContext.Provider>
  );
}

// Add state import
import { useState } from 'react';
