/**
 * Error Prediction & Health Monitoring
 * 
 * Sistema de IA para prever erros e monitorar saúde do sistema
 */

import type { AppError } from "./types";
import { performanceMonitor } from "./performance-monitor";
import { errorAggregator } from "./error-aggregation";
import { circuitBreakerManager } from "./circuit-breaker";

/**
 * Nível de saúde do sistema
 */
export enum HealthLevel {
    EXCELLENT = "EXCELLENT",
    GOOD = "GOOD",
    DEGRADED = "DEGRADED",
    CRITICAL = "CRITICAL",
}

/**
 * Métrica de saúde
 */
export interface HealthMetric {
    name: string;
    value: number;
    threshold: number;
    status: "healthy" | "warning" | "critical";
    message: string;
}

/**
 * Predição de erro
 */
export interface ErrorPrediction {
    endpoint: string;
    probability: number; // 0-1
    reason: string;
    suggestedAction: string;
    timestamp: number;
}

/**
 * Sistema de predição de erros
 */
export class ErrorPredictionSystem {
    private predictions: ErrorPrediction[] = [];
    private readonly PREDICTION_THRESHOLD = 0.7;

    /**
     * Analisar padrões e prever possíveis erros
     */
    analyzePatternsAndPredict(): ErrorPrediction[] {
        this.predictions = [];

        // Analisar performance
        const perfStats = performanceMonitor.getAllStats();
        for (const stat of perfStats) {
            // Predição baseada em degradação de performance
            if (stat.p95 > 2000 && stat.errorRate < 0.1) {
                this.predictions.push({
                    endpoint: stat.endpoint,
                    probability: 0.75,
                    reason: "Performance degradando rapidamente. P95 acima de 2s.",
                    suggestedAction: "Investigar queries lentas ou adicionar cache",
                    timestamp: Date.now(),
                });
            }

            // Predição baseada em tendência de erros
            if (stat.errorRate > 0.05 && stat.errorRate < 0.15) {
                this.predictions.push({
                    endpoint: stat.endpoint,
                    probability: 0.65,
                    reason: `Taxa de erro em ${(stat.errorRate * 100).toFixed(1)}% e crescendo`,
                    suggestedAction: "Monitorar de perto. Pode precisar de circuit breaker",
                    timestamp: Date.now(),
                });
            }
        }

        // Analisar circuit breakers
        const circuits = circuitBreakerManager.list();
        for (const circuit of circuits) {
            const failureRate =
                circuit.metrics.failureCount / circuit.metrics.totalRequests;

            if (circuit.state === "HALF_OPEN" && failureRate > 0.3) {
                this.predictions.push({
                    endpoint: circuit.name,
                    probability: 0.85,
                    reason: "Circuit breaker em HALF_OPEN com alta taxa de falha",
                    suggestedAction: "Provável que volte para OPEN. Verificar serviço",
                    timestamp: Date.now(),
                });
            }
        }

        // Analisar padrões de erros
        const errorGroups = errorAggregator.getTopGroups(10);
        for (const group of errorGroups) {
            const recentErrors = group.errors.filter(
                (e) => Date.now() - new Date((e as any).timestamp || 0).getTime() < 300000, // Últimos 5 min
            );

            if (recentErrors.length > 5) {
                this.predictions.push({
                    endpoint: Array.from(group.affectedEndpoints).join(", "),
                    probability: 0.8,
                    reason: `${recentErrors.length} erros similares nos últimos 5 minutos`,
                    suggestedAction: "Possível problema sistêmico. Investigar urgente",
                    timestamp: Date.now(),
                });
            }
        }

        return this.predictions.filter(
            (p) => p.probability >= this.PREDICTION_THRESHOLD,
        );
    }

    /**
     * Obter predições ativas
     */
    getPredictions(): ErrorPrediction[] {
        return this.predictions;
    }

    /**
     * Limpar predições antigas
     */
    clearOldPredictions(olderThan: number = 600000): void {
        // 10 minutos
        const cutoff = Date.now() - olderThan;
        this.predictions = this.predictions.filter((p) => p.timestamp > cutoff);
    }
}

/**
 * Monitor de saúde do sistema
 */
export class HealthMonitor {
    /**
     * Verificar saúde geral do sistema
     */
    checkHealth(): {
        level: HealthLevel;
        score: number;
        metrics: HealthMetric[];
        recommendations: string[];
    } {
        const metrics: HealthMetric[] = [];
        const recommendations: string[] = [];

        // Métrica 1: Taxa de erro global
        const perfStats = performanceMonitor.getAllStats();
        const avgErrorRate =
            perfStats.reduce((sum, s) => sum + s.errorRate, 0) / perfStats.length ||
            0;

        metrics.push({
            name: "Error Rate",
            value: avgErrorRate * 100,
            threshold: 5,
            status: avgErrorRate > 0.1 ? "critical" : avgErrorRate > 0.05 ? "warning" : "healthy",
            message: `Taxa de erro global: ${(avgErrorRate * 100).toFixed(2)}%`,
        });

        if (avgErrorRate > 0.05) {
            recommendations.push("Taxa de erro elevada. Investigar erros mais frequentes.");
        }

        // Métrica 2: Performance (P95)
        const avgP95 =
            perfStats.reduce((sum, s) => sum + s.p95, 0) / perfStats.length || 0;

        metrics.push({
            name: "P95 Latency",
            value: avgP95,
            threshold: 1000,
            status: avgP95 > 3000 ? "critical" : avgP95 > 1000 ? "warning" : "healthy",
            message: `Latência P95: ${avgP95.toFixed(0)}ms`,
        });

        if (avgP95 > 1000) {
            recommendations.push("Latência alta. Considerar otimizações ou cache.");
        }

        // Métrica 3: Circuit Breakers
        const circuits = circuitBreakerManager.list();
        const openCircuits = circuits.filter((c) => c.state === "OPEN").length;

        metrics.push({
            name: "Circuit Breakers",
            value: openCircuits,
            threshold: 0,
            status: openCircuits > 2 ? "critical" : openCircuits > 0 ? "warning" : "healthy",
            message: `${openCircuits} circuit breakers abertos`,
        });

        if (openCircuits > 0) {
            recommendations.push(`${openCircuits} serviços indisponíveis. Verificar urgente.`);
        }

        // Métrica 4: Grupos de erro
        const errorGroups = errorAggregator.getAllGroups();
        const activeGroups = errorGroups.filter(
            (g) => Date.now() - g.lastSeen < 300000,
        ).length; // Últimos 5 min

        metrics.push({
            name: "Active Error Groups",
            value: activeGroups,
            threshold: 5,
            status: activeGroups > 10 ? "critical" : activeGroups > 5 ? "warning" : "healthy",
            message: `${activeGroups} grupos de erro ativos`,
        });

        if (activeGroups > 5) {
            recommendations.push("Múltiplos tipos de erro ocorrendo. Revisar logs.");
        }

        // Calcular score de saúde (0-100)
        const healthyCount = metrics.filter((m) => m.status === "healthy").length;
        const warningCount = metrics.filter((m) => m.status === "warning").length;
        const criticalCount = metrics.filter((m) => m.status === "critical").length;

        const score =
            (healthyCount * 100 + warningCount * 50 + criticalCount * 0) /
            metrics.length;

        // Determinar nível de saúde
        let level: HealthLevel;
        if (score >= 90) level = HealthLevel.EXCELLENT;
        else if (score >= 70) level = HealthLevel.GOOD;
        else if (score >= 40) level = HealthLevel.DEGRADED;
        else level = HealthLevel.CRITICAL;

        return { level, score, metrics, recommendations };
    }

    /**
     * Verificar saúde de um endpoint específico
     */
    checkEndpointHealth(endpoint: string): {
        healthy: boolean;
        issues: string[];
        metrics: any;
    } {
        const issues: string[] = [];
        const stats = performanceMonitor.getStats(endpoint);

        if (!stats) {
            return { healthy: true, issues: [], metrics: null };
        }

        // Verificar latência
        if (stats.p95 > 2000) {
            issues.push(`Latência P95 muito alta: ${stats.p95.toFixed(0)}ms`);
        }

        // Verificar taxa de erro
        if (stats.errorRate > 0.1) {
            issues.push(`Taxa de erro alta: ${(stats.errorRate * 100).toFixed(1)}%`);
        }

        // Verificar circuit breaker
        const circuit = circuitBreakerManager.get(`GET:${endpoint}`);
        if (circuit && circuit.getState() === "OPEN") {
            issues.push("Circuit breaker aberto");
        }

        return {
            healthy: issues.length === 0,
            issues,
            metrics: stats,
        };
    }
}

/**
 * Instâncias globais
 */
export const errorPrediction = new ErrorPredictionSystem();
export const healthMonitor = new HealthMonitor();

/**
 * Hook React para predições
 */
export function useErrorPrediction() {
    const [predictions, setPredictions] = React.useState<ErrorPrediction[]>([]);

    React.useEffect(() => {
        // Atualizar predições a cada 30 segundos
        const interval = setInterval(() => {
            const newPredictions = errorPrediction.analyzePatternsAndPredict();
            setPredictions(newPredictions);
        }, 30000);

        // Primeira execução
        setPredictions(errorPrediction.analyzePatternsAndPredict());

        return () => clearInterval(interval);
    }, []);

    return { predictions };
}

/**
 * Hook React para health monitoring
 */
export function useHealthMonitor() {
    const [health, setHealth] = React.useState(healthMonitor.checkHealth());

    React.useEffect(() => {
        // Atualizar saúde a cada 10 segundos
        const interval = setInterval(() => {
            setHealth(healthMonitor.checkHealth());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return { health };
}

import React from "react";
