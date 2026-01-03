'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackupCodesDisplayProps {
    codes: string[];
    onDownload?: () => void;
    onClose?: () => void;
}

export function BackupCodesDisplay({ codes, onDownload, onClose }: BackupCodesDisplayProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (code: string, index: number) => {
        await navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(codes.join('\n'));
        setCopiedIndex(-1);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `morinalight-backup-codes-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        onDownload?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-yellow-500/20"
        >
            {/* Warning Header */}
            <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-yellow-500 mb-1">Códigos de Backup</h3>
                    <p className="text-sm text-gray-300">
                        Guarde estes códigos em um local seguro. Cada código pode ser usado apenas uma vez.
                    </p>
                </div>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {codes.map((code, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                    >
                        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                            <code className="text-sm font-mono text-blue-400">{code}</code>
                            <button
                                onClick={() => handleCopy(code, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                aria-label="Copy code"
                            >
                                {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleCopyAll}
                    variant="outline"
                    className="flex-1 border-white/10"
                >
                    {copiedIndex === -1 ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Todos
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 border-white/10"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                </Button>
            </div>

            {onClose && (
                <Button
                    onClick={onClose}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                >
                    Entendi, Guardei os Códigos
                </Button>
            )}
        </motion.div>
    );
}
