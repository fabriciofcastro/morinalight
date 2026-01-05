'use client';

import { useSecurityEvents } from '@/hooks/use-security-websocket';
import { Activity, Wifi, WifiOff, Bell, TrendingUp, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface LiveActivityFeedProps {
    orgId: string;
}

export function LiveActivityFeed({ orgId }: LiveActivityFeedProps) {
    const { connected, recentEvents, stats, clearEvents } = useSecurityEvents(orgId);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'session_created':
                return '👤';
            case 'session_ended':
                return '🚪';
            case 'alert_created':
                return '🚨';
            case 'access_denied':
                return '🚫';
            case 'anomaly_detected':
                return '⚠️';
            case 'high_risk_access':
                return '🔴';
            default:
                return '📋';
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'session_created':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'session_ended':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            case 'alert_created':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'access_denied':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'anomaly_detected':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'high_risk_access':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const getEventTitle = (type: string) => {
        // ... switch existente
    };

    const handleBlockIp = async (ip: string) => {
        if (!confirm(`Deseja realmente bloquear o IP ${ip}? Este acesso será interrompido permanentemente.`)) {
            return;
        }

        try {
            const res = await fetch('/api/security/blocked-ips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip,
                    reason: 'Bloqueio rápido via Live Feed',
                    durationMinutes: 1440,
                }),
            });

            if (!res.ok) throw new Error('Falha ao bloquear IP');
            toast.success(`IP ${ip} bloqueado com sucesso`);
        } catch (error) {
            console.error('Erro ao bloquear IP:', error);
            toast.error('Erro ao bloquear IP');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Atividade ao Vivo
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {connected ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm font-medium">Conectado</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-600">
                                <WifiOff className="w-4 h-4" />
                                <span className="text-sm font-medium">Desconectado</span>
                            </div>
                        )}
                        {recentEvents.length > 0 && (
                            <button
                                onClick={clearEvents}
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Sessões Ativas</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeSessions || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Alertas Ativos</p>
                            <p className="text-xl font-bold text-red-600">{stats.activeAlerts || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Acessos Recentes</p>
                            <p className="text-xl font-bold text-blue-600">{stats.recentAccesses || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Feed */}
            <div className="max-h-[600px] overflow-y-auto">
                {recentEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            {connected ? 'Aguardando eventos...' : 'Conecte-se para ver eventos ao vivo'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentEvents.map((event, index) => (
                            <div
                                key={index}
                                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors animate-fadeIn"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-2xl">{getEventIcon(event.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                                                {getEventTitle(event.type)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {event.type === 'session_created' && (
                                                <p>Usuário conectou de {event.data.city || event.data.country || 'localização desconhecida'}</p>
                                            )}
                                            {event.type === 'session_ended' && (
                                                <p>Sessão encerrada: {event.data.sessionId?.substring(0, 8)}...</p>
                                            )}
                                            {event.type === 'alert_created' && (
                                                <p>{event.data.description || 'Novo alerta de segurança'}</p>
                                            )}
                                            {event.type === 'access_denied' && (
                                                <p>Acesso negado: {event.data.reason || 'Sem permissão'}</p>
                                            )}
                                            {event.type === 'anomaly_detected' && (
                                                <p>Anomalia: {event.data.anomalies?.join(', ') || 'Comportamento suspeito'}</p>
                                            )}
                                            {event.type === 'high_risk_access' && (
                                                <p>Acesso de alto risco (score: {event.data.riskScore})</p>
                                            )}
                                        </div>
                                        {event.data.ipAddress && (
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-500 font-mono">
                                                    IP: {event.data.ipAddress}
                                                </p>
                                                {(event.type === 'high_risk_access' || event.type === 'anomaly_detected' || event.type === 'access_denied') && (
                                                    <button
                                                        onClick={() => handleBlockIp(event.data.ipAddress)}
                                                        className="flex items-center gap-1 text-[10px] font-black text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded border border-red-200 transition-colors"
                                                    >
                                                        <Ban className="w-2.5 h-2.5" />
                                                        BAN IP
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
