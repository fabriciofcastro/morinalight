"use client";

import type { AuditLogEntry } from "@/types/audit-log";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    Edit,
    Plus,
    RefreshCw,
    Trash,
    User,
} from "lucide-react";
import { useState } from "react";

interface AuditTimelineProps {
    entries: AuditLogEntry[];
    loading?: boolean;
    onRefresh?: () => void;
    onExport?: () => void;
}

const ACTION_LABELS: Record<string, string> = {
    create: "Criou",
    update: "Atualizou",
    delete: "Excluiu",
};

const ACTION_COLORS: Record<string, string> = {
    create: "bg-green-500",
    update: "bg-blue-500",
    delete: "bg-red-500",
};

const ACTION_ICONS: Record<string, any> = {
    create: Plus,
    update: Edit,
    delete: Trash,
};

function formatValue(value: any, type: string): string {
    if (value === null || value === undefined) return "-";

    switch (type) {
        case "boolean":
            return value ? "Sim" : "Não";
        case "date":
            return new Date(value).toLocaleString("pt-BR");
        case "object":
        case "array":
            return JSON.stringify(value, null, 2);
        default:
            return String(value);
    }
}

function AuditLogEntryCard({ entry }: { entry: AuditLogEntry }) {
    const [expanded, setExpanded] = useState(false);
    const ActionIcon = ACTION_ICONS[entry.action];
    const hasChanges = entry.changes && entry.changes.length > 0;

    return (
        <div className="relative pl-8 pb-8 group">
            {/* Timeline line */}
            <div className="absolute left-2 top-8 bottom-0 w-px bg-white/10 group-last:hidden" />

            {/* Timeline dot */}
            <div className={`absolute left-0 top-2 w-5 h-5 rounded-full ${ACTION_COLORS[entry.action]} flex items-center justify-center`}>
                <ActionIcon className="w-3 h-3 text-white" />
            </div>

            {/* Content card */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                                {ACTION_LABELS[entry.action]}
                            </span>
                            {hasChanges && (
                                <span className="text-xs text-white/60">
                                    • {entry.changes?.length || 0} alteraç{(entry.changes?.length || 0) === 1 ? "ão" : "ões"}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {entry.userName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(entry.timestamp), {
                                    addSuffix: true,
                                    locale: ptBR,
                                })}
                            </span>
                        </div>

                        {entry.metadata && (
                            <div className="mt-2 text-xs text-white/50">
                                {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                            </div>
                        )}
                    </div>

                    {hasChanges && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title={expanded ? "Recolher" : "Expandir"}
                        >
                            {expanded ? (
                                <ChevronUp className="w-4 h-4 text-white/70" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/70" />
                            )}
                        </button>
                    )}
                </div>

                {/* Changes detail */}
                {expanded && hasChanges && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {entry.changes?.map((change, idx) => (
                            <div key={idx} className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white/90">{change.fieldLabel}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-black/20 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-white/50 mb-1">Antes</p>
                                        <p className="text-white/70 font-mono text-xs break-all">
                                            {formatValue(change.oldValue, change.valueType)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50 mb-1">Depois</p>
                                        <p className="text-white/70 font-mono text-xs break-all">
                                            {formatValue(change.newValue, change.valueType)}
                                        </p>
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

export function AuditTimeline({
    entries,
    loading = false,
    onRefresh,
    onExport,
}: AuditTimelineProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Nenhuma alteração registrada</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header com ações */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Histórico de Alterações
                    </h3>
                    <p className="text-sm text-white/60 mt-1">
                        {entries.length} registro{entries.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex gap-2">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Atualizar"
                        >
                            <RefreshCw className="w-4 h-4 text-white/70" />
                        </button>
                    )}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Exportar"
                        >
                            <Download className="w-4 h-4 text-white/70" />
                        </button>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="mt-6">
                {entries.map((entry) => (
                    <AuditLogEntryCard key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    );
}
