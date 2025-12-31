import { apiClient } from "./client";
import type { AuditLogEntry, AuditLogFilter } from "@/types/audit-log";

export const auditLogApi = {
    /**
     * Lista logs de auditoria com filtros
     */
    async list(filter?: AuditLogFilter): Promise<{
        entries: AuditLogEntry[];
        total: number;
        hasMore: boolean;
    }> {
        const params = new URLSearchParams();

        if (filter?.entityType) params.append("entityType", filter.entityType);
        if (filter?.entityId) params.append("entityId", filter.entityId);
        if (filter?.userId) params.append("userId", filter.userId);
        if (filter?.action) params.append("action", filter.action);
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);
        if (filter?.limit) params.append("limit", filter.limit.toString());
        if (filter?.offset) params.append("offset", filter.offset.toString());

        const response = await apiClient.get<{
            entries: AuditLogEntry[];
            total: number;
            hasMore: boolean;
        }>(`/audit-log?${params.toString()}`);

        return response.data;
    },

    /**
     * Busca logs de auditoria de uma entidade específica
     */
    async getEntityHistory(
        entityType: string,
        entityId: string,
        limit = 50
    ): Promise<AuditLogEntry[]> {
        const response = await apiClient.get<AuditLogEntry[]>(
            `/audit-log/${entityType}/${entityId}?limit=${limit}`
        );
        return response.data;
    },

    /**
     * Exporta logs de auditoria
     */
    async export(filter?: AuditLogFilter, format: "json" | "csv" = "json"): Promise<Blob> {
        const params = new URLSearchParams();

        if (filter?.entityType) params.append("entityType", filter.entityType);
        if (filter?.entityId) params.append("entityId", filter.entityId);
        if (filter?.userId) params.append("userId", filter.userId);
        if (filter?.action) params.append("action", filter.action);
        if (filter?.startDate) params.append("startDate", filter.startDate);
        if (filter?.endDate) params.append("endDate", filter.endDate);
        params.append("format", format);

        const response = await apiClient.get(
            `/audit-log/export?${params.toString()}`,
            {
                responseType: "blob",
            }
        );

        return response.data;
    },
};
