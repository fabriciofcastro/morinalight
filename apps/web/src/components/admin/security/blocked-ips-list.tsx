'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlockedIP {
    ip: string;
    reason: string;
    blockedAt: Date;
    expiresAt?: Date;
    permanent: boolean;
}

interface BlockedIPsListProps {
    blockedIPs: BlockedIP[];
    onUnblock: (ip: string) => void;
    loading?: boolean;
}

export function BlockedIPsList({ blockedIPs, onUnblock, loading }: BlockedIPsListProps) {
    const getTimeRemaining = (expiresAt?: Date) => {
        if (!expiresAt) return null;

        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) return 'Expirado';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (blockedIPs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum IP bloqueado</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {blockedIPs.map((blockedIP, index) => (
                <motion.div
                    key={blockedIP.ip}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <code className="text-lg font-mono text-blue-400">{blockedIP.ip}</code>
                                {blockedIP.permanent ? (
                                    <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
                                        Permanente
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                                        Temporário
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{blockedIP.reason}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Bloqueado: {new Date(blockedIP.blockedAt).toLocaleString('pt-BR')}
                                </span>
                                {!blockedIP.permanent && blockedIP.expiresAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Expira em: {getTimeRemaining(blockedIP.expiresAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() => onUnblock(blockedIP.ip)}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="border-white/10"
                        >
                            <Unlock className="w-4 h-4 mr-2" />
                            Desbloquear
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
