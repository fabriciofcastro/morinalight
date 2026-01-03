
import { apiClient } from "./base";
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
        return apiClient.get<CompanyVersion[]>("/company-settings/snapshots");
    },

    createSnapshot: async (name?: string) => {
        return apiClient.post("/company-settings/snapshots", { name });
    },

    restoreVersion: async (versionId: string) => {
        return apiClient.post(`/company-settings/snapshots/${versionId}/restore`);
    }
};
