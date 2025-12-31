/**
 * Utilitários para code splitting e lazy loading de rotas
 */

import dynamic from "next/dynamic";
import { ComponentType } from "react";

/**
 * Cria um componente lazy com loading state
 */
export function createLazyPage<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  },
) {
  return dynamic(importFunc, {
    loading: options?.loading
      ? () => {
          const LoadingComponent = options.loading!;
          return <LoadingComponent />;
        }
      : undefined,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Lazy load de componentes pesados (não críticos para primeira renderização)
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  },
) {
  return dynamic(importFunc, {
    loading: options?.loading
      ? () => {
          const LoadingComponent = options.loading!;
          return <LoadingComponent />;
        }
      : undefined,
    ssr: options?.ssr ?? false, // Componentes não críticos geralmente não precisam SSR
  });
}

/**
 * Preload de rotas (para melhorar performance de navegação)
 */
export function preloadRoute(route: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route;
    document.head.appendChild(link);
  }
}

/**
 * Preload de múltiplas rotas
 */
export function preloadRoutes(routes: string[]) {
  routes.forEach((route) => preloadRoute(route));
}


