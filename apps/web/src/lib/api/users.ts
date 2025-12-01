import { apiClient } from './base';

export interface User {
    userId: string;
    email: string;
    displayName: string;
    status: 'active' | 'inactive';
    createdAt: string;
    lastLogin?: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    displayName: string;
}

export interface UpdateUserRequest {
    displayName?: string;
    status?: 'active' | 'inactive';
}

export class UsersApi {
    async list(): Promise<User[]> {
        return apiClient.get<User[]>('/users');
    }

    async create(data: CreateUserRequest): Promise<User> {
        return apiClient.post<User>('/users', data);
    }

    async update(userId: string, data: UpdateUserRequest): Promise<User> {
        return apiClient.put<User>(`/users/${userId}`, data);
    }

    async delete(userId: string): Promise<void> {
        return apiClient.delete<void>(`/users/${userId}`);
    }
}

export const usersApi = new UsersApi();
