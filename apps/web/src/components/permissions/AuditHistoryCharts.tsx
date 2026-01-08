"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/base/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/shared/ui/base/badge";

interface AuditSnapshot {
    id: string;
    timestamp: string;
    conformityScore: number;
    totalAnomalies: number;
    criticalIssues: number;
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
}

interface HistoricalData {
    snapshots: AuditSnapshot[];
    trends: {
        conformityScoreTrend: "improving" | "stable" | "declining";
        anomaliesTrend: "decreasing" | "stable" | "increasing";
    };
}

export function AuditHistoryCharts() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<HistoricalData | null>(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchHistoricalData();
    }, [days]);

    const fetchHistoricalData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/permissions/audit/history?days=${days}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Erro ao buscar dados históricos:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Preparar dados para gráficos
    const chartData = data.snapshots.map((snapshot) => ({
        date: new Date(snapshot.timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        }),
        score: snapshot.conformityScore,
        anomalias: snapshot.totalAnomalies,
        críticas: snapshot.criticalIssues,
        altas: snapshot.highSeverityIssues,
        médias: snapshot.mediumSeverityIssues,
        baixas: snapshot.lowSeverityIssues,
    }));

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "improving":
            case "decreasing":
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case "declining":
            case "increasing":
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case "improving":
            case "decreasing":
                return "text-green-600 bg-green-50";
            case "declining":
            case "increasing":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <div className="space-y-6">
            {/* Período de seleção */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Período:</span>
                {[7, 30, 90].map((d) => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`px-3 py-1 text-sm rounded-md ${days === d
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        {d} dias
                    </button>
                ))}
            </div>

            {/* Tendências */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tendência de Conformidade</CardTitle>
                        {getTrendIcon(data.trends.conformityScoreTrend)}
                    </CardHeader>
                    <CardContent>
                        <Badge className={getTrendColor(data.trends.conformityScoreTrend)}>
                            {data.trends.conformityScoreTrend === "improving"
                                ? "Melhorando"
                                : data.trends.conformityScoreTrend === "declining"
                                    ? "Piorando"
                                    : "Estável"}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tendência de Anomalias</CardTitle>
                        {getTrendIcon(data.trends.anomaliesTrend)}
                    </CardHeader>
                    <CardContent>
                        <Badge className={getTrendColor(data.trends.anomaliesTrend)}>
                            {data.trends.anomaliesTrend === "decreasing"
                                ? "Diminuindo"
                                : data.trends.anomaliesTrend === "increasing"
                                    ? "Aumentando"
                                    : "Estável"}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Score de Conformidade */}
            <Card>
                <CardHeader>
                    <CardTitle>Score de Conformidade ao Longo do Tempo</CardTitle>
                    <CardDescription>Evolução do score de conformidade nos últimos {days} dias</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Score (%)"
                                dot={{ fill: "#3b82f6" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Gráfico de Anomalias por Severidade */}
            <Card>
                <CardHeader>
                    <CardTitle>Anomalias por Severidade</CardTitle>
                    <CardDescription>Distribuição de anomalias por nível de severidade</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="críticas" fill="#ef4444" name="Críticas" stackId="a" />
                            <Bar dataKey="altas" fill="#f97316" name="Altas" stackId="a" />
                            <Bar dataKey="médias" fill="#eab308" name="Médias" stackId="a" />
                            <Bar dataKey="baixas" fill="#94a3b8" name="Baixas" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Gráfico de Tendência de Anomalias */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendência Total de Anomalias</CardTitle>
                    <CardDescription>Evolução do número total de anomalias</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="anomalias"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.3}
                                name="Total de Anomalias"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
