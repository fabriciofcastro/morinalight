'use client';

import { AlertTriangle, Download, FileText, Filter, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AccessLog {
    id: string;
    userId?: string;
    action: string;
    subject: string;
    effect: 'ALLOW' | 'DENY';
    reason?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    riskScore: number;
    anomalies: string[];
    createdAt: string;
}

interface SearchFilters {
    effect?: 'ALLOW' | 'DENY';
    minRiskScore?: number;
    startDate?: string;
    endDate?: string;
    hasAnomalies?: boolean;
}

interface AuditDashboardProps {
    orgId?: string;
}

export function AuditDashboard({ orgId }: AuditDashboardProps) {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        denied: 0,
        highRisk: 0,
        anomalies: 0,
    });

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [filters]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/audit/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...filters, limit: 50 }),
            });
            const data = await response.json();
            setLogs(data.data);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch('/api/audit/access-decisions');
            const data = await response.json();

            setStats({
                total: data.total || 0,
                denied: data.data.filter((l: AccessLog) => l.effect === 'DENY').length,
                highRisk: data.data.filter((l: AccessLog) => l.riskScore >= 70).length,
                anomalies: data.data.filter((l: AccessLog) => l.anomalies.length > 0).length,
            });
        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    };

    const handleExport = async (format: 'CSV' | 'JSON') => {
        try {
            const params = new URLSearchParams({ format, ...filters as any });
            const response = await fetch(`/api/audit/export?${params}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-log.${format.toLowerCase()}`;
            a.click();
        } catch (error) {
            console.error('Erro ao exportar:', error);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        if (score >= 30) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Auditoria Avançada
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Logs de acesso e decisões de autorização
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                    <button
                        onClick={() => handleExport('CSV')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Acessos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Acessos Negados</p>
                            <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Alto Risco</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Com Anomalias</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.anomalies}</p>
                        </div>
                        <Search className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Efeito
                            </label>
                            <select
                                value={filters.effect || ''}
                                onChange={(e) => setFilters({ ...filters, effect: e.target.value as any || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="">Todos</option>
                                <option value="ALLOW">Permitidos</option>
                                <option value="DENY">Negados</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Risk Score Mínimo
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={filters.minRiskScore || ''}
                                onChange={(e) => setFilters({ ...filters, minRiskScore: Number(e.target.value) || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="0-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Fim
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setFilters({})}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Ação
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Recurso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Localização
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Risk Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Efeito
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {log.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {log.city && log.country ? `${log.city}, ${log.country}` : log.country || '-'}
                                            </div>
                                            {log.ipAddress && (
                                                <div className="text-xs text-gray-500 font-mono">{log.ipAddress}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(log.riskScore)}`}>
                                                {log.riskScore}
                                            </span>
                                            {log.anomalies.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {log.anomalies.slice(0, 2).map((anomaly, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                        >
                                                            {anomaly}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.effect === 'ALLOW'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {log.effect === 'ALLOW' ? 'Permitido' : 'Negado'}
                                            </span>
                                            {log.reason && (
                                                <div className="text-xs text-gray-500 mt-1">{log.reason}</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && logs.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Nenhum log encontrado
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
