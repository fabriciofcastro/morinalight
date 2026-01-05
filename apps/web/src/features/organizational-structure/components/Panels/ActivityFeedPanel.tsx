"use client";

import { useInterval } from "@morina/ui"; // Assuming useInterval exists or I'll implement polling with useEffect
import { GlassCard, cn } from "@morina/ui";
import { Activity, Clock, User, FileEdit, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type AuditLog = {
    id: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    performedBy: string;
    performedByEmail?: string | null;
    performedAt: string;
    reason?: string | null;
    entityType?: string;
    entityId?: string;
    action?: string;
};

interface ActivityFeedPanelProps {
    className?: string;
}

export function ActivityFeedPanel({ className }: ActivityFeedPanelProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const loadActivity = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const headers = {
                ...getAuthHeadersWithTenant(),
                "Content-Type": "application/json",
            };

            // Fetch specifically for feed (no filters, just latest)
            const params = new URLSearchParams();
            params.set("limite", "20"); // Limit to recent 20

            const response = await fetch(`/api/organizational-structure/audit?${params.toString()}`, { headers });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.itens || []);
                setLastRefreshed(new Date());
            }
        } catch (e) {
            console.error("Failed to fetch activity feed", e);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        void loadActivity();
    }, [loadActivity]);

    // Polling every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            void loadActivity(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [loadActivity]);


    return (
        <GlassCard className={cn("p-4 flex flex-col h-full max-h-[600px]", className)}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                        LIVE
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {loading && logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-white/30 text-xs">
                        <Clock className="w-6 h-6 mb-2 animate-spin" />
                        Carregando feed...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-white/30 text-xs py-8">
                        Nenhuma atividade recente.
                    </div>
                ) : (
                    logs.map((log, idx) => (
                        <div key={log.id} className="relative pl-4 border-l border-white/10 last:border-0 pb-4 last:pb-0 group">
                            {/* Timeline dot */}
                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-white/10 bg-[#0f172a] group-hover:bg-[hsl(var(--primary))] group-hover:border-[hsl(var(--primary))] transition-colors" />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium text-white/90 truncate max-w-[200px]" title={log.entityType}>
                                        {getEntityLabel(log.entityType)}
                                    </span>
                                    <span className="text-[10px] text-white/40 whitespace-nowrap" title={new Date(log.performedAt).toLocaleString()}>
                                        {formatDistanceToNow(new Date(log.performedAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>

                                <div className="text-xs text-white/60 leading-relaxed break-words">
                                    {formatActionDescription(log)}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="h-4 w-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/70">
                                        {log.performedByEmail ? log.performedByEmail.charAt(0).toUpperCase() : <User className="h-2 w-2" />}
                                    </div>
                                    <span className="text-[10px] text-white/40 truncate max-w-[150px]">
                                        {log.performedByEmail || log.performedBy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/20 text-center font-mono">
                Atualizado: {lastRefreshed.toLocaleTimeString()}
            </div>
        </GlassCard>
    );
}

function getEntityLabel(type?: string) {
    if (!type) return "Entidade";
    const map: Record<string, string> = {
        department: "Departamento",
        subdepartment: "Subdepartamento",
        sector: "Setor",
        position: "Cargo"
    };
    return map[type] || type;
}

function formatActionDescription(log: AuditLog) {
    const field = log.field;

    if (log.action === 'CREATE' || field === 'created') return <span className="text-green-400">Criado novo item</span>;
    if (log.action === 'DELETE' || field === 'deleted') return <span className="text-red-400">Removido item</span>;

    if (log.oldValue && log.newValue) {
        return (
            <span>
                Alterou <span className="text-white/80 font-mono">{field}</span> de <span className="text-red-300 line-through opacity-70">{log.oldValue}</span> para <span className="text-green-300">{log.newValue}</span>
            </span>
        );
    }

    return <span>Alterou {field}</span>;
}
