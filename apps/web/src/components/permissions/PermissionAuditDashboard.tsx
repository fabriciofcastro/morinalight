"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Shield,
    Download,
    Play,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    Users,
    FileText
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { AuditHistoryCharts } from "./AuditHistoryCharts";

interface AuditSummary {
    conformityScore: number;
    totalAnomalies: number;
    criticalIssues: number;
    lastAudit: string | null;
    status: "excellent" | "good" | "warning" | "critical";
}

interface AuditReport {
    id: string;
    orgId: string;
    timestamp: string;
    executedBy: string;
    summary: {
        totalPermissions: number;
        totalUsers: number;
        totalPositions: number;
        totalSectors: number;
        totalDepartments: number;
        anomaliesFound: number;
        conformityScore: number;
        criticalIssues: number;
        highSeverityIssues: number;
        mediumSeverityIssues: number;
        lowSeverityIssues: number;
    };
    orphanedPermissions: any[];
    conflicts: any[];
    excessivePermissions: any[];
    hierarchyIssues: any[];
    auditGaps: any[];
    obsoletePermissions: any[];
    sodViolations: any[];
    recommendations: string[];
}

export function PermissionAuditDashboard() {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [report, setReport] = useState<AuditReport | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/permissions/audit/summary", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error("Erro ao buscar resumo:", error);
        } finally {
            setLoading(false);
        }
    };

    const runAudit = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/permissions/audit/run", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    filters: {
                        includeOrphaned: true,
                        includeConflicts: true,
                        includeExcessive: true,
                        includeHierarchy: true,
                        includeAuditGaps: true,
                        includeObsolete: true,
                        includeSoD: true,
                    },
                }),
            });
            const data = await response.json();
            setReport(data);
            setActiveTab("details");
        } catch (error) {
            console.error("Erro ao executar auditoria:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFixes = async (dryRun: boolean) => {
        if (!report) return;

        try {
            setLoading(true);
            const response = await fetch("/api/permissions/audit/fix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    options: {
                        removeOrphaned: true,
                        resolveConflicts: true,
                        removeExcessive: true,
                        backfillAudit: true,
                        dryRun,
                    },
                    anomalies: {
                        orphaned: report.orphanedPermissions,
                        conflicts: report.conflicts,
                        excessive: report.excessivePermissions,
                        gaps: report.auditGaps,
                    },
                }),
            });
            const data = await response.json();

            if (!dryRun) {
                // Re-executar auditoria após aplicar correções
                await runAudit();
            }

            alert(`${dryRun ? "Simulação" : "Correções aplicadas"}: ${data.itemsFixed} itens`);
        } catch (error) {
            console.error("Erro ao aplicar correções:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!report) return;

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-report-${new Date().toISOString()}.json`;
        a.click();
    };

    const exportToPDF = async () => {
        if (!report) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/permissions/audit/export/${report.id}/pdf`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao gerar PDF");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-report-${report.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao exportar PDF:", error);
            alert("Erro ao exportar PDF. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "excellent":
                return "text-green-600 bg-green-50";
            case "good":
                return "text-blue-600 bg-blue-50";
            case "warning":
                return "text-yellow-600 bg-yellow-50";
            case "critical":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "excellent":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "good":
                return <Shield className="h-5 w-5 text-blue-600" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case "critical":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Auditoria de Permissões</h1>
                    <p className="text-muted-foreground">
                        Monitore e corrija anomalias no sistema de permissões
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchSummary} variant="outline" disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Atualizar
                    </Button>
                    <Button onClick={runAudit} disabled={loading}>
                        <Play className="mr-2 h-4 w-4" />
                        Executar Auditoria
                    </Button>
                    {report && (
                        <Button onClick={exportToPDF} variant="outline" disabled={loading}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar PDF
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.conformityScore}%</div>
                            <Badge className={`mt-2 ${getStatusColor(summary.status)}`}>
                                {summary.status.toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Anomalias</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalAnomalies}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Identificadas no sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Problemas Críticos</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {summary.criticalIssues}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Requerem ação imediata
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Última Auditoria</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">
                                {summary.lastAudit
                                    ? new Date(summary.lastAudit).toLocaleDateString("pt-BR")
                                    : "Nunca"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {summary.lastAudit
                                    ? new Date(summary.lastAudit).toLocaleTimeString("pt-BR")
                                    : "Execute a primeira auditoria"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Report */}
            {report && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                        <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                        <TabsTrigger value="actions">Ações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumo da Auditoria</CardTitle>
                                <CardDescription>
                                    Executada em {new Date(report.timestamp).toLocaleString("pt-BR")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Permissões</p>
                                        <p className="text-2xl font-bold">{report.summary.totalPermissions}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Usuários</p>
                                        <p className="text-2xl font-bold">{report.summary.totalUsers}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cargos</p>
                                        <p className="text-2xl font-bold">{report.summary.totalPositions}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Anomalias por Severidade</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Críticas</span>
                                            <Badge variant="destructive">{report.summary.criticalIssues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Alta</span>
                                            <Badge variant="destructive">{report.summary.highSeverityIssues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Média</span>
                                            <Badge variant="secondary">{report.summary.mediumSeverityIssues}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Baixa</span>
                                            <Badge variant="outline">{report.summary.lowSeverityIssues}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Permissões Órfãs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{report.orphanedPermissions.length}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Atribuídas a entidades deletadas
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Conflitos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{report.conflicts.length}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Permissões contraditórias
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Permissões Excessivas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{report.excessivePermissions.length}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Redundantes ou desnecessárias
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Violações de SoD</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-red-600">
                                        {report.sodViolations.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Segregação de funções
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Inconsistências Hierárquicas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{report.hierarchyIssues.length}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Problemas na hierarquia
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Gaps de Auditoria</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{report.auditGaps.length}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Mudanças sem registro
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Auditorias</CardTitle>
                                <CardDescription>
                                    Visualize a evolução das métricas de conformidade ao longo do tempo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AuditHistoryCharts />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recomendações</CardTitle>
                                <CardDescription>
                                    Ações sugeridas para melhorar a conformidade
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {report.recommendations.length > 0 ? (
                                    <ul className="space-y-3">
                                        {report.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertTitle>Excelente!</AlertTitle>
                                        <AlertDescription>
                                            Sistema em conformidade. Nenhuma recomendação necessária.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ações Disponíveis</CardTitle>
                                <CardDescription>
                                    Aplique correções automáticas nas anomalias identificadas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Atenção</AlertTitle>
                                    <AlertDescription>
                                        Sempre execute uma simulação (dry-run) antes de aplicar correções reais.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => applyFixes(true)}
                                        variant="outline"
                                        disabled={loading}
                                    >
                                        Simular Correções
                                    </Button>
                                    <Button
                                        onClick={() => applyFixes(false)}
                                        variant="destructive"
                                        disabled={loading}
                                    >
                                        Aplicar Correções
                                    </Button>
                                    <Button onClick={downloadReport} variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Baixar Relatório
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}

            {/* Initial State */}
            {!summary && !report && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bem-vindo à Auditoria de Permissões</CardTitle>
                        <CardDescription>
                            Execute sua primeira auditoria para identificar anomalias no sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={runAudit} size="lg">
                            <Play className="mr-2 h-5 w-5" />
                            Executar Primeira Auditoria
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
