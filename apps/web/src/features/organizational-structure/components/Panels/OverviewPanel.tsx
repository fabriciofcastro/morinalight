"use client";

import { useMemo } from "react";
import { Department, Sector, Position } from "@morina/organizational-structure-domain";
import { FuturisticPieChart } from "@/components/charts/FuturisticPieChart";
import { FuturisticLineChart } from "@/components/charts/FuturisticLineChart";
import { FuturisticRadarChart } from "@/components/charts/FuturisticRadarChart";
import { FuturisticBarChart } from "@/components/charts/FuturisticBarChart";
import { Building2, Users, Briefcase, TrendingUp, Download, Calendar } from "lucide-react";
import { GlassCard } from "@morina/ui";
import { FuturisticScatterChart } from "@/components/charts/FuturisticScatterChart";
import { parseDateRange, filterByDateRange, generateTimeBuckets, formatBucketLabel, getTimeBucketGranularity } from "@/lib/utils/date-range-filter";

interface OverviewPanelProps {
    departments: Department[];
    sectors: Sector[];
    positions: Position[];
    membersCount?: number;
    dateRange: string;
}

export function OverviewPanel({ departments, sectors, positions, membersCount = 0, dateRange }: OverviewPanelProps) {
    // --- Date Range Filtering ---
    const dateFilter = useMemo(() => parseDateRange(dateRange as any), [dateRange]);

    const filteredDepartments = useMemo(() =>
        filterByDateRange(departments, dateFilter),
        [departments, dateFilter]
    );

    const filteredSectors = useMemo(() =>
        filterByDateRange(sectors, dateFilter),
        [sectors, dateFilter]
    );

    const filteredPositions = useMemo(() =>
        filterByDateRange(positions, dateFilter),
        [positions, dateFilter]
    );

    // --- Derived Metrics (using filtered data) ---
    const activeDepartments = filteredDepartments.filter((d) => d.active).length;
    const activeSectors = filteredSectors.filter((s) => s.active).length;
    const activePositions = filteredPositions.filter((p) => p.active).length;

    const stats = [
        {
            label: "Total Departamentos",
            value: filteredDepartments.length,
            subVal: `${activeDepartments} ativos`,
            icon: Building2,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Total Setores",
            value: filteredSectors.length,
            subVal: `${activeSectors} ativos`,
            icon: TrendingUp, // generic structure icon
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            label: "Total Cargos",
            value: filteredPositions.length,
            subVal: `${activePositions} ativos`,
            icon: Briefcase,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            label: "Membros Alocados",
            value: membersCount, // passed from parent which fetches members
            subVal: "em estrutura",
            icon: Users,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
    ];

    // --- Charts Data Preparation ---

    // 1. Distribution of Sectors per Department (Bar Chart)
    const sectorsPerDeptData = useMemo(() => {
        return filteredDepartments.map(d => {
            const count = filteredSectors.filter(s => s.departmentId === d.id).length;
            return {
                name: d.code || d.name.substring(0, 10), // axis label
                value: count,
                fullName: d.name
            };
        }).sort((a, b) => b.value - a.value).slice(0, 8); // Top 8
    }, [filteredDepartments, filteredSectors]);

    // 2. Positions Active vs Inactive (Pie Chart)
    const positionsStatusData = useMemo(() => {
        return [
            { id: "Active", label: "Ativos", value: activePositions, color: "hsl(var(--primary))" },
            { id: "Inactive", label: "Inativos", value: filteredPositions.length - activePositions, color: "hsl(var(--muted-foreground))" }
        ];
    }, [filteredPositions, activePositions]);

    // 3. Real Growth Data (Line Chart) with dynamic buckets based on date range
    const growthData = useMemo(() => {
        const allEntities = [
            ...departments.map(d => d.createdAt),
            ...sectors.map(s => s.createdAt),
            ...positions.map(p => p.createdAt)
        ].filter(Boolean).map(d => new Date(d as string | Date));

        const buckets = generateTimeBuckets(dateFilter);
        const granularity = getTimeBucketGranularity(dateFilter);

        return buckets.map(bucketDate => {
            const label = formatBucketLabel(bucketDate, granularity);
            // Cumulative count up to this bucket (includes everything before)
            const count = allEntities.filter(date => date <= bucketDate).length;
            return { x: label, y: count };
        });
    }, [departments, sectors, positions, dateFilter]);

    // 4. Real Health/Activity Metrics (Radar)
    const healthData = useMemo(() => {
        const calcHealth = (total: number, active: number) => total === 0 ? 0 : Math.round((active / total) * 100);

        return [
            { subject: "Departamentos", A: calcHealth(filteredDepartments.length, activeDepartments), fullMark: 100 },
            { subject: "Setores", A: calcHealth(filteredSectors.length, activeSectors), fullMark: 100 },
            { subject: "Cargos", A: calcHealth(filteredPositions.length, activePositions), fullMark: 100 },
            { subject: "Global", A: calcHealth(filteredDepartments.length + filteredSectors.length + filteredPositions.length, activeDepartments + activeSectors + activePositions), fullMark: 100 },
            { subject: "Conformidade", A: 100, fullMark: 100 }, // Placeholder for now
        ];
    }, [filteredDepartments, activeDepartments, filteredSectors, activeSectors, filteredPositions, activePositions]);

    // 5. Salary vs Seniority (Scatter Chart)
    const scatterData = useMemo(() => {
        const seniorityMap: Record<string, number> = {
            "JUNIOR": 1, "PLENO": 2, "SENIOR": 3, "ESPECIALISTA": 4,
            "COORDENADOR": 5, "GERENTE": 6, "DIRETOR": 7
        };

        // Group by Department for coloring
        const groups = new Map<string, { x: number, y: number, z: number, category: string }[]>();

        filteredPositions.forEach(p => {
            // Find dept
            const sector = filteredSectors.find(s => s.id === p.sectorId);
            const dept = filteredDepartments.find(d => d.id === sector?.departmentId);
            const deptName = dept?.code || "N/A";

            if (!groups.has(deptName)) groups.set(deptName, []);

            groups.get(deptName)?.push({
                x: seniorityMap[p.seniority] || 0,
                y: p.baseSalary || 0,
                z: 100, // uniform size
                category: p.name
            });
        });

        // Convert to series (limit to top 5 departments to avoid clutter)
        const topDepts = Array.from(groups.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5);

        const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

        return topDepts.map((entry, idx) => ({
            name: entry[0],
            data: entry[1],
            color: colors[idx % colors.length]
        }));
    }, [filteredDepartments, filteredSectors, filteredPositions]);

    const handleExportStats = () => {
        const data = {
            stats,
            sectorsPerDept: sectorsPerDeptData,
            positionsStatus: positionsStatusData,
            growth: growthData,
            health: healthData,
            scatter: scatterData,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `dashboard_stats_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = (type: 'departments' | 'sectors' | 'positions') => {
        let content = "";
        let filename = "";

        if (type === 'departments') {
            content = "ID,Name,Code,Active,CreatedAt\n" +
                departments.map(d => `${d.id},"${d.name}",${d.code},${d.active},${d.createdAt}`).join("\n");
            filename = "departments.csv";
        } else if (type === 'sectors') {
            content = "ID,Name,Code,DepartmentID,Active,CreatedAt\n" +
                sectors.map(s => `${s.id},"${s.name}",${s.code},${s.departmentId},${s.active},${s.createdAt}`).join("\n");
            filename = "sectors.csv";
        } else {
            content = "ID,Name,Code,SectorID,Seniority,BaseSalary,Active,CreatedAt\n" +
                positions.map(p => `${p.id},"${p.name}",${p.code},${p.sectorId},${p.seniority},${p.baseSalary},${p.active},${p.createdAt}`).join("\n");
            filename = "positions.csv";
        }

        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 fade-in animate-in duration-500">
            {/* Date Range Indicator */}
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                <Calendar className="h-3.5 w-3.5" />
                <span>Filtro Ativo: {dateRange.toUpperCase()} ({dateFilter.start.toLocaleDateString('pt-BR')} - {dateFilter.end.toLocaleDateString('pt-BR')})</span>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-2">
                <div className="flex items-center rounded border border-white/10 bg-white/5">
                    <button
                        type="button"
                        onClick={() => handleExportCSV('departments')}
                        aria-label="Exportar CSV de Departamentos"
                        className="px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white hover:bg-white/5 border-r border-white/10 transition-colors"
                    >
                        CSV_DEPTS
                    </button>
                    <button
                        type="button"
                        onClick={() => handleExportCSV('sectors')}
                        aria-label="Exportar CSV de Setores"
                        className="px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white hover:bg-white/5 border-r border-white/10 transition-colors"
                    >
                        CSV_SEC
                    </button>
                    <button
                        type="button"
                        onClick={() => handleExportCSV('positions')}
                        aria-label="Exportar CSV de Cargos"
                        className="px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        CSV_POS
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handleExportStats}
                    aria-label="Exportar estatísticas completas em JSON"
                    className="flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors border border-white/10 bg-white/5 px-3 py-1.5 rounded"
                >
                    <Download className="h-3.5 w-3.5" />
                    JSON_FULL
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <GlassCard key={stat.label} className={`border p-4 ${stat.border}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{stat.label}</p>
                                <div className="mt-2 text-2xl font-bold text-white shadow-glow">{stat.value}</div>
                                <div className="mt-1 text-[10px] font-mono text-white/40">{stat.subVal}</div>
                            </div>
                            <div className={`rounded-lg p-2 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Structure Density - Bar Chart */}
                <GlassCard className="p-6 relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Densidade Estrutural</h3>
                        <p className="text-sm text-white/50">Setores por Departmento (Top 8)</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <FuturisticBarChart
                            data={sectorsPerDeptData}
                            xAxis="name"
                            yAxis="value"
                            tooltipFormat={(v) => `${v} setores`}
                        />
                    </div>
                </GlassCard>

                {/* Status Distribution - Pie Chart */}
                <GlassCard className="p-6 relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Saúde dos Cargos</h3>
                        <p className="text-sm text-white/50">Proporção Ativos vs Inativos</p>
                    </div>
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <FuturisticPieChart
                            data={positionsStatusData}
                        />
                    </div>
                </GlassCard>

                {/* Growth Trend - Line Chart */}
                <GlassCard className="p-6 relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Crescimento da Estrutura</h3>
                        <p className="text-sm text-white/50">Entidades (Departamentos + Setores + Cargos) ao longo do tempo</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <FuturisticLineChart
                            data={growthData}
                            xKey="x"
                            yKey="y"
                            color="hsl(var(--primary))"
                        />
                    </div>
                </GlassCard>

                {/* Health Radar - Radar Chart */}
                <GlassCard className="p-6 relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Indicadores de Qualidade</h3>
                        <p className="text-sm text-white/50">% Atividade por Categoria</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <FuturisticRadarChart
                            data={healthData}
                            dataKeys={["A"]}
                            indexBy="subject"
                        />
                    </div>
                </GlassCard>

                {/* Salary Analysis - Scatter Chart */}
                <GlassCard className="p-6 relative overflow-hidden md:col-span-2">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Análise Salarial</h3>
                        <p className="text-sm text-white/50">Salário Base vs Senioridade (Top 5 Deptos)</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <FuturisticScatterChart
                            series={scatterData}
                            title=""
                            xLabel="Senioridade (1-7)"
                            yLabel="Salário Base"
                        />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
