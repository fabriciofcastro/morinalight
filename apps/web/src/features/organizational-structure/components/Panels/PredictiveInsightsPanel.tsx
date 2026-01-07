"use client";

import { FuturisticLineChart } from "@/components/charts/FuturisticLineChart";
import { Department, Position, Sector } from "@morina/organizational-structure-domain";
import { GlassCard } from "@morina/ui";
import { addMonths, format, subMonths } from "date-fns";
import { AlertTriangle, Lightbulb, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface PredictiveInsightsPanelProps {
    departments: Department[];
    sectors: Sector[];
    positions: Position[];
}

export function PredictiveInsightsPanel({ departments, sectors, positions }: PredictiveInsightsPanelProps) {
    // --- 1. Growth Projection (Linear Regression) ---
    const projectionData = useMemo(() => {
        const allDates = [
            ...departments.filter(d => d.createdAt).map(d => new Date(d.createdAt!)),
            ...sectors.filter(s => s.createdAt).map(s => new Date(s.createdAt!)),
            ...positions.filter(p => p.createdAt).map(p => new Date(p.createdAt!))
        ].filter(d => !isNaN(d.getTime())).sort((a, b) => a.getTime() - b.getTime());

        if (allDates.length < 2) return [];

        // Group by month (last 12 months)
        const today = new Date();
        const twelveMonthsAgo = subMonths(today, 12);
        const monthlyCounts: Record<string, number> = {};

        // Initialize last 12 months with 0
        for (let i = 0; i <= 12; i++) {
            const d = addMonths(twelveMonthsAgo, i);
            const key = format(d, 'yyyy-MM');
            monthlyCounts[key] = 0;
        }

        let cumulative = 0;
        // Count total history up to 12 months ago
        cumulative = allDates.filter(d => d < twelveMonthsAgo).length;

        // Populate counts
        const sortedKeys = Object.keys(monthlyCounts).sort();
        const historyData: { x: number; y: number; label: string }[] = [];

        sortedKeys.forEach((key, index) => {
            const [year, month] = key.split('-');
            const monthStart = new Date(parseInt(year!), parseInt(month!) - 1, 1);
            const nextMonthStart = addMonths(monthStart, 1);

            const inMonth = allDates.filter(d => d >= monthStart && d < nextMonthStart).length;
            cumulative += inMonth;

            historyData.push({ x: index, y: cumulative, label: format(monthStart, 'MMM/yy') });
        });

        // Calculate Linear Regression (Least Squares)
        const n = historyData.length;
        const sumX = historyData.reduce((acc, p) => acc + p.x, 0);
        const sumY = historyData.reduce((acc, p) => acc + p.y, 0);
        const sumXY = historyData.reduce((acc, p) => acc + p.x * p.y, 0);
        const sumXX = historyData.reduce((acc, p) => acc + p.x * p.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Project next 3 months
        const projection: { x: string; y: number; type: 'history' | 'projection' }[] = [];

        // Add history
        historyData.forEach(p => {
            projection.push({ x: p.label, y: p.y, type: 'history' });
        });

        // Add 6 months future
        const lastIndex = historyData[historyData.length - 1]!.x;
        const lastDate = new Date(); // approx

        for (let i = 1; i <= 6; i++) {
            const nextX = lastIndex + i;
            const predictedY = Math.round(slope * nextX + intercept);
            const nextDate = addMonths(lastDate, i);
            projection.push({ x: format(nextDate, 'MMM/yy'), y: predictedY, type: 'projection' });
        }

        return projection;
    }, [departments, sectors, positions]);

    const projectedGrowthRate = useMemo(() => {
        if (projectionData.length < 2) return 0;
        const current = projectionData.findLast(p => p.type === 'history')?.y || 0;
        const future = projectionData[projectionData.length - 1]!.y;
        if (current === 0) return 0;
        return Math.round(((future - current) / current) * 100);
    }, [projectionData]);

    // --- 2. Anomaly Detection ---
    const anomalies = useMemo(() => {
        const issues: { title: string; desc: string; severity: 'high' | 'medium' }[] = [];

        // TODO: Uncomment when baseSalary is added to Position schema
        /*
        // Salary Outliers (Z-Score > 2.5)
        const salaries = positions.map(p => p.baseSalary || 0).filter(s => s > 0);
        if (salaries.length > 5) {
            const mean = salaries.reduce((a, b) => a + b, 0) / salaries.length;
            const variance = salaries.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / salaries.length;
            const stdDev = Math.sqrt(variance);

            const outliers = positions.filter(p => {
                const s = p.baseSalary || 0;
                return s > 0 && Math.abs(s - mean) > 2.5 * stdDev;
            });

            if (outliers.length > 0) {
                issues.push({
                    title: "Outliers Salariais Detectados",
                    desc: `${outliers.length} cargos possuem salários > 2.5 desvios padrão da média.`,
                    severity: 'high'
                });
            }
        }
        */

        // Rapid Growth Departments (>10 positions added recently) - mock logic for "recently" data availability
        // Assuming we check createdAt
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deptGrowth: Record<string, number> = {};
        positions.forEach(p => {
            // Find dept
            // Need full tree traversal or assume we can find it. 
            // Simplified: just check if position is new. If we had dept linking it would be better.
            if (p.createdAt && new Date(p.createdAt) > thirtyDaysAgo) {
                const sector = sectors.find(s => s.id === p.sectorId);
                if (sector?.departmentId) {
                    deptGrowth[sector.departmentId] = (deptGrowth[sector.departmentId] || 0) + 1;
                }
            }
        });

        Object.entries(deptGrowth).forEach(([deptId, count]) => {
            if (count > 5) {
                const dept = departments.find(d => d.id === deptId);
                if (dept) {
                    issues.push({
                        title: "Crescimento Acelerado",
                        desc: `Departamento ${dept.code} adicionou ${count} cargos nos últimos 30 dias.`,
                        severity: 'medium'
                    });
                }
            }
        });

        // High Vacancy Departments
        const deptVacancy: Record<string, { total: number, inactive: number }> = {};
        positions.forEach(p => {
            const sector = sectors.find(s => s.id === p.sectorId);
            if (sector?.departmentId) {
                if (!deptVacancy[sector.departmentId]) {
                    deptVacancy[sector.departmentId] = { total: 0, inactive: 0 };
                }
                deptVacancy[sector.departmentId]!.total++;
                if (!p.active) deptVacancy[sector.departmentId]!.inactive++;
            }
        });

        Object.entries(deptVacancy).forEach(([deptId, stats]) => {
            if (stats.total > 5 && (stats.inactive / stats.total) > 0.4) {
                const dept = departments.find(d => d.id === deptId);
                if (dept) {
                    issues.push({
                        title: "Alta Taxa de Vacância",
                        desc: `Departamento ${dept.code} tem ${Math.round((stats.inactive / stats.total) * 100)}% de cargos inativos.`,
                        severity: 'medium'
                    });
                }
            }
        });

        return issues;
    }, [departments, sectors, positions]);


    return (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-700">
            {/* Growth Projection Chart */}
            <GlassCard className="p-6 relative overflow-hidden">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            Projeção de Crescimento
                        </h3>
                        <p className="text-sm text-white/50">Estimativa baseada em regressão linear (6 meses)</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">+{projectedGrowthRate}%</div>
                        <div className="text-xs text-white/50 font-mono">tendência semestral</div>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <FuturisticLineChart
                        data={projectionData}
                        xKey="x"
                        yKey="y"
                        color="hsl(var(--primary))"
                    />
                </div>
            </GlassCard>

            {/* Anomaly Detection */}
            <GlassCard className="p-6 relative overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        Detecção de Anomalias
                    </h3>
                    <p className="text-sm text-white/50">Alertas automáticos de estrutura</p>
                </div>

                <div className="space-y-3 max-h-[250px] overflow-auto pr-2 custom-scrollbar">
                    {anomalies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[150px] text-white/30 border border-dashed border-white/10 rounded-lg">
                            <CheckCircleIcon className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-sm">Nenhuma anomalia detectada via IA</span>
                        </div>
                    ) : (
                        anomalies.map((issue, idx) => (
                            <div key={idx} className={`p-3 rounded border ${issue.severity === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                                <div className="flex items-start gap-3">
                                    {issue.severity === 'high' ?
                                        <TrendingDown className="h-4 w-4 text-red-400 mt-0.5" /> :
                                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                                    }
                                    <div>
                                        <h4 className={`text-sm font-medium ${issue.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                                            {issue.title}
                                        </h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                                            {issue.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
