/**
 * Lazy Loading Utilities
 * 
 * Utilitários para lazy loading de componentes e rotas
 */

import { Loader2 } from "lucide-react";
import { ComponentType, lazy, LazyExoticComponent } from "react";

/**
 * Componente de loading padrão
 */
export function DefaultLoadingFallback() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

/**
 * Componente de loading para seções
 */
export function SectionLoadingFallback() {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
    );
}

/**
 * Skeleton loader genérico
 */
export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 animate-pulse rounded bg-muted"
                    style={{ width: `${100 - i * 10}%` }}
                />
            ))}
        </div>
    );
}

/**
 * Lazy load com retry automático
 */
export function lazyWithRetry<T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>,
    retries = 3,
): LazyExoticComponent<T> {
    return lazy(() => {
        return new Promise<{ default: T }>((resolve, reject) => {
            const attemptImport = (retriesLeft: number) => {
                componentImport()
                    .then(resolve)
                    .catch((error) => {
                        if (retriesLeft === 0) {
                            reject(error);
                            return;
                        }

                        console.warn(
                            `Failed to load component, retrying... (${retriesLeft} attempts left)`,
                        );

                        // Retry após delay exponencial
                        setTimeout(() => {
                            attemptImport(retriesLeft - 1);
                        }, 1000 * (retries - retriesLeft + 1));
                    });
            };

            attemptImport(retries);
        });
    });
}

/**
 * Lazy load com prefetch
 */
export function lazyWithPrefetch<T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>,
) {
    const LazyComponent = lazy(componentImport);

    // Adicionar método de prefetch
    (LazyComponent as any).prefetch = componentImport;

    return LazyComponent;
}

/**
 * Prefetch de componente
 */
export function prefetchComponent(
    component: LazyExoticComponent<any> & { prefetch?: () => void },
) {
    if (component.prefetch) {
        component.prefetch();
    }
}

/**
 * Lazy load condicional (apenas se condição for verdadeira)
 */
export function lazyIf<T extends ComponentType<any>>(
    condition: boolean,
    componentImport: () => Promise<{ default: T }>,
    fallback: ComponentType<any>,
): ComponentType<any> {
    if (condition) {
        return lazy(componentImport);
    }
    return fallback;
}

/**
 * Preload de múltiplos componentes
 */
export async function preloadComponents(
    components: Array<() => Promise<any>>,
): Promise<void> {
    await Promise.all(components.map((comp) => comp()));
}

/**
 * Hook para lazy load on hover
 */
export function useLazyLoadOnHover(
    componentImport: () => Promise<any>,
): [boolean, () => void] {
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = React.useCallback(() => {
        setIsHovered(true);
        componentImport(); // Prefetch
    }, [componentImport]);

    return [isHovered, handleMouseEnter];
}

/**
 * Hook para lazy load on viewport
 */
export function useLazyLoadOnViewport(
    componentImport: () => Promise<any>,
    ref: React.RefObject<HTMLElement>,
) {
    React.useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    componentImport();
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [componentImport, ref]);
}

import React from "react";
