/**
 * Performance Monitoring System
 * 
 * Monitora performance de requisições, detecta slow queries
 * e gera alertas de degradação.
 */

/**
 * Métrica de performance
 */
export interface PerformanceMetric {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
    size?: number;
    cached?: boolean;
}

/**
 * Estatísticas agregadas
 */
export interface PerformanceStats {
    endpoint: string;
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    successRate: number;
}

/**
 * Alerta de performance
 */
export interface PerformanceAlert {
    type: "SLOW_QUERY" | "DEGRADATION" | "HIGH_ERROR_RATE";
    endpoint: string;
    metric: PerformanceMetric;
    threshold: number;
    message: string;
    timestamp: number;
}

/**
 * Monitor de performance
 */
export class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private readonly MAX_METRICS = 1000;
    private readonly SLOW_QUERY_THRESHOLD = 3000; // 3s
    private readonly DEGRADATION_MULTIPLIER = 1.5;
    private alerts: PerformanceAlert[] = [];
    private listeners: Array<(alert: PerformanceAlert) => void> = [];

    /**
     * Rastrear métrica
     */
    track(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // Limitar tamanho do array
        if (this.metrics.length > this.MAX_METRICS) {
            this.metrics = this.metrics.slice(-this.MAX_METRICS);
        }

        // Detectar slow query
        if (metric.duration > this.SLOW_QUERY_THRESHOLD) {
            this.alertSlowQuery(metric);
        }

        // Detectar degradação
        const stats = this.getStats(metric.endpoint);
        if (stats && metric.duration > stats.p95 * this.DEGRADATION_MULTIPLIER) {
            this.alertDegradation(metric, stats.p95);
        }

        // Detectar alta taxa de erro
        if (stats && stats.errorRate > 0.1) {
            // > 10%
            this.alertHighErrorRate(metric, stats.errorRate);
        }
    }

    /**
     * Alerta de slow query
     */
    private alertSlowQuery(metric: PerformanceMetric): void {
        const alert: PerformanceAlert = {
            type: "SLOW_QUERY",
            endpoint: metric.endpoint,
            metric,
            threshold: this.SLOW_QUERY_THRESHOLD,
            message: `Slow query detected: ${metric.endpoint} took ${metric.duration}ms`,
            timestamp: Date.now(),
        };

        this.emitAlert(alert);
    }

    /**
     * Alerta de degradação
     */
    private alertDegradation(metric: PerformanceMetric, p95: number): void {
        const alert: PerformanceAlert = {
            type: "DEGRADATION",
            endpoint: metric.endpoint,
            metric,
            threshold: p95 * this.DEGRADATION_MULTIPLIER,
            message: `Performance degradation: ${metric.endpoint} is ${((metric.duration / p95) * 100).toFixed(0)}% slower than P95`,
            timestamp: Date.now(),
        };

        this.emitAlert(alert);
    }

    /**
     * Alerta de alta taxa de erro
     */
    private alertHighErrorRate(metric: PerformanceMetric, errorRate: number): void {
        const alert: PerformanceAlert = {
            type: "HIGH_ERROR_RATE",
            endpoint: metric.endpoint,
            metric,
            threshold: 0.1,
            message: `High error rate: ${metric.endpoint} has ${(errorRate * 100).toFixed(1)}% errors`,
            timestamp: Date.now(),
        };

        this.emitAlert(alert);
    }

    /**
     * Emitir alerta
     */
    private emitAlert(alert: PerformanceAlert): void {
        this.alerts.push(alert);
        this.listeners.forEach((listener) => listener(alert));

        // Log do alerta
        console.warn(`[Performance Alert] ${alert.type}:`, alert.message);
    }

    /**
     * Adicionar listener de alertas
     */
    onAlert(listener: (alert: PerformanceAlert) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * Obter estatísticas de um endpoint
     */
    getStats(endpoint: string): PerformanceStats | null {
        const endpointMetrics = this.metrics.filter((m) => m.endpoint === endpoint);

        if (endpointMetrics.length === 0) {
            return null;
        }

        const durations = endpointMetrics.map((m) => m.duration).sort((a, b) => a - b);
        const errors = endpointMetrics.filter((m) => m.status >= 400).length;

        return {
            endpoint,
            count: endpointMetrics.length,
            avg: this.average(durations),
            min: Math.min(...durations),
            max: Math.max(...durations),
            p50: this.percentile(durations, 50),
            p95: this.percentile(durations, 95),
            p99: this.percentile(durations, 99),
            errorRate: errors / endpointMetrics.length,
            successRate: 1 - errors / endpointMetrics.length,
        };
    }

    /**
     * Obter todas as estatísticas
     */
    getAllStats(): PerformanceStats[] {
        const endpoints = [...new Set(this.metrics.map((m) => m.endpoint))];
        return endpoints
            .map((endpoint) => this.getStats(endpoint))
            .filter((stats): stats is PerformanceStats => stats !== null);
    }

    /**
     * Calcular média
     */
    private average(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calcular percentil
     */
    private percentile(sortedValues: number[], percentile: number): number {
        if (sortedValues.length === 0) return 0;
        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, index)] ?? 0;
    }

    /**
     * Obter alertas recentes
     */
    getRecentAlerts(limit = 10): PerformanceAlert[] {
        return this.alerts.slice(-limit);
    }

    /**
     * Limpar métricas antigas
     */
    clearOldMetrics(olderThan: number = 3600000): void {
        // Padrão: 1 hora
        const cutoff = Date.now() - olderThan;
        this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
    }

    /**
     * Resetar monitor
     */
    reset(): void {
        this.metrics = [];
        this.alerts = [];
    }
}

/**
 * Instância global do monitor
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook React para performance monitoring
 */
export function usePerformanceMonitor() {
    const [stats, setStats] = React.useState<PerformanceStats[]>([]);
    const [alerts, setAlerts] = React.useState<PerformanceAlert[]>([]);

    React.useEffect(() => {
        // Atualizar stats a cada 5 segundos
        const interval = setInterval(() => {
            setStats(performanceMonitor.getAllStats());
            setAlerts(performanceMonitor.getRecentAlerts());
        }, 5000);

        // Listener de alertas em tempo real
        const unsubscribe = performanceMonitor.onAlert((alert) => {
            setAlerts((prev) => [...prev, alert].slice(-10));
        });

        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, []);

    return { stats, alerts };
}

// Adicionar import do React
import React from "react";
