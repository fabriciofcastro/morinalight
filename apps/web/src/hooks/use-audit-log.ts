import { useState, useEffect, useCallback } from "react";
import { auditLogApi } from "@/lib/api/audit-log";
import type { AuditLogEntry, AuditLogFilter } from "@/types/audit-log";

export function useAuditLog(filter?: AuditLogFilter) {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await auditLogApi.list(filter);
            setEntries(result.entries);
            setTotal(result.total);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error("Erro ao carregar logs de auditoria:", err);
            setError("Não foi possível carregar o histórico de alterações");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const refresh = useCallback(() => {
        fetchLogs();
    }, [fetchLogs]);

    const exportLogs = useCallback(
        async (format: "json" | "csv" = "json") => {
            try {
                const blob = await auditLogApi.export(filter, format);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `audit-log-${new Date().toISOString()}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (err) {
                console.error("Erro ao exportar logs:", err);
                throw err;
            }
        },
        [filter]
    );

    return {
        entries,
        loading,
        error,
        total,
        hasMore,
        refresh,
        exportLogs,
    };
}
