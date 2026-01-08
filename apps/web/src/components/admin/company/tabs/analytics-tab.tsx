
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Zap, Clock, BarChart3, Award, Loader2, RefreshCw } from "lucide-react";
import { SectionShell } from "../shared/section-shell";
import { companySettingsAPI } from "@/lib/api/company-settings";
import { notificationCenter } from "@/shared/ui/notification-center";
import { cn } from "@morina/ui";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AnalyticsTab() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [benchmarks, setBenchmarks] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [metricsData, approvalBench, completeBench] = await Promise.all([
                companySettingsAPI.getMetrics(),
                companySettingsAPI.getBenchmark('approval_time'),
                companySettingsAPI.getBenchmark('data_completeness')
            ]);

            setMetrics(metricsData);
            setBenchmarks({
                approval_time: approvalBench,
                data_completeness: completeBench
            });
        } catch (error) {
            console.error(error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar analytics." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) {
        return (
            <SectionShell active={true}>
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white/30" />
                    <p className="text-white/50">Carregando analytics...</p>
                </div>
            </SectionShell>
        );
    }

    // Process metrics for charts
    const activeUsersData = metrics
        .filter(m => m.metricType === 'active_users')
        .slice(0, 30)
        .reverse()
        .map(m => ({
            date: new Date(m.periodDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            users: m.value
        }));

    const featureUsageData = metrics
        .filter(m => m.metricType === 'feature_usage')
        .reduce((acc: any, m) => {
            const existing = acc.find((item: any) => item.feature === m.metricKey);
            if (existing) {
                existing.count += m.value;
            } else {
                acc.push({ feature: m.metricKey, count: m.value });
            }
            return acc;
        }, [])
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

    return (
        <SectionShell active={true}>
            <div className="space-y-6 animate-in fade-in duration-300">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-indigo-400" />
                            Analytics & Insights
                        </h3>
                        <p className="text-white/50 text-sm">Métricas de uso e comparação com o mercado</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard
                        icon={Users}
                        title="Usuários Ativos"
                        value={activeUsersData[activeUsersData.length - 1]?.users || 0}
                        trend="+12%"
                        color="indigo"
                    />
                    <KPICard
                        icon={Zap}
                        title="Features Utilizadas"
                        value={featureUsageData.length}
                        trend="+3"
                        color="emerald"
                    />
                    <KPICard
                        icon={Clock}
                        title="Tempo Médio Aprovação"
                        value="2.5h"
                        trend="-15%"
                        color="purple"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Active Users Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Usuários Ativos (Últimos 30 dias)
                        </h4>
                        {activeUsersData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={activeUsersData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 12 }} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-white/30">
                                Sem dados disponíveis
                            </div>
                        )}
                    </div>

                    {/* Feature Usage Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            Features Mais Utilizadas
                        </h4>
                        {featureUsageData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={featureUsageData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 12 }} />
                                    <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 12 }} width={120} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-white/30">
                                Sem dados disponíveis
                            </div>
                        )}
                    </div>
                </div>

                {/* Benchmarking Section */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        Benchmarking vs Mercado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benchmarks.approval_time && (
                            <BenchmarkCard
                                title="Tempo de Aprovação"
                                metric={benchmarks.approval_time}
                                unit="horas"
                                formatter={(val: number) => (val / 3600000).toFixed(1)}
                            />
                        )}
                        {benchmarks.data_completeness && (
                            <BenchmarkCard
                                title="Completude de Dados"
                                metric={benchmarks.data_completeness}
                                unit="%"
                                formatter={(val: number) => val.toFixed(0)}
                            />
                        )}
                    </div>
                </div>

            </div>
        </SectionShell>
    );
}

function KPICard({ icon: Icon, title, value, trend, color }: any) {
    const colorClasses = {
        indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
    };

    return (
        <div className={cn("bg-gradient-to-br border rounded-xl p-4", colorClasses[color as keyof typeof colorClasses])}>
            <div className="flex items-start justify-between mb-2">
                <Icon className="w-8 h-8 text-white/80" />
                <span className="text-xs text-emerald-400 font-medium">{trend}</span>
            </div>
            <h4 className="text-white/60 text-sm mb-1">{title}</h4>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function BenchmarkCard({ title, metric, unit, formatter }: any) {
    if (!metric) return null;

    const companyValue = formatter(metric.companyValue);
    const percentile = metric.percentileRank || 50;

    const getPerformanceColor = (p: number) => {
        if (p >= 75) return 'text-emerald-400';
        if (p >= 50) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getPerformanceLabel = (p: number) => {
        if (p >= 75) return 'Excelente';
        if (p >= 50) return 'Bom';
        return 'Abaixo da Média';
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4">{title}</h4>

            <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white">{companyValue}</span>
                    <span className="text-white/40">{unit}</span>
                </div>
                <p className={cn("text-sm font-medium", getPerformanceColor(percentile))}>
                    {getPerformanceLabel(percentile)} • Percentil {percentile}
                </p>
            </div>

            {/* Benchmark Bars */}
            <div className="space-y-2">
                {metric.benchmarks?.map((bench: any) => (
                    <div key={bench.percentile} className="flex items-center gap-2">
                        <span className="text-xs text-white/40 w-8">P{bench.percentile}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${(bench.value / (metric.benchmarks[metric.benchmarks.length - 1]?.value || 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-white/50 w-16 text-right">{formatter(bench.value)}{unit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
