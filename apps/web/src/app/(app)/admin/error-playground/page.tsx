/**
 * Error Playground
 * 
 * Página para testar e debugar o sistema de error handling
 */

"use client";

import React from "react";
import { GlassCard, Button } from "@morina/ui";
import {
    AlertTriangle,
    Activity,
    Zap,
    RefreshCw,
    TrendingUp,
    Shield,
    Code,
    Terminal,
} from "lucide-react";
import {
    parseError,
    errorTracking,
    circuitBreakerManager,
    performanceMonitor,
    errorAggregator,
    recoveryManager,
    usePerformanceMonitor,
} from "@/lib/errors";
import { apiClient } from "@/lib/api/base";

export default function ErrorPlayground() {
    const [lastError, setLastError] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const { stats, alerts } = usePerformanceMonitor();

    // Trigger diferentes tipos de erros
    const triggerError = async (type: string) => {
        setIsLoading(true);
        try {
            switch (type) {
                case "network":
                    // Simular erro de rede
                    await fetch("http://localhost:99999/invalid");
                    break;

                case "401":
                    // Simular 401
                    await apiClient.get("/api/test/401");
                    break;

                case "500":
                    // Simular 500
                    await apiClient.get("/api/test/500");
                    break;

                case "timeout":
                    // Simular timeout
                    await new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("TIMEOUT")), 100),
                    );
                    break;

                case "validation":
                    // Simular erro de validação
                    throw new Error("VALIDATION_ERROR");

                case "render":
                    // Simular erro de renderização
                    throw new Error("Component render error");

                default:
                    throw new Error("Unknown error type");
            }
        } catch (error) {
            const appError = parseError(error);
            setLastError(appError);
            console.error("Triggered error:", appError);
        } finally {
            setIsLoading(false);
        }
    };

    // Obter status dos circuit breakers
    const circuitBreakers = circuitBreakerManager.list();

    // Obter grupos de erros
    const errorGroups = errorAggregator.getTopGroups(5);

    // Obter stats de aggregation
    const aggStats = errorAggregator.getStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Terminal className="h-8 w-8 text-primary" />
                            Error Handling Playground
                        </h1>
                        <p className="mt-2 text-white/60">
                            Teste e monitore o sistema avançado de tratamento de erros
                        </p>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {/* Trigger Errors */}
                <GlassCard className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Trigger Errors
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <Button
                            onClick={() => triggerError("network")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            Network Error
                        </Button>
                        <Button
                            onClick={() => triggerError("401")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            401 Unauthorized
                        </Button>
                        <Button
                            onClick={() => triggerError("500")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            500 Server Error
                        </Button>
                        <Button
                            onClick={() => triggerError("timeout")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            Timeout
                        </Button>
                        <Button
                            onClick={() => triggerError("validation")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            Validation Error
                        </Button>
                        <Button
                            onClick={() => triggerError("render")}
                            disabled={isLoading}
                            variant="danger"
                        >
                            Render Error
                        </Button>
                    </div>

                    {lastError && (
                        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                            <h3 className="font-semibold text-red-300">Last Error:</h3>
                            <pre className="mt-2 overflow-auto text-xs text-red-200/80">
                                {JSON.stringify(lastError, null, 2)}
                            </pre>
                        </div>
                    )}
                </GlassCard>

                {/* Circuit Breakers */}
                <GlassCard className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        Circuit Breakers
                    </h2>
                    <div className="space-y-3">
                        {circuitBreakers.length === 0 ? (
                            <p className="text-white/60">No circuit breakers active</p>
                        ) : (
                            circuitBreakers.map((cb) => (
                                <div
                                    key={cb.name}
                                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                                >
                                    <div>
                                        <p className="font-semibold text-white">{cb.name}</p>
                                        <p className="text-xs text-white/60">
                                            {cb.metrics.totalRequests} requests • {cb.metrics.failureCount} failures
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${cb.state === "CLOSED"
                                            ? "bg-green-500/20 text-green-300"
                                            : cb.state === "OPEN"
                                                ? "bg-red-500/20 text-red-300"
                                                : "bg-yellow-500/20 text-yellow-300"
                                            }`}
                                    >
                                        {cb.state}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Performance Metrics */}
                <GlassCard className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-400" />
                        Performance Metrics
                    </h2>
                    <div className="space-y-3">
                        {stats.length === 0 ? (
                            <p className="text-white/60">No metrics yet</p>
                        ) : (
                            stats.slice(0, 5).map((stat) => (
                                <div
                                    key={stat.endpoint}
                                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-white">{stat.endpoint}</p>
                                        <span className="text-xs text-white/60">
                                            {stat.count} requests
                                        </span>
                                    </div>
                                    <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                                        <div>
                                            <p className="text-white/60">Avg</p>
                                            <p className="font-semibold text-white">
                                                {stat.avg.toFixed(0)}ms
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/60">P95</p>
                                            <p className="font-semibold text-white">
                                                {stat.p95.toFixed(0)}ms
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/60">P99</p>
                                            <p className="font-semibold text-white">
                                                {stat.p99.toFixed(0)}ms
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-white/60">Error Rate</p>
                                            <p className="font-semibold text-white">
                                                {(stat.errorRate * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Error Groups */}
                <GlassCard className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        Error Groups (Top 5)
                    </h2>
                    <div className="space-y-3">
                        {errorGroups.length === 0 ? (
                            <p className="text-white/60">No errors grouped yet</p>
                        ) : (
                            errorGroups.map((group) => (
                                <div
                                    key={group.fingerprint}
                                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{group.code}</p>
                                            <p className="mt-1 text-sm text-white/70">
                                                {group.message}
                                            </p>
                                            <p className="mt-2 text-xs text-white/60">
                                                First seen:{" "}
                                                {new Date(group.firstSeen).toLocaleString("pt-BR")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">
                                                {group.count}
                                            </p>
                                            <p className="text-xs text-white/60">occurrences</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {aggStats.totalGroups > 0 && (
                        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                            <h3 className="mb-2 font-semibold text-white">Statistics</h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-white/60">Total Groups</p>
                                    <p className="font-semibold text-white">
                                        {aggStats.totalGroups}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/60">Total Errors</p>
                                    <p className="font-semibold text-white">
                                        {aggStats.totalErrors}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/60">Top Error</p>
                                    <p className="font-semibold text-white">
                                        {aggStats.topErrorCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Performance Alerts */}
                {alerts.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            Recent Alerts
                        </h2>
                        <div className="space-y-2">
                            {alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-orange-300">
                                                {alert.type}
                                            </p>
                                            <p className="mt-1 text-sm text-orange-200/80">
                                                {alert.message}
                                            </p>
                                        </div>
                                        <span className="text-xs text-orange-200/60">
                                            {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* Recovery Strategies */}
                <GlassCard className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                        <Code className="h-5 w-5 text-cyan-400" />
                        Recovery Strategies
                    </h2>
                    <div className="space-y-2">
                        {recoveryManager.getStrategies().map((strategy) => (
                            <div
                                key={strategy.name}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                                <span className="text-white">{strategy.name}</span>
                                <span className="text-xs text-white/60">
                                    Priority: {strategy.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
