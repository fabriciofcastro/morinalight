"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button, Input, GlassCard } from '@morina/ui';
import { PageBackground } from '@/components/page-background';

// TODO: Move to separate commissions API module when backend is ready
interface Commission {
    comissaoId: string;
    representanteNome: string;
    clienteNome?: string;
    valorVenda: number;
    valorComissao: number;
    status: 'aguardando' | 'em_analise' | 'aprovada' | 'contestada' | 'cancelada' | 'paga';
    mesCompetencia: string;
    romaneio?: string;
}

const statusLabels = {
    aguardando: 'Aguardando',
    em_analise: 'Em Análise',
    aprovada: 'Aprovada',
    contestada: 'Contestada',
    cancelada: 'Cancelada',
    paga: 'Paga',
};

const statusColors = {
    aguardando: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    em_analise: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    aprovada: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    contestada: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    cancelada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    paga: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
};

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCommissions();
    }, []);

    const loadCommissions = async () => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // const response = await commissionsApi.list(orgId);
            // setCommissions(response.items);

            // For now, return empty array (no mock data to avoid confusion)
            setCommissions([]);
        } catch (error: unknown) {
            console.error('Failed to load commissions:', error);
            setCommissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        total: commissions.reduce((sum, c) => sum + c.valorComissao, 0),
        pending: commissions.filter((c) => c.status === 'aguardando').length,
        approved: commissions.filter((c) => c.status === 'aprovada').length,
    };

    const filteredCommissions = commissions.filter(
        (commission) =>
            commission.representanteNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commission.clienteNome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commission.romaneio?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <PageBackground variant="comissoes" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[hsl(var(--text-1))]">Comissões</h1>
                        <p className="mt-2 text-[hsl(var(--text-2))]">
                            Gerencie comissões de representantes
                        </p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nova comissão
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-6 sm:grid-cols-3">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--text-3))]">Total em Comissões</p>
                                <p className="mt-2 text-2xl font-bold text-[hsl(var(--text-1))]">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.total)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--text-3))]">Aguardando Análise</p>
                                <p className="mt-2 text-2xl font-bold text-[hsl(var(--text-1))]">{stats.pending}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--text-3))]">Aprovadas</p>
                                <p className="mt-2 text-2xl font-bold text-[hsl(var(--text-1))]">{stats.approved}</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-3))]" />
                    <Input
                        type="search"
                        placeholder="Buscar comissões..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-hover))]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Representante</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Cliente</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Valor Venda</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Comissão</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-[hsl(var(--text-1))]">Competência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCommissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[hsl(var(--text-3))]">
                                            Nenhuma comissão encontrada
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCommissions.map((commission) => (
                                        <tr key={commission.comissaoId} className="hover:bg-[hsl(var(--surface-hover))]">
                                            <td className="px-6 py-4 font-medium text-[hsl(var(--text-1))]">
                                                {commission.representanteNome}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">
                                                {commission.clienteNome || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commission.valorVenda)}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-green-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commission.valorComissao)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[commission.status]}`}>
                                                    {statusLabels[commission.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[hsl(var(--text-2))]">
                                                {commission.mesCompetencia}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
