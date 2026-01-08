/**
 * Web Vitals Tracking
 * 
 * Sistema para rastrear Core Web Vitals e métricas de performance
 */

import React from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

export interface WebVitalsMetric {
    id: string;
    name: string;
    value: number;
    rating: "good" | "needs-improvement" | "poor";
    delta: number;
    navigationType: string;
}

/**
 * Thresholds para classificação de métricas
 */
const THRESHOLDS = {
    // Largest Contentful Paint (LCP)
    LCP: { good: 2500, poor: 4000 },
    // Cumulative Layout Shift (CLS)
    CLS: { good: 0.1, poor: 0.25 },
    // First Contentful Paint (FCP)
    FCP: { good: 1800, poor: 3000 },
    // Interaction to Next Paint (INP)
    INP: { good: 200, poor: 500 },
    // Time to First Byte (TTFB)
    TTFB: { good: 800, poor: 1800 },
};

/**
 * Classifica a métrica como good, needs-improvement ou poor
 */
function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
}

/**
 * Envia métrica para analytics
 */
function sendToAnalytics(metric: WebVitalsMetric) {
    // Enviar para seu serviço de analytics
    if (process.env.NODE_ENV === "development") {
        console.log("[Web Vitals]", metric);
    }

    // Exemplo: Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", metric.name, {
            value: Math.round(metric.value),
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
            metric_rating: metric.rating,
        });
    }

    // Exemplo: Custom API
    if (typeof window !== "undefined") {
        fetch("/api/analytics/web-vitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metric),
        }).catch((error) => {
            console.error("Failed to send web vitals:", error);
        });
    }
}

/**
 * Transforma métrica do web-vitals para nosso formato
 */
function transformMetric(metric: Metric): WebVitalsMetric {
    return {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        delta: metric.delta,
        navigationType: metric.navigationType,
    };
}

/**
 * Inicializa tracking de Web Vitals
 */
export function initWebVitals() {
    if (typeof window === "undefined") return;

    // Core Web Vitals
    onLCP((metric) => sendToAnalytics(transformMetric(metric)));
    onCLS((metric) => sendToAnalytics(transformMetric(metric)));

    // Other important metrics
    onFCP((metric) => sendToAnalytics(transformMetric(metric)));
    onINP((metric) => sendToAnalytics(transformMetric(metric)));
    onTTFB((metric) => sendToAnalytics(transformMetric(metric)));
}

/**
 * Hook para usar Web Vitals em componentes
 */
export function useWebVitals() {
    const [metrics, setMetrics] = React.useState<WebVitalsMetric[]>([]);

    React.useEffect(() => {
        const handleMetric = (metric: Metric) => {
            const transformed = transformMetric(metric);
            setMetrics((prev) => [...prev, transformed]);
            sendToAnalytics(transformed);
        };

        onLCP(handleMetric);
        onCLS(handleMetric);
        onFCP(handleMetric);
        onINP(handleMetric);
        onTTFB(handleMetric);
    }, []);

    return metrics;
}

/**
 * Componente para exibir Web Vitals (dev only)
 */
export function WebVitalsDisplay() {
    const metrics = useWebVitals();

    if (process.env.NODE_ENV !== "development") return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 rounded-lg border bg-background p-4 shadow-lg">
            <h3 className="mb-2 font-semibold">Web Vitals</h3>
            <div className="space-y-1 text-sm">
                {metrics.map((metric) => (
                    <div
                        key={metric.id}
                        className={`flex justify-between gap-4 ${metric.rating === "good"
                            ? "text-green-600"
                            : metric.rating === "needs-improvement"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        <span className="font-mono">{metric.name}:</span>
                        <span className="font-mono">{Math.round(metric.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


