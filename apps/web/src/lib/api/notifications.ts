import { apiClient } from './base';

export interface NotificationChannel {
    id: string;
    name: string;
    type: 'EMAIL' | 'PUSH' | 'IN_APP' | 'SMS' | 'WHATSAPP';
    status: 'ACTIVE' | 'INACTIVE';
    config?: string; // JSON config
}

export interface NotificationTemplate {
    id: string;
    code: string;
    name: string;
    subject: string;
    body: string;
    variables: string[]; // ['{{name}}', '{{orderId}}']
    channels: string[]; // channel IDs
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface NotificationLog {
    id: string;
    templateCode: string;
    recipient: string;
    channel: string;
    status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    sentAt?: string;
    readAt?: string;
    error?: string;
    metadata?: any;
    createdAt: string;
}

export const notificationsApi = {
    // Channels
    listChannels: async (orgId: string): Promise<NotificationChannel[]> => {
        return apiClient.get<NotificationChannel[]>('/notifications/channels', {
            headers: { 'x-org-id': orgId }
        });
    },

    updateChannel: async (orgId: string, id: string, data: Partial<NotificationChannel>): Promise<void> => {
        return apiClient.put(`/notifications/channels/${id}`, data, {
            headers: { 'x-org-id': orgId }
        });
    },

    // Templates
    listTemplates: async (orgId: string): Promise<NotificationTemplate[]> => {
        return apiClient.get<NotificationTemplate[]>('/notifications/templates', {
            headers: { 'x-org-id': orgId }
        });
    },

    createTemplate: async (orgId: string, data: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> => {
        return apiClient.post<NotificationTemplate>('/notifications/templates', data, {
            headers: { 'x-org-id': orgId }
        });
    },

    updateTemplate: async (orgId: string, id: string, data: Partial<NotificationTemplate>): Promise<void> => {
        return apiClient.put(`/notifications/templates/${id}`, data, {
            headers: { 'x-org-id': orgId }
        });
    },

    // Logs / History
    listLogs: async (orgId: string, query?: { page?: number, limit?: number, status?: string }): Promise<{ items: NotificationLog[], total: number }> => {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.status) params.append('status', query.status);

        return apiClient.get<{ items: NotificationLog[], total: number }>(`/notifications/logs?${params.toString()}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    // Actions
    sendBroadcast: async (orgId: string, data: { templateId: string, userIds?: string[], roleIds?: string[], message?: string }): Promise<void> => {
        return apiClient.post('/notifications/broadcast', data, {
            headers: { 'x-org-id': orgId }
        });
    }
};
