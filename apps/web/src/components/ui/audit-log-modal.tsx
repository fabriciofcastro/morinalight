"use client";

import { useState } from "react";
import { X, History } from "lucide-react";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import { useAuditLog } from "@/hooks/use-audit-log";
import { notificationCenter } from "@/lib/notification-center";

interface AuditLogModalProps {
    entityType: string;
    entityId: string;
    entityName?: string;
    onClose: () => void;
}

export function AuditLogModal({
    entityType,
    entityId,
    entityName,
    onClose,
}: AuditLogModalProps) {
    const { entries, loading, refresh, exportLogs } = useAuditLog({
        entityType,
        entityId,
        limit: 100,
    });

    const handleExport = async () => {
        try {
            await exportLogs("json");
            notificationCenter.add({
                type: "success",
                title: "Exportado",
                message: "Histórico exportado com sucesso",
            });
        } catch (error) {
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: "Não foi possível exportar o histórico",
            });
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <History className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Histórico de Alterações</h2>
                            {entityName && (
                                <p className="text-sm text-white/60">{entityName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AuditTimeline
                        entries={entries}
                        loading={loading}
                        onRefresh={refresh}
                        onExport={handleExport}
                    />
                </div>
            </div>
        </div>
    );
}
