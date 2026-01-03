"use client";

import { Building2, TrendingUp, DollarSign, MapPin, Activity } from "lucide-react";
import { type Branch } from "@/lib/api/organizational-structure";

interface BranchStatsProps {
    branches: Branch[];
}

export function BranchStats({ branches }: BranchStatsProps) {
    const stats = {
        total: branches.length,
        active: branches.filter(b => b.active).length,
        inactive: branches.filter(b => !b.active).length,
        byType: branches.reduce((acc, b) => {
            acc[b.type] = (acc[b.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    const cards = [
        { label: "Total de Filiais", value: stats.total, icon: Building2, color: "blue" },
        { label: "Ativas", value: stats.active, icon: Activity, color: "green" },
        { label: "Inativas", value: stats.inactive, icon: TrendingUp, color: "red" },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-white/60">{card.label}</span>
                                <Icon className={`w-5 h-5 text-${card.color}-400`} />
                            </div>
                            <p className="text-3xl font-bold text-white">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Por Tipo</h3>
                <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-2 rounded bg-white/5">
                            <span className="text-white/80">{type}</span>
                            <span className="font-semibold text-white">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
