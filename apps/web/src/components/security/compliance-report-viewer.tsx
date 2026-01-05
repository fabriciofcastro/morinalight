'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Shield, AlertCircle } from 'lucide-react';

interface ComplianceReport {
    type: 'LGPD' | 'SOC2' | 'ISO27001';
    period: {
        start: Date;
        end: Date;
    };
    totalAccesses: number;
    deniedAccesses: number;
    highRiskAccesses: number;
    anomalies: number;
    piiAccessCount: number;
    summary: string;
    topUsers: Array<{ userId: string; accessCount: number }>;
    topResources: Array<{ subject: string; accessCount: number }>;
}

interface ComplianceReportViewerProps {
    orgId: string;
}

export function ComplianceReportViewer({ orgId }: ComplianceReportViewerProps) {
    const [reportType, setReportType] = useState<'LGPD' | 'SOC2' | 'ISO27001'>('LGPD');
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
    });

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: reportType,
                startDate: period.start.toISOString(),
                endDate: period.end.toISOString(),
            });
            const response = await fetch(`/api/audit/compliance-report?${params.toString()}`);
            const data = await response.json();
            setReport(data.data);
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!report) return;

        const content = JSON.stringify(report, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${reportType}-${Date.now()}.json`;
        a.click();
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Relatórios de Compliance
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gere relatórios de conformidade para LGPD, SOC2 e ISO27001
                </p>
            </div>

            {/* Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuração do Relatório
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Relatório
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                            <option value="LGPD">LGPD (Lei Geral de Proteção de Dados)</option>
                            <option value="SOC2">SOC 2 (Service Organization Control)</option>
                            <option value="ISO27001">ISO 27001 (Segurança da Informação)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data Início
                        </label>
                        <input
                            type="date"
                            value={period.start.toISOString().split('T')[0]}
                            onChange={(e) => setPeriod({ ...period, start: new Date(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data Fim
                        </label>
                        <input
                            type="date"
                            value={period.end.toISOString().split('T')[0]}
                            onChange={(e) => setPeriod({ ...period, end: new Date(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        {loading ? 'Gerando...' : 'Gerar Relatório'}
                    </button>
                    {report && (
                        <button
                            onClick={downloadReport}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download JSON
                        </button>
                    )}
                </div>
            </div>

            {/* Report */}
            {report && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Resumo Executivo
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">Total de Acessos</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                                            {report.totalAccesses.toLocaleString()}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-600 dark:text-red-400">Acessos Negados</p>
                                        <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
                                            {report.deniedAccesses.toLocaleString()}
                                        </p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 dark:text-orange-400">Alto Risco</p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
                                            {report.highRiskAccesses.toLocaleString()}
                                        </p>
                                    </div>
                                    <Shield className="w-8 h-8 text-orange-600" />
                                </div>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 dark:text-purple-400">Anomalias</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                                            {report.anomalies.toLocaleString()}
                                        </p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-purple-600" />
                                </div>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400">Dados Sensíveis (PII)</p>
                                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 mt-1">
                                            {report.piiAccessCount.toLocaleString()}
                                        </p>
                                    </div>
                                    <Shield className="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        {report.summary && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white">Resumo Executivo:</strong> {report.summary}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Top Resources & Users */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recursos Mais Acessados
                            </h3>
                            <div className="space-y-3">
                                {report.topResources.map((res, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{res.subject}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{res.accessCount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Usuários Mais Ativos
                            </h3>
                            <div className="space-y-3">
                                {report.topUsers.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{user.userId?.substring(0, 8)}...</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{user.accessCount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!report && !loading && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure os parâmetros acima e clique em "Gerar Relatório"
                    </p>
                </div>
            )}
        </div>
    );
}
