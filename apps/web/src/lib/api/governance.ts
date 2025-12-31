
import { api } from "../api-client";

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
        const response = await api.get("/governance/workflows");
        return response.data;
    },

    updateWorkflow: async (data: { module: string, fields: string[], approverRole: string }) => {
        const response = await api.post("/governance/workflows", data);
        return response.data;
    },

    getRequests: async (): Promise<ApprovalRequest[]> => {
        const response = await api.get("/governance/requests");
        return response.data;
    },

    approveRequest: async (requestId: string) => {
        const response = await api.post(`/governance/requests/${requestId}/approve`);
        return response.data;
    },

    rejectRequest: async (requestId: string) => {
        const response = await api.post(`/governance/requests/${requestId}/reject`);
        return response.data;
    },

    // Comments
    getComments: async (requestId: string): Promise<ApprovalRequestComment[]> => {
        const response = await api.get(`/governance/requests/${requestId}/comments`);
        return response.data;
    },

    createComment: async (requestId: string, content: string) => {
        const response = await api.post(`/governance/requests/${requestId}/comments`, { content });
        return response.data;
    },

    // Drafts
    submitRequest: async (requestId: string) => {
        const response = await api.post(`/governance/requests/${requestId}/submit`);
        return response.data;
    }
};
