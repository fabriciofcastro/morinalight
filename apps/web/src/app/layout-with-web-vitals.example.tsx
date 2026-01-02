/**
 * Root Layout - With Web Vitals Tracking
 * 
 * Exemplo de como ativar Web Vitals no layout principal
 */

"use client";

import { useEffect } from "react";
import { QueryProvider } from "@/lib/query/provider";
import { initWebVitals } from "@/lib/observability";
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ativar Web Vitals tracking
    useEffect(() => {
        initWebVitals();
    }, []);

    return (
        <html lang="pt-BR">
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}

/**
 * IMPLEMENTADO ✅
 * 
 * Web Vitals agora está ativo e rastreando:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - INP (Interaction to Next Paint)
 * - TTFB (Time to First Byte)
 * 
 * Métricas são enviadas para /api/analytics/web-vitals
 */
