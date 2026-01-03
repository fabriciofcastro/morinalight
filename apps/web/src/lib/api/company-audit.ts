import type {
    CompanyAuditLog,
    AuditLogListResponse,
    AuditLogFilters,
} from "@/types/audit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

class CompanyAuditAPI {
    /**
     * Listar logs de auditoria com filtros
     */
    async getLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
        const query = new URLSearchParams(
            Object.entries(filters).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>)
        ).toString();

        const response = await fetch(
            `${API_BASE_URL}/company-settings/audit?${query}`,
            {
                credentials: "include",
                headers: {
                    "x-org-id": process.env.NEXT_PUBLIC_ORG_ID || "org-demo",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar logs: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Exportar logs como CSV
     */
    async exportCSV(): Promise<Blob> {
        const response = await fetch(
            `${API_BASE_URL}/company-settings/audit/export`,
            {
                credentials: "include",
                headers: {
                    "x-org-id": process.env.NEXT_PUBLIC_ORG_ID || "org-demo",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Erro ao exportar logs: ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Download do CSV
     */
    async downloadCSV(filename = `audit-${Date.now()}.csv`): Promise<void> {
        const blob = await this.exportCSV();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const companyAuditAPI = new CompanyAuditAPI();
