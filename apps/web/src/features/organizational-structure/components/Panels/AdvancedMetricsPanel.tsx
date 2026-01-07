"use client";

import { useMemo } from "react";
import { Department, Sector, Position } from "@morina/organizational-structure-domain";
import { GlassCard } from "@morina/ui";
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, CheckCircle2, Layers } from "lucide-react";

interface AdvancedMetricsPanelProps {
    departments: Department[];
    sectors: Sector[];
    positions: Position[];
}

export function AdvancedMetricsPanel({ departments, sectors, positions }: AdvancedMetricsPanelProps) {
    // --- Advanced KPIs ---

    // 1. Vacancy Rate
    const vacancyRate = useMemo(() => {
        const inactivePositions = positions.filter(p => !p.active).length;
        const total = positions.length;
        return total === 0 ? 0 : Math.round((inactivePositions / total) * 100);
    }, [positions]);

    // 2. Cost per Department
    // TODO: Uncomment when baseSalary is added to Position schema
    const totalSalaryCost = useMemo(() => {
        // return positions.reduce((sum, p) => sum + (p.baseSalary || 0), 0);
        return 0; // Placeholder
    }, [positions]);

    const avgCostPerDept = useMemo(() => {
        return departments.length === 0 ? 0 : Math.round(totalSalaryCost / departments.length);
    }, [totalSalaryCost, departments]);

    // 3. Span of Control (avg positions per sector)
    const spanOfControl = useMemo(() => {
        return sectors.length === 0 ? 0 : (positions.length / sectors.length).toFixed(1);
    }, [positions, sectors]);

    // 4. Organizational Depth (max hierarchy levels)
    const orgDepth = useMemo(() => {
        // Simplified: Department -> Sector -> Position = 3 levels
        return 3;
    }, []);

    // 5. Compliance Score (% of active entities)
    const complianceScore = useMemo(() => {
        const totalEntities = departments.length + sectors.length + positions.length;
        const activeEntities = departments.filter(d => d.active).length +
            sectors.filter(s => s.active).length +
            positions.filter(p => p.active).length;
        return totalEntities === 0 ? 0 : Math.round((activeEntities / totalEntities) * 100);
    }, [departments, sectors, positions]);

    // 6. Growth Velocity (entities created in last 30 days)
    const recentGrowth = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentEntities = [
            ...departments.filter(d => d.createdAt && new Date(d.createdAt) > thirtyDaysAgo),
            ...sectors.filter(s => s.createdAt && new Date(s.createdAt) > thirtyDaysAgo),
            ...positions.filter(p => p.createdAt && new Date(p.createdAt) > thirtyDaysAgo)
        ];

        return recentEntities.length;
    }, [departments, sectors, positions]);

    // 7. Salary Outliers (positions beyond 2 std deviations)
    // TODO: Uncomment when baseSalary is added to Position schema
    const salaryOutliers = useMemo(() => {
        return 0; // Placeholder
        /*
        const salaries = positions.map(p => p.baseSalary || 0).filter(s => s > 0);
        if (salaries.length === 0) return 0;

        const mean = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const variance = salaries.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / salaries.length;
        const stdDev = Math.sqrt(variance);

        const outliers = salaries.filter(s => Math.abs(s - mean) > 2 * stdDev);
        return outliers.length;
        */
    }, [positions]);

    const metrics = [
        {
            label: "Taxa de Vacância",
            value: `${vacancyRate}%`,
            subVal: "cargos inativos",
            icon: AlertTriangle,
            color: vacancyRate > 20 ? "text-red-400" : "text-green-400",
            bg: vacancyRate > 20 ? "bg-red-500/10" : "bg-green-500/10",
            border: vacancyRate > 20 ? "border-red-500/20" : "border-green-500/20",
            trend: vacancyRate > 20 ? "down" : "up"
        },
        {
            label: "Custo Médio/Depto",
            value: `R$ ${(avgCostPerDept / 1000).toFixed(0)}k`,
            subVal: `total: R$ ${(totalSalaryCost / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            trend: "neutral"
        },
        {
            label: "Span of Control",
            value: spanOfControl,
            subVal: "cargos/setor",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            trend: "neutral"
        },
        {
            label: "Profundidade Org.",
            value: orgDepth,
            subVal: "níveis hierárquicos",
            icon: Layers,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            trend: "neutral"
        },
        {
            label: "Score de Conformidade",
            value: `${complianceScore}%`,
            subVal: "entidades ativas",
            icon: CheckCircle2,
            color: complianceScore >= 90 ? "text-green-400" : "text-amber-400",
            bg: complianceScore >= 90 ? "bg-green-500/10" : "bg-amber-500/10",
            border: complianceScore >= 90 ? "border-green-500/20" : "border-amber-500/20",
            trend: complianceScore >= 90 ? "up" : "neutral"
        },
        {
            label: "Crescimento (30d)",
            value: recentGrowth,
            subVal: "novas entidades",
            icon: TrendingUp,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            trend: recentGrowth > 5 ? "up" : "neutral"
        },
        {
            label: "Outliers Salariais",
            value: salaryOutliers,
            subVal: "além de 2σ",
            icon: AlertTriangle,
            color: salaryOutliers > 0 ? "text-amber-400" : "text-green-400",
            bg: salaryOutliers > 0 ? "bg-amber-500/10" : "bg-green-500/10",
            border: salaryOutliers > 0 ? "border-amber-500/20" : "border-green-500/20",
            trend: salaryOutliers > 0 ? "down" : "up"
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Métricas Avançadas</h2>
                    <p className="text-sm text-white/50 mt-1">KPIs estratégicos e indicadores de performance</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                {metrics.map((metric) => (
                    <GlassCard key={metric.label} className={`border p-4 ${metric.border} relative overflow-hidden`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">{metric.label}</p>
                                <div className="text-2xl font-bold text-white shadow-glow">{metric.value}</div>
                                <div className="mt-1 text-[9px] font-mono text-white/40">{metric.subVal}</div>
                            </div>
                            <div className={`rounded-lg p-2 ${metric.bg}`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                        </div>
                        {/* Trend Indicator */}
                        {metric.trend !== "neutral" && (
                            <div className="absolute bottom-2 right-2">
                                {metric.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-green-400/50" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-400/50" />
                                )}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
