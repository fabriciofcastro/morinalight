'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, AlertCircle, XCircle, Eye, Shield, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
    id: string;
    userId: string;
    ipAddress: string;
    country?: string;
    city?: string;
    deviceId?: string;
    createdAt: string;
    lastActivity: string;
    isActive: boolean;
}

interface Alert {
    id: string;
    userId: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    acknowledged: boolean;
    createdAt: string;
}

interface MonitoringStats {
    activeSessions: number;
    activeAlerts: number;
    recentAccesses: number;
    deniedAccesses: number;
    anomalies: number;
}

export function SecurityMonitoring() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [stats, setStats] = useState<MonitoringStats>({
        activeSessions: 0,
        activeAlerts: 0,
        recentAccesses: 0,
        deniedAccesses: 0,
        anomalies: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sessions' | 'alerts'>('sessions');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [sessionsRes, alertsRes, statsRes] = await Promise.all([
                fetch('/api/monitoring/active-sessions'),
                fetch('/api/monitoring/alerts?acknowledged=false'),
                fetch('/api/monitoring/stats'),
            ]);

            const [sessionsData, alertsData, statsData] = await Promise.all([
                sessionsRes.json(),
                alertsRes.json(),
                statsRes.json(),
            ]);

            setSessions(sessionsData.data || []);
            setAlerts(alertsData.data || []);
            setStats(statsData.data || stats);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKillSession = async (sessionId: string) => {
        if (!confirm('Tem certeza que deseja encerrar esta sessão?')) {
            return;
        }

        try {
            const res = await fetch(`/api/monitoring/kill-session/${sessionId}`, { method: 'POST' });
            if (!res.ok) throw new Error('Falha ao encerrar sessão');

            toast.success('Sessão encerrada com sucesso');
            await loadData();
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            toast.error('Erro ao encerrar sessão');
        }
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
                    reason: 'Bloqueio manual via Command Center',
                    durationMinutes: 1440, // 24h por padrão
                }),
            });

            if (!res.ok) throw new Error('Falha ao bloquear IP');

            toast.success(`IP ${ip} bloqueado com sucesso`);
            await loadData();
        } catch (error) {
            console.error('Erro ao bloquear IP:', error);
            toast.error('Erro ao bloquear IP');
        }
    };

    const handleAcknowledgeAlert = async (alertId: string) => {
        try {
            await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, { method: 'POST' });
            await loadData();
        } catch (error) {
            console.error('Erro ao reconhecer alerta:', error);
        }
    };

    const handleDismissAlert = async (alertId: string) => {
        try {
            await fetch(`/api/monitoring/alerts/${alertId}/dismiss`, { method: 'POST' });
            await loadData();
        } catch (error) {
            console.error('Erro ao descartar alerta:', error);
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Monitoramento em Tempo Real
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Sessões ativas e alertas de segurança
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sessões Ativas</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Ativos</p>
                            <p className="text-2xl font-bold text-red-600">{stats.activeAlerts}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Acessos (24h)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentAccesses}</p>
                        </div>
                        <Activity className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Negados (24h)</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.deniedAccesses}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Anomalias (24h)</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.anomalies}</p>
                        </div>
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sessions'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Sessões Ativas ({sessions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'alerts'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Alertas ({alerts.length})
                    </button>
                </nav>
            </div>

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Localização
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        IP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Última Atividade
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {session.userId.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {session.city && session.country ? `${session.city}, ${session.country}` : session.country || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                            {session.ipAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(session.lastActivity).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleBlockIp(session.ipAddress)}
                                                    className="p-1 px-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                                                    title="Bloquear IP"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                    BAN
                                                </button>
                                                <button
                                                    onClick={() => handleKillSession(session.id)}
                                                    className="p-1 px-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                                                    title="Encerrar sessão"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    KILL
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {sessions.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhuma sessão ativa
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertCircle className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-600' :
                                            alert.severity === 'high' ? 'text-orange-600' :
                                                alert.severity === 'medium' ? 'text-yellow-600' :
                                                    'text-blue-600'
                                            }`} />
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                                        </h4>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {alert.description}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleAcknowledgeAlert(alert.id)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Reconhecer"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDismissAlert(alert.id)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Descartar"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Nenhum alerta ativo - Sistema seguro
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
