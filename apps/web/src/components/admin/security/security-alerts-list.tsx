'use client';

import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import { Can } from '@/lib/auth/CaslContext';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface SecurityAlert {
    id: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    ipAddress?: string;
    createdAt: Date;
    acknowledged: boolean;
}

interface SecurityAlertsListProps {
    alerts: SecurityAlert[];
    onAcknowledge: (alertId: string) => void;
    loading?: boolean;
}

export function SecurityAlertsList({ alerts, onAcknowledge, loading }: SecurityAlertsListProps) {
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
            default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/20';
            case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
            default: return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta de segurança</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert, index) => (
                <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                        p-4 rounded-lg border
                        ${alert.acknowledged ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white/10 border-white/20'}
                    `}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{alert.alertType.replace(/_/g, ' ')}</h4>
                                    <Badge className={getSeverityColor(alert.severity)}>
                                        {alert.severity}
                                    </Badge>
                                    {alert.acknowledged && (
                                        <Badge variant="outline" className="text-xs">
                                            Reconhecido
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {alert.ipAddress && (
                                        <span>IP: {alert.ipAddress}</span>
                                    )}
                                    <span>{new Date(alert.createdAt).toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>
                        {!alert.acknowledged && (
                            <Can I="update" a={"Notification" as any}>
                                <Button
                                    onClick={() => onAcknowledge(alert.id)}
                                    disabled={loading}
                                    size="sm"
                                    variant="outline"
                                    className="border-white/10"
                                >
                                    Reconhecer
                                </Button>
                            </Can>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
