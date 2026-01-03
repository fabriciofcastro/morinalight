import { apiClient } from './base';

export interface Client {
    id: string;
    orgId: string;
    name: string;
    email?: string;
    phone?: string;
    document?: string; // CPF/CNPJ
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;

    // CRM
    status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'BLOCKED';
    type: 'PF' | 'PJ';
    notes?: string;
    lastContact?: string;

    // Sales
    totalPurchases: number;
    creditLimit?: number;

    createdAt: string;
    updatedAt: string;
}

export interface CreateClientInput {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'BLOCKED';
    type: 'PF' | 'PJ';
    notes?: string;
    creditLimit?: number;
}

export interface UpdateClientInput extends Partial<CreateClientInput> { }

export interface ListClientsQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    city?: string;
    state?: string;
}

export interface ListClientsResponse {
    items: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Keeping legacy types just in case, but marking as deprecated if needed or removing if unused. 
// For now, I'll focus on the new standard.

export const clientsApi = {
    list: async (orgId: string, query?: ListClientsQuery): Promise<ListClientsResponse> => {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.status) params.append('status', query.status);
        if (query?.city) params.append('city', query.city);
        if (query?.state) params.append('state', query.state);

        return apiClient.get<ListClientsResponse>(`/clients?${params.toString()}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getById: async (orgId: string, id: string): Promise<Client> => {
        return apiClient.get<Client>(`/clients/${id}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    create: async (orgId: string, data: CreateClientInput): Promise<Client> => {
        return apiClient.post<Client>('/clients', data, {
            headers: { 'x-org-id': orgId }
        });
    },

    update: async (orgId: string, id: string, data: UpdateClientInput): Promise<Client> => {
        return apiClient.put<Client>(`/clients/${id}`, data, {
            headers: { 'x-org-id': orgId }
        });
    },

    delete: async (orgId: string, id: string): Promise<void> => {
        return apiClient.delete(`/clients/${id}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getStats: async (orgId: string): Promise<{ total: number; active: number; leads: number }> => {
        return apiClient.get<{ total: number; active: number; leads: number }>('/clients/stats', {
            headers: { 'x-org-id': orgId }
        });
    }
};
