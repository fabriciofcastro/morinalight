"use client";

import { Department, Position, Sector } from "@morina/organizational-structure-domain";
import { GlassCard, cn } from "@morina/ui";
import { ArrowLeftRight, Briefcase, DollarSign, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

interface ComparisonPanelProps {
    departments: Department[];
    sectors: Sector[];
    positions: Position[];
    members: any[];
}

type EntityOption = {
    id: string;
    label: string;
    type: 'department' | 'sector';
    data: Department | Sector;
};

export function ComparisonPanel({ departments, sectors, positions, members }: ComparisonPanelProps) {
    const [entityAId, setEntityAId] = useState<string>("");
    const [entityBId, setEntityBId] = useState<string>("");

    const options = useMemo(() => {
        const opts: EntityOption[] = [];
        departments.forEach(d => {
            if (d.id) opts.push({ id: d.id, label: `Dep: ${d.name}`, type: 'department', data: d });
        });
        sectors.forEach(s => {
            if (s.id) opts.push({ id: s.id, label: `Set: ${s.name}`, type: 'sector', data: s });
        });
        return opts.sort((a, b) => a.label.localeCompare(b.label));
    }, [departments, sectors]);

    const metricsA = useMemo(() => calculateMetrics(entityAId, options, positions, sectors, members), [entityAId, options, positions, sectors, members]);
    const metricsB = useMemo(() => calculateMetrics(entityBId, options, positions, sectors, members), [entityBId, options, positions, sectors, members]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeftRight className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-semibold text-white">Análise Comparativa</h3>
            </div>

            <div className="grid gap-6 grid-cols-2">
                {/* Selector A */}
                <GlassCard className="p-4 border-l-4 border-l-blue-500/50">
                    <label htmlFor="select-entity-a" className="text-xs text-blue-400 mb-2 block font-mono uppercase tracking-wider">Entidade A</label>
                    <div className="relative">
                        <select
                            id="select-entity-a"
                            className="w-full bg-black/40 border border-white/10 text-white p-2 rounded text-sm outline-none focus:border-blue-500 transition-colors"
                            value={entityAId}
                            onChange={(e) => setEntityAId(e.target.value)}
                        >
                            <option value="">Selecionar...</option>
                            {options.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </GlassCard>

                {/* Selector B */}
                <GlassCard className="p-4 border-l-4 border-l-purple-500/50">
                    <label htmlFor="select-entity-b" className="text-xs text-purple-400 mb-2 block font-mono uppercase tracking-wider">Entidade B</label>
                    <div className="relative">
                        <select
                            id="select-entity-b"
                            className="w-full bg-black/40 border border-white/10 text-white p-2 rounded text-sm outline-none focus:border-purple-500 transition-colors"
                            value={entityBId}
                            onChange={(e) => setEntityBId(e.target.value)}
                        >
                            <option value="">Selecionar...</option>
                            {options.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </GlassCard>
            </div>

            {/* Comparison Grid */}
            {(entityAId && entityBId) ? (
                <GlassCard className="p-6">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Header */}
                        <div className="text-center pb-4 border-b border-white/10">
                            <h4 className="font-bold text-blue-100">{metricsA.name}</h4>
                            <span className="text-xs text-white/40 uppercase">{metricsA.type}</span>
                        </div>
                        <div className="text-center pb-4 border-b border-white/10 px-4">
                            <span className="text-xs text-white/30 font-mono">VS</span>
                        </div>
                        <div className="text-center pb-4 border-b border-white/10">
                            <h4 className="font-bold text-purple-100">{metricsB.name}</h4>
                            <span className="text-xs text-white/40 uppercase">{metricsB.type}</span>
                        </div>

                        {/* Headcount */}
                        <MetricRow
                            label="Headcount"
                            icon={Users}
                            valA={metricsA.headcount}
                            valB={metricsB.headcount}
                            format={(v) => v.toString()}
                        />

                        {/* Total Cost */}
                        <MetricRow
                            label="Custo Total (Mensal)"
                            icon={DollarSign}
                            valA={metricsA.totalCost}
                            valB={metricsB.totalCost}
                            format={(v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)}
                        />

                        {/* Avg Salary */}
                        <MetricRow
                            label="Salário Médio"
                            icon={DollarSign}
                            valA={metricsA.avgSalary}
                            valB={metricsB.avgSalary}
                            format={(v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)}
                        />

                        {/* Positions Count */}
                        <MetricRow
                            label="Cargos Totais"
                            icon={Briefcase}
                            valA={metricsA.positionCount}
                            valB={metricsB.positionCount}
                            format={(v) => v.toString()}
                        />

                        {/* Vacancy Rate */}
                        <MetricRow
                            label="Taxa de Vacância"
                            icon={TrendingUp}
                            valA={metricsA.vacancyRate}
                            valB={metricsB.vacancyRate}
                            format={(v) => `${v}%`}
                            inverseBetter={true}
                        />

                    </div>
                </GlassCard>
            ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
                    <p className="text-white/40">Selecione duas entidades acima para comparar métricas.</p>
                </div>
            )}
        </div>
    );
}

function MetricRow({
    label,
    valA,
    valB,
    format,
    inverseBetter = false,
    icon: Icon
}: {
    label: string,
    valA: number,
    valB: number,
    format: (v: number) => string,
    inverseBetter?: boolean,
    icon: any
}) {
    const diff = valA === 0 ? 0 : ((valB - valA) / valA) * 100;
    const isBBetter = inverseBetter ? valB < valA : valB > valA;
    const isEqual = valA === valB;

    return (
        <>
            <div className="text-right py-3 border-b border-white/5">
                <div className="text-lg font-mono text-white/90">{format(valA)}</div>
            </div>
            <div className="text-center py-3 border-b border-white/5 flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1">
                    <Icon className="h-3 w-3" />
                    {label}
                </div>
                {!isEqual && (
                    <div className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold",
                        isBBetter ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                    </div>
                )}
            </div>
            <div className="text-left py-3 border-b border-white/5">
                <div className="text-lg font-mono text-white/90">{format(valB)}</div>
            </div>
        </>
    );
}

function calculateMetrics(
    id: string,
    options: EntityOption[],
    allPositions: Position[],
    allSectors: Sector[],
    allMembers: any[]
) {
    if (!id) return { name: '-', type: '-', headcount: 0, totalCost: 0, avgSalary: 0, positionCount: 0, vacancyRate: 0 };

    const entity = options.find(o => o.id === id);
    if (!entity) return { name: '?', type: '?', headcount: 0, totalCost: 0, avgSalary: 0, positionCount: 0, vacancyRate: 0 };

    let relevantPositions: Position[] = [];

    if (entity.type === 'sector') {
        relevantPositions = allPositions.filter(p => p.sectorId === entity.id);
    } else {
        // Find all sectors for this dept
        const deptSectors = allSectors
            .filter(s => s.departmentId === entity.id)
            .map(s => s.id)
            .filter((id): id is string => !!id);
        relevantPositions = allPositions.filter(p => p.sectorId && deptSectors.includes(p.sectorId));
    }

    const positionCount = relevantPositions.length;
    
    const relevantMembers = allMembers.filter(m => {
        const posIds = relevantPositions.map(p => p.id);
        return posIds.includes(m.positionId);
    });

    const totalCost = relevantPositions.reduce((acc, p) => acc + (p.baseSalary || 0), 0);
    const avgSalary = positionCount > 0 ? totalCost / positionCount : 0;
    const headcount = relevantMembers.length;
    const vacancyRate = positionCount > 0 ? ((positionCount - headcount) / positionCount) * 100 : 0;

    return {
        name: entity.data.name,
        type: entity.type === 'department' ? 'Departamento' : 'Setor',
        headcount,
        totalCost,
        avgSalary,
        positionCount,
        vacancyRate: parseFloat(vacancyRate.toFixed(1))
    };
}
