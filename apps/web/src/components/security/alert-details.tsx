'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Clock, User, MapPin } from 'lucide-react';

interface Alert {
    id: string;
    userId: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    resolution?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

interface AlertDetailsProps {
    alert: Alert;
    onClose: () => void;
    onAcknowledge?: (alertId: string) => void;
    onResolve?: (alertId: string, resolution: string) => void;
    onDismiss?: (alertId: string) => void;
}

export function AlertDetails({
    alert,
    onClose,
    onAcknowledge,
    onResolve,
    onDismiss,
}: AlertDetailsProps) {
    const [resolution, setResolution] = useState('');
    const [showResolveForm, setShowResolveForm] = useState(false);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'unusual_location':
                return <MapPin className="w-5 h-5" />;
            case 'multiple_failed_logins':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    const handleResolve = () => {
        if (resolution.trim() && onResolve) {
            onResolve(alert.id, resolution);
            setShowResolveForm(false);
            setResolution('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className={`px-6 py-4 border-b ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            {getAlertIcon(alert.alertType)}
                            <div>
                                <h2 className="text-xl font-bold">
                                    {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                                </h2>
                                <p className="text-sm mt-1 opacity-90">
                                    {new Date(alert.createdAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                        </h3>
                        <p className="text-gray-900 dark:text-white">{alert.description}</p>
                    </div>

                    {/* User */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Usuário Afetado
                        </h3>
                        <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            {alert.userId}
                        </p>
                    </div>

                    {/* Metadata */}
                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Informações Adicionais
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                                {Object.entries(alert.metadata).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {key.replace(/_/g, ' ')}:
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                        {alert.acknowledged && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                                        Reconhecido
                                    </h4>
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-500">
                                    Por: {alert.acknowledgedBy}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-500">
                                    Em: {alert.acknowledgedAt && new Date(alert.acknowledgedAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        )}

                        {alert.resolved && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <h4 className="text-sm font-medium text-green-900 dark:text-green-400">
                                        Resolvido
                                    </h4>
                                </div>
                                <p className="text-xs text-green-700 dark:text-green-500">
                                    Por: {alert.resolvedBy}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-500">
                                    Em: {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleString('pt-BR')}
                                </p>
                                {alert.resolution && (
                                    <p className="text-xs text-green-700 dark:text-green-500 mt-2">
                                        Resolução: {alert.resolution}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Resolve Form */}
                    {showResolveForm && !alert.resolved && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Resolver Alerta
                            </h4>
                            <textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Descreva como o alerta foi resolvido..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                rows={3}
                            />
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleResolve}
                                    disabled={!resolution.trim()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    Confirmar Resolução
                                </button>
                                <button
                                    onClick={() => {
                                        setShowResolveForm(false);
                                        setResolution('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <div className="flex gap-2">
                        {!alert.acknowledged && onAcknowledge && (
                            <button
                                onClick={() => onAcknowledge(alert.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reconhecer
                            </button>
                        )}
                        {!alert.resolved && onResolve && (
                            <button
                                onClick={() => setShowResolveForm(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Resolver
                            </button>
                        )}
                        {!alert.resolved && onDismiss && (
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Descartar
                            </button>
                        )}
                    </div>
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
