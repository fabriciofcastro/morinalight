"use client";

import { useCallback, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook para rastreamento de performance de componentes
 */
export function usePerformanceMonitoring(componentName: string) {
    useEffect(() => {
        const transaction = Sentry.startSpan({
            name: `Mount: ${componentName}`,
            op: "ui.mount",
        }, () => { });

        return () => {
            transaction?.end();
        };
    }, [componentName]);
}

/**
 * Hook para rastreamento de erros manuais
 */
export function useErrorTracking() {
    const trackError = useCallback((error: unknown, context?: Record<string, any>) => {
        Sentry.captureException(error, {
            extra: context,
        });
    }, []);

    return { trackError };
}

/**
 * Hook para adicionar navegação como breadcrumbs automáticamente
 */
export function useNavigationBreadcrumbs() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        Sentry.addBreadcrumb({
            category: "navigation",
            message: `Route changed to ${pathname}`,
            data: {
                search: searchParams?.toString(),
            },
            level: "info",
        });
    }, [pathname, searchParams]);
}

/**
 * Hook para rastreamento de métricas de negócio
 */
export function useBusinessMetrics() {
    const trackEvent = useCallback((eventName: string, data?: Record<string, any>) => {
        // Enviar como breadcrumb para contexto
        Sentry.addBreadcrumb({
            category: "business",
            message: eventName,
            data,
            level: "info",
        });

        // Opcional: Enviar como mensagem se for crítico
        // Sentry.captureMessage(eventName, { level: "info", extra: data });
    }, []);

    return { trackEvent };
}
