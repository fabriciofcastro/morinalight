'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Info,
    Download,
    RefreshCw,
    ShieldCheck,
    Lock,
    ExternalLink
} from "lucide-react";
import {
    GlassCard,
    Button,
} from "@/shared/ui/base/futuristic";
import { Badge } from "@/shared/ui/base/badge";
import { Progress } from "@/shared/ui/base/progress";
import { format } from 'date-fns';

interface ComplianceControl {
    id: string;
    name: string;
    description: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    evidenceCount: number;
    details: string;
}

interface ComplianceReport {
    framework: string;
    generatedAt: string;
    period: {
        start: string;
        end: string;
    };
    overallScore: number;
    controls: ComplianceControl[];
    summary: {
        total: number;
        implemented: number;
        partial: number;
        notImplemented: number;
    };
    recommendations: string[];
}

export function ComplianceReportView() {
    const [framework, setFramework] = useState<'soc2' | 'iso27001'>('soc2');
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/compliance/reports?framework=${framework}`);

            if (!response.ok) {
                if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
                if (response.status === 403) throw new Error('Acesso negado. Requer permissões de administrador.');
                throw new Error('Falha ao carregar relatório');
            }

            const data = await response.json();
            setReport(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [framework]);

    const getStatusBadge = (status: ComplianceControl['status']) => {
        switch (status) {
            case 'implemented':
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Implementado</Badge>;
            case 'partial':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Parcial</Badge>;
            case 'not_implemented':
                return <Badge className="bg-destructive/20 text-destructive-400 border-destructive/50">Não Implementado</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-white/60">Gerando relatório de conformidade...</p>
            </div>
        );
    }

    if (error) {
        return (
            <GlassCard className="p-10 text-center border-destructive/20">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">Erro na Geração</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <Button variant="outline" onClick={fetchReport}>Tentar Novamente</Button>
            </GlassCard>
        );
    }

    if (!report) return null;

    return (
        <div className="space-y-6">
            {/* Header com Fletores */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setFramework('soc2')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${framework === 'soc2' ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--primary)/0.5)]' : 'text-white/60 hover:text-white'}`}
                    >
                        SOC 2 Type II
                    </button>
                    <button
                        onClick={() => setFramework('iso27001')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${framework === 'iso27001' ? 'bg-primary text-black shadow-[0_0_15px_hsl(var(--primary)/0.5)]' : 'text-white/60 hover:text-white'}`}
                    >
                        ISO 27001:2022
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Gerado em: {format(new Date(report.generatedAt), 'dd/MM/yyyy HH:mm')}</span>
                    <Button variant="outline" size="sm" className="h-9">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 md:col-span-2 relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">Pontuação de Conformidade</p>
                            <h2 className="text-5xl font-black text-white">{report.overallScore.toFixed(1)}%</h2>
                        </div>
                        <ShieldCheck className="h-12 w-12 text-primary opacity-20" />
                    </div>
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/40">Progresso Geral</span>
                            <span className="text-primary">{report.overallScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={report.overallScore} className="h-2 bg-white/5" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-between">
                    <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-4">Resumo dos Controles</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Total de Controles</span>
                            <span className="text-white font-bold">{report.summary.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-emerald-400 text-sm flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Implementados
                            </span>
                            <span className="text-white font-bold">{report.summary.implemented}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-amber-400 text-sm flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" /> Parciais
                            </span>
                            <span className="text-white font-bold">{report.summary.partial}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-destructive text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" /> Pendentes
                            </span>
                            <span className="text-white font-bold">{report.summary.notImplemented}</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
                <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-amber-400" />
                        <h3 className="text-amber-400 font-bold">Recomendações Prioritárias</h3>
                    </div>
                    <ul className="space-y-2">
                        {report.recommendations.map((rec, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            )}

            {/* Controls List */}
            <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Detalhamento dos Controles
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {report.controls.map((control) => (
                        <GlassCard key={control.id} className="p-4 hover:bg-white/[0.03] transition-colors group">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10">
                                            {control.id}
                                        </span>
                                        <h4 className="text-white font-bold group-hover:text-primary transition-colors">
                                            {control.name}
                                        </h4>
                                        {getStatusBadge(control.status)}
                                    </div>
                                    <p className="text-white/40 text-sm mb-3">{control.description}</p>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="text-white/60">
                                            <strong className="text-white">{control.evidenceCount}</strong> Evidências coletadas
                                        </span>
                                        <span className="text-white/30 truncate" title={control.details}>
                                            Detalhamento: {control.details}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                        Ver Evidências
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
