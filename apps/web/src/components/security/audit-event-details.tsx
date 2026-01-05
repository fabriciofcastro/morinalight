'use client';

import { useState } from 'react';
import { X, MapPin, Clock, Shield, AlertTriangle, User, Monitor } from 'lucide-react';

interface AuditEvent {
    id: string;
    userId?: string;
    action: string;
    subject: string;
    resourceId?: string;
    effect: 'ALLOW' | 'DENY';
    reason?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    userAgent?: string;
    riskScore: number;
    anomalies: string[];
    isVpn: boolean;
    isProxy: boolean;
    isTor: boolean;
    context?: Record<string, any>;
    createdAt: string;
}

interface AuditEventDetailsProps {
    event: AuditEvent;
    onClose: () => void;
}

export function AuditEventDetails({ event, onClose }: AuditEventDetailsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'context' | 'security'>('overview');

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        if (score >= 30) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Detalhes do Evento de Auditoria
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(event.createdAt).toLocaleString('pt-BR')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('context')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'context'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Contexto
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'security'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Segurança
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Decision */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Decisão de Acesso
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Ação</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {event.action}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Recurso</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {event.subject}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Efeito</p>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${event.effect === 'ALLOW'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {event.effect === 'ALLOW' ? 'Permitido' : 'Negado'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Risk Score</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRiskColor(event.riskScore)}`}>
                                                {event.riskScore}
                                            </span>
                                        </div>
                                    </div>
                                    {event.reason && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Razão</p>
                                            <p className="text-sm text-gray-900 dark:text-white mt-1">{event.reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User & Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Usuário
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                                            {event.userId || 'Anônimo'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Localização
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {event.city && event.country
                                                ? `${event.city}, ${event.country}`
                                                : event.country || 'Desconhecida'}
                                        </p>
                                        {event.ipAddress && (
                                            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
                                                {event.ipAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Device */}
                            {event.userAgent && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <Monitor className="w-4 h-4" />
                                        Dispositivo
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                                            {event.userAgent}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'context' && (
                        <div className="space-y-4">
                            {event.context ? (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <pre className="text-xs font-mono text-gray-900 dark:text-white overflow-x-auto">
                                        {JSON.stringify(event.context, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Nenhum contexto adicional disponível
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Anomalies */}
                            {event.anomalies.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                        Anomalias Detectadas
                                    </h3>
                                    <div className="space-y-2">
                                        {event.anomalies.map((anomaly, index) => (
                                            <div
                                                key={index}
                                                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                                            >
                                                <p className="text-sm text-yellow-900 dark:text-yellow-400">
                                                    {anomaly.replace(/_/g, ' ').toUpperCase()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Security Flags */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Indicadores de Segurança
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className={`rounded-lg p-4 ${event.isVpn ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">VPN</p>
                                        <p className={`text-sm font-medium mt-1 ${event.isVpn ? 'text-orange-900 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                                            {event.isVpn ? 'Detectado' : 'Não detectado'}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg p-4 ${event.isProxy ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Proxy</p>
                                        <p className={`text-sm font-medium mt-1 ${event.isProxy ? 'text-orange-900 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                                            {event.isProxy ? 'Detectado' : 'Não detectado'}
                                        </p>
                                    </div>
                                    <div className={`rounded-lg p-4 ${event.isTor ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Tor</p>
                                        <p className={`text-sm font-medium mt-1 ${event.isTor ? 'text-red-900 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                            {event.isTor ? 'Detectado' : 'Não detectado'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Avaliação de Risco
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                                        <span className={`text-lg font-bold ${getRiskColor(event.riskScore)}`}>
                                            {event.riskScore}/100
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${event.riskScore >= 70
                                                    ? 'bg-red-600'
                                                    : event.riskScore >= 30
                                                        ? 'bg-yellow-600'
                                                        : 'bg-green-600'
                                                }`}
                                            style={{ width: `${event.riskScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
