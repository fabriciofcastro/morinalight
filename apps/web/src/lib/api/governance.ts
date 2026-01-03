
import { apiClient } from "./base";

export interface ApprovalWorkflow {
    id: string;
    module: string;
    fields: string[]; // JSON array
    approverRole: string;
    isActive: boolean;
}

export interface ApprovalRequestComment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        displayName: string;
        email: string;
        avatarUrl?: string;
    };
}

export interface ApprovalRequest {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
    data: any;
    createdAt: string;
    requester: {
        displayName: string;
        email: string;
        avatarUrl?: string;
    };
    workflow: ApprovalWorkflow;
}

export const governanceAPI = {
    getWorkflows: async (): Promise<ApprovalWorkflow[]> => {
        return await apiClient.get<ApprovalWorkflow[]>("/governance/workflows");
    },

    updateWorkflow: async (data: { module: string, fields: string[], approverRole: string }) => {
        return await apiClient.post<ApprovalWorkflow>("/governance/workflows", data);
    },

    getRequests: async (): Promise<ApprovalRequest[]> => {
        return await apiClient.get<ApprovalRequest[]>("/governance/requests");
    },

    approveRequest: async (requestId: string) => {
        return await apiClient.post<ApprovalRequest>(`/governance/requests/${requestId}/approve`);
    },

    rejectRequest: async (requestId: string) => {
        return await apiClient.post<ApprovalRequest>(`/governance/requests/${requestId}/reject`);
    },

    // Comments
    getComments: async (requestId: string): Promise<ApprovalRequestComment[]> => {
        return await apiClient.get<ApprovalRequestComment[]>(`/governance/requests/${requestId}/comments`);
    },

    createComment: async (requestId: string, content: string) => {
        return await apiClient.post<ApprovalRequestComment>(`/governance/requests/${requestId}/comments`, { content });
    },

    // Drafts
    submitRequest: async (requestId: string) => {
        return await apiClient.post<ApprovalRequest>(`/governance/requests/${requestId}/submit`);
    }
};
