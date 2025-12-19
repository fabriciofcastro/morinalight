/**
 * Dashboard de Analytics de Erros
 * 
 * Visualização avançada de erros e analytics.
 */

"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@morina/ui";
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api/base";
import { Button } from "@morina/ui";

interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByCode: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByHour: Array<{ hour: number; count: number }>;
  topErrors: Array<{
    id: string;
    code: string;
    message: string;
    count: number;
    severity: string;
  }>;
  errorRate: number;
}

export function ErrorAnalyticsClient() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(3600000); // 1 hora

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<ErrorStats>(
        `/errors/analytics/stats?timeWindow=${timeWindow}`,
      );
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
    const interval = setInterval(loadStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, [timeWindow]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Analytics</h1>
          <p className="text-white/60">Análise avançada de erros do sistema</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white"
          >
            <option value={3600000}>Última hora</option>
            <option value={86400000}>Últimas 24 horas</option>
            <option value={604800000}>Última semana</option>
          </select>
          <Button onClick={loadStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total de Erros</p>
              <p className="text-2xl font-bold text-white">{stats.totalErrors}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Taxa de Erro</p>
              <p className="text-2xl font-bold text-white">
                {stats.errorRate.toFixed(1)}/h
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Erros Críticos</p>
              <p className="text-2xl font-bold text-white">
                {stats.errorsBySeverity.critical || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Categorias</p>
              <p className="text-2xl font-bold text-white">
                {Object.keys(stats.errorsByCategory).length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </GlassCard>
      </div>

      {/* Gráfico de Erros por Hora */}
      <GlassCard className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Erros por Hora
        </h2>
        <div className="flex h-32 items-end justify-between gap-1">
          {stats.errorsByHour.map((hour) => (
            <div
              key={hour.hour}
              className="flex-1 rounded-t border border-white/10 bg-red-500/20"
              style={{
                height: `${Math.max((hour.count / Math.max(...stats.errorsByHour.map((h) => h.count))) * 100, 5)}%`,
              }}
              title={`${hour.hour}h: ${hour.count} erros`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/60">
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h}>{h}h</span>
          ))}
        </div>
      </GlassCard>

      {/* Top Erros */}
      <GlassCard className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Top Erros</h2>
        <div className="space-y-3">
          {stats.topErrors.map((error) => (
            <div
              key={error.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{error.code}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      error.severity === "critical"
                        ? "bg-red-500/20 text-red-300"
                        : error.severity === "high"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {error.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/70">{error.message}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{error.count}</p>
                <p className="text-xs text-white/60">ocorrências</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Erros por Categoria */}
      <GlassCard className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Erros por Categoria
        </h2>
        <div className="space-y-2">
          {Object.entries(stats.errorsByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-white/80">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          (count / stats.totalErrors) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-white">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </GlassCard>
    </div>
  );
}

