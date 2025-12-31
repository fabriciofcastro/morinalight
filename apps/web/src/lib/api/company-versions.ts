
import { api } from "../api-client";
import { CompanySettingsFormData } from "@/schemas/company-settings-advanced";

export interface CompanyVersion {
    id: string;
    version: number;
    name?: string;
    createdAt: string;
    restoredAt?: string;
    creator: {
        displayName: string;
        email: string;
        avatarUrl?: string;
    };
    snapshot: CompanySettingsFormData;
}

export const companyVersionsAPI = {
    getVersions: async (): Promise<CompanyVersion[]> => {
        const response = await api.get("/company-settings/snapshots");
        return response.data;
    },

    createSnapshot: async (name?: string) => {
        const response = await api.post("/company-settings/snapshots", { name });
        return response.data;
    },

    restoreVersion: async (versionId: string) => {
        const response = await api.post(`/company-settings/snapshots/${versionId}/restore`);
        return response.data;
    }
};
