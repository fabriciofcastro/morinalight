"use client";

import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@morina/ui";
import { Activity, Pause, Play, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface AuditUpdate {
    type: 'progress' | 'completed' | 'failed' | 'anomaly_detected';
    orgId: string;
    data: any;
    timestamp: Date;
}

interface RealtimeStats {
    progress: number;
    status: 'idle' | 'running' | 'completed' | 'failed';
    message?: string;
    anomaliesDetected: number;
    lastUpdate?: Date;
}

export function RealtimeAuditDashboard({ orgId }: { orgId: string }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [stats, setStats] = useState<RealtimeStats>({
        progress: 0,
        status: 'idle',
        anomaliesDetected: 0,
    });
    const [recentUpdates, setRecentUpdates] = useState<AuditUpdate[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        // Conectar ao WebSocket
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
        const newSocket = io(`${socketUrl}/audit`, {
            query: { orgId },
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setConnected(true);

            // Inscrever em atualizações da organização
            newSocket.emit('subscribe', orgId);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        });

        // Listener para progresso
        newSocket.on('audit:progress', (update: AuditUpdate) => {
            setStats(prev => ({
                ...prev,
                progress: update.data.progress,
                status: 'running',
                message: update.data.message,
                lastUpdate: new Date(update.timestamp),
            }));

            addRecentUpdate(update);
        });

        // Listener para auditoria completa
        newSocket.on('audit:completed', (update: AuditUpdate) => {
            setStats(prev => ({
                ...prev,
                progress: 100,
                status: 'completed',
                message: `Auditoria completa! Score: ${update.data.conformityScore}%`,
                lastUpdate: new Date(update.timestamp),
            }));

            addRecentUpdate(update);
        });

        // Listener para falha
        newSocket.on('audit:failed', (update: AuditUpdate) => {
            setStats(prev => ({
                ...prev,
                status: 'failed',
                message: `Erro: ${update.data.error}`,
                lastUpdate: new Date(update.timestamp),
            }));

            addRecentUpdate(update);
        });

        // Listener para anomalia detectada
        newSocket.on('audit:anomaly', (update: AuditUpdate) => {
            setStats(prev => ({
                ...prev,
                anomaliesDetected: prev.anomaliesDetected + 1,
                lastUpdate: new Date(update.timestamp),
            }));

            addRecentUpdate(update);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [orgId]);

    const addRecentUpdate = (update: AuditUpdate) => {
        setRecentUpdates(prev => [update, ...prev].slice(0, 10)); // Manter últimas 10
    };

    const startAudit = async () => {
        try {
            setStats({
                progress: 0,
                status: 'running',
                anomaliesDetected: 0,
            });

            const response = await fetch('/api/permissions/audit/run', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orgId }),
            });

            if (!response.ok) {
                throw new Error('Erro ao iniciar auditoria');
            }
        } catch (error) {
            console.error('Erro:', error);
            setStats(prev => ({
                ...prev,
                status: 'failed',
                message: 'Erro ao iniciar auditoria',
            }));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'bg-blue-600';
            case 'completed':
                return 'bg-green-600';
            case 'failed':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
                return <Activity className="h-4 w-4 animate-pulse" />;
            case 'completed':
                return <RefreshCw className="h-4 w-4" />;
            case 'failed':
                return <Pause className="h-4 w-4" />;
            default:
                return <Play className="h-4 w-4" />;
        }
    };

    const getUpdateTypeLabel = (type: string) => {
        switch (type) {
            case 'progress':
                return 'Progresso';
            case 'completed':
                return 'Completo';
            case 'failed':
                return 'Falha';
            case 'anomaly_detected':
                return 'Anomalia';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-4">
            {/* Status de Conexão */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-muted-foreground">
                        {connected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
                    </Button>

                    <Button
                        onClick={startAudit}
                        disabled={stats.status === 'running'}
                        size="sm"
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Auditoria
                    </Button>
                </div>
            </div>

            {/* Card de Progresso */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {getStatusIcon(stats.status)}
                                Auditoria em Tempo Real
                            </CardTitle>
                            <CardDescription>
                                {stats.message || 'Aguardando início da auditoria'}
                            </CardDescription>
                        </div>
                        <Badge className={getStatusColor(stats.status)}>
                            {stats.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Progresso</span>
                                <span className="text-sm text-muted-foreground">{stats.progress}%</span>
                            </div>
                            <Progress value={stats.progress} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl font-bold">{stats.anomaliesDetected}</div>
                                <div className="text-sm text-muted-foreground">Anomalias Detectadas</div>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl font-bold">
                                    {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : '--:--'}
                                </div>
                                <div className="text-sm text-muted-foreground">Última Atualização</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feed de Atualizações */}
            <Card>
                <CardHeader>
                    <CardTitle>Atualizações Recentes</CardTitle>
                    <CardDescription>Últimas 10 atualizações em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentUpdates.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Nenhuma atualização ainda
                            </div>
                        ) : (
                            recentUpdates.map((update, index) => (
                                <Alert key={index}>
                                    <AlertDescription>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {getUpdateTypeLabel(update.type)}
                                                </Badge>
                                                <span className="text-sm">
                                                    {update.type === 'anomaly_detected'
                                                        ? `Anomalia: ${update.data.type || 'Detectada'}`
                                                        : update.type === 'progress'
                                                            ? `${update.data.progress}% - ${update.data.message || ''}`
                                                            : update.type === 'completed'
                                                                ? `Score: ${update.data.conformityScore}%`
                                                                : update.data.error}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(update.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
