/**
 * EXEMPLO DE USO - StatCard e StatsGroup
 * 
 * Este arquivo demonstra como usar os novos componentes enterprise
 * com tema totalmente integrado.
 */

import { StatCard, StatCardCircular, StatsGroup } from "@morina/ui";
import { Building2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function ExemploStats() {
    const stats = {
        total: 100,
        ativos: 80,
        inativos: 15,
        fichasCusto: 5,
    };

    return (
        <div className="space-y-8">
            {/* Exemplo 1: Grid de 3 colunas */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Grid 3 Colunas</h2>
                <StatsGroup layout="grid-3">
                    <StatCard
                        icon={Building2}
                        label="Total"
                        value={stats.total}
                        variant="primary"
                        subtitle="Fornecedores cadastrados"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Ativos"
                        value={stats.ativos}
                        variant="success"
                        subtitle={`${Math.round((stats.ativos / stats.total) * 100)}% do total`}
                    />
                    <StatCard
                        icon={XCircle}
                        label="Inativos"
                        value={stats.inativos}
                        variant="danger"
                        subtitle={`${Math.round((stats.inativos / stats.total) * 100)}% do total`}
                    />
                </StatsGroup>
            </div>

            {/* Exemplo 2: Horizontal com separadores */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Horizontal com Separadores</h2>
                <StatsGroup layout="horizontal" showSeparators>
                    <StatCard
                        icon={Building2}
                        label="Total"
                        value={stats.total}
                        variant="primary"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Ativos"
                        value={stats.ativos}
                        variant="success"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Inativos"
                        value={stats.inativos}
                        variant="danger"
                    />
                    {stats.fichasCusto > 0 && (
                        <StatCard
                            icon={AlertCircle}
                            label="Fichas-Custo"
                            value={stats.fichasCusto}
                            variant="warning"
                        />
                    )}
                </StatsGroup>
            </div>

            {/* Exemplo 3: Com progresso circular */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Com Progresso Circular</h2>
                <StatsGroup layout="grid-3">
                    <StatCardCircular
                        icon={Building2}
                        label="Total"
                        value={stats.total}
                        maxValue={stats.total}
                        variant="primary"
                        showProgress
                    />
                    <StatCardCircular
                        icon={CheckCircle2}
                        label="Ativos"
                        value={stats.ativos}
                        maxValue={stats.total}
                        variant="success"
                        showProgress
                        subtitle={`${Math.round((stats.ativos / stats.total) * 100)}% do total`}
                    />
                    <StatCardCircular
                        icon={XCircle}
                        label="Inativos"
                        value={stats.inativos}
                        maxValue={stats.total}
                        variant="danger"
                        showProgress
                        subtitle={`${Math.round((stats.inativos / stats.total) * 100)}% do total`}
                    />
                </StatsGroup>
            </div>

            {/* Exemplo 4: Grid 4 colunas */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Grid 4 Colunas</h2>
                <StatsGroup layout="grid-4">
                    <StatCard icon={Building2} label="Total" value={stats.total} variant="primary" />
                    <StatCard icon={CheckCircle2} label="Ativos" value={stats.ativos} variant="success" />
                    <StatCard icon={XCircle} label="Inativos" value={stats.inativos} variant="danger" />
                    <StatCard icon={AlertCircle} label="Fichas-Custo" value={stats.fichasCusto} variant="warning" />
                </StatsGroup>
            </div>

            {/* Exemplo 5: Com onClick */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Clicável</h2>
                <StatsGroup layout="grid-3">
                    <StatCard
                        icon={Building2}
                        label="Total"
                        value={stats.total}
                        variant="primary"
                        onClick={() => alert("Clicou em Total!")}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Ativos"
                        value={stats.ativos}
                        variant="success"
                        onClick={() => alert("Clicou em Ativos!")}
                    />
                    <StatCard
                        icon={XCircle}
                        label="Inativos"
                        value={stats.inativos}
                        variant="danger"
                        onClick={() => alert("Clicou em Inativos!")}
                    />
                </StatsGroup>
            </div>
        </div>
    );
}

/**
 * ANTES (código antigo - fornecedores-list-client.tsx):
 * 
 * <div className="flex flex-wrap items-center gap-6">
 *   <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-blue-500/10 border border-blue-500/30...">
 *     <Building2 className="h-4 w-4 text-blue-400..." />
 *     <span className="text-sm font-semibold text-blue-100">{stats.total} Total</span>
 *   </div>
 *   <div className="h-8 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
 *   <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-green-500/10 border border-green-500/30...">
 *     <CheckCircle2 className="h-4 w-4 text-green-400..." />
 *     <span className="text-sm font-semibold text-green-100">{stats.ativos} Ativos</span>
 *   </div>
 *   // ... mais 50+ linhas de código repetido
 * </div>
 * 
 * DEPOIS (com novos componentes):
 * 
 * <StatsGroup layout="horizontal" showSeparators>
 *   <StatCard icon={Building2} label="Total" value={stats.total} variant="primary" />
 *   <StatCard icon={CheckCircle2} label="Ativos" value={stats.ativos} variant="success" />
 *   <StatCard icon={XCircle} label="Inativos" value={stats.inativos} variant="danger" />
 * </StatsGroup>
 * 
 * REDUÇÃO: ~50 linhas → 5 linhas (90% menos código!)
 */
