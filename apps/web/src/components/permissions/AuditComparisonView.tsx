"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactDiffViewer from "react-diff-viewer-continued";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

interface AuditSummary {
    id: string;
    executedAt: string;
    totalUsers: number;
    totalAnomalies: number;
    complianceScore: number;
    anomaliesByType: Record<string, number>;
}

interface AuditComparison {
    audit1: AuditSummary;
    audit2: AuditSummary;
    delta: {
        usersDelta: number;
        anomaliesDelta: number;
        scoreDelta: number;
        improvement: boolean;
        percentageChange: number;
    };
    changes: Array<{
        type: "new" | "resolved" | "persistent";
        anomaly: any;
        userId?: string;
        timestamp: string;
    }>;
    timeline: Array<{
        timestamp: string;
        event: string;
        impact: "positive" | "negative" | "neutral";
    }>;
}

export function AuditComparisonView() {
    const [audits, setAudits] = useState<AuditSummary[]>([]);
    const [audit1Id, setAudit1Id] = useState<string>("");
    const [audit2Id, setAudit2Id] = useState<string>("");
    const [comparison, setComparison] = useState<AuditComparison | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAvailableAudits();
    }, []);

    const fetchAvailableAudits = async () => {
        try {
            const response = await fetch("/api/permissions/audit/history?days=90", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setAudits(data.snapshots || []);
        } catch (error) {
            console.error("Erro ao buscar auditorias:", error);
        }
    };

    const compareAudits = async () => {
        if (!audit1Id || !audit2Id) {
            alert("Selecione duas auditorias para comparar");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `/api/permissions/audit/history/compare?id1=${audit1Id}&id2=${audit2Id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();
            setComparison(data);
        } catch (error) {
            console.error("Erro ao comparar auditorias:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDeltaIcon = (delta: number) => {
        if (delta > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
        if (delta < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
        return <Minus className="h-4 w-4 text-gray-600" />;
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "positive":
                return "text-green-600 bg-green-50";
            case "negative":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <div className="space-y-6">
            {/* Seleção de Auditorias */}
            <Card>
                <CardHeader>
                    <CardTitle>Comparar Auditorias</CardTitle>
                    <CardDescription>
                        Selecione duas auditorias para comparar e identificar melhorias ou regressões
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Auditoria 1 (Antes)</label>
                            <Select value={audit1Id} onValueChange={setAudit1Id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {audits.map((audit) => (
                                        <SelectItem key={audit.id} value={audit.id}>
                                            {new Date(audit.executedAt).toLocaleString("pt-BR")} - Score: {audit.complianceScore}%
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end justify-center">
                            <ArrowRight className="h-6 w-6 text-gray-400" />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Auditoria 2 (Depois)</label>
                            <Select value={audit2Id} onValueChange={setAudit2Id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {audits.map((audit) => (
                                        <SelectItem key={audit.id} value={audit.id}>
                                            {new Date(audit.executedAt).toLocaleString("pt-BR")} - Score: {audit.complianceScore}%
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={compareAudits} disabled={loading || !audit1Id || !audit2Id} className="mt-4">
                        {loading ? "Comparando..." : "Comparar"}
                    </Button>
                </CardContent>
            </Card>

            {/* Resultados da Comparação */}
            {comparison && (
                <>
                    {/* Delta de Métricas */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
                                {getDeltaIcon(comparison.delta.scoreDelta)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {comparison.audit1.complianceScore}% → {comparison.audit2.complianceScore}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {comparison.delta.scoreDelta > 0 ? "+" : ""}
                                    {comparison.delta.scoreDelta.toFixed(1)}% (
                                    {comparison.delta.percentageChange.toFixed(1)}%)
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Anomalias</CardTitle>
                                {getDeltaIcon(comparison.delta.anomaliesDelta)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {comparison.audit1.totalAnomalies} → {comparison.audit2.totalAnomalies}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {comparison.delta.anomaliesDelta > 0 ? "+" : ""}
                                    {comparison.delta.anomaliesDelta} anomalias
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={comparison.delta.improvement ? "bg-green-600" : "bg-red-600"}>
                                    {comparison.delta.improvement ? "Melhoria Detectada" : "Regressão Detectada"}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {comparison.delta.improvement
                                        ? "Sistema está melhorando"
                                        : "Atenção necessária"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline de Eventos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline de Mudanças</CardTitle>
                            <CardDescription>Eventos entre as duas auditorias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {comparison.timeline.map((event, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{event.event}</span>
                                                <Badge className={getImpactColor(event.impact)}>
                                                    {event.impact === "positive"
                                                        ? "Positivo"
                                                        : event.impact === "negative"
                                                            ? "Negativo"
                                                            : "Neutro"}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.timestamp).toLocaleString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mudanças Detalhadas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mudanças Detalhadas</CardTitle>
                            <CardDescription>
                                {comparison.changes.filter((c) => c.type === "resolved").length} resolvidas,{" "}
                                {comparison.changes.filter((c) => c.type === "new").length} novas,{" "}
                                {comparison.changes.filter((c) => c.type === "persistent").length} persistentes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {comparison.changes.slice(0, 10).map((change, index) => (
                                    <Alert key={index}>
                                        <AlertDescription>
                                            <div className="flex items-center justify-between">
                                                <span>
                                                    <Badge
                                                        className={
                                                            change.type === "resolved"
                                                                ? "bg-green-600"
                                                                : change.type === "new"
                                                                    ? "bg-red-600"
                                                                    : "bg-yellow-600"
                                                        }
                                                    >
                                                        {change.type === "resolved"
                                                            ? "Resolvida"
                                                            : change.type === "new"
                                                                ? "Nova"
                                                                : "Persistente"}
                                                    </Badge>
                                                    <span className="ml-2">{change.anomaly.type || "Anomalia"}</span>
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {change.userId || "N/A"}
                                                </span>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Diff Visual (Exemplo) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparação Visual de Anomalias</CardTitle>
                            <CardDescription>Diferenças entre as auditorias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReactDiffViewer
                                oldValue={JSON.stringify(comparison.audit1.anomaliesByType, null, 2)}
                                newValue={JSON.stringify(comparison.audit2.anomaliesByType, null, 2)}
                                splitView={true}
                                leftTitle="Auditoria 1"
                                rightTitle="Auditoria 2"
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
