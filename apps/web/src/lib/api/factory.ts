/**
 * API Factory Pattern
 * 
 * Factory para criar API clients padronizados com tipos e métodos consistentes
 */

import { apiClient } from "./base";
import type { AxiosRequestConfig } from "axios";

/**
 * Parâmetros de query padrão
 */
export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    [key: string]: any;
}

/**
 * Response paginado padrão
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Response padrão da API
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * Interface do API Client
 */
export interface ApiClientMethods<T> {
    /**
     * Listar todos os recursos
     */
    list(params?: QueryParams, config?: AxiosRequestConfig): Promise<T[]>;

    /**
     * Listar com paginação
     */
    listPaginated(
        params?: QueryParams,
        config?: AxiosRequestConfig,
    ): Promise<PaginatedResponse<T>>;

    /**
     * Obter um recurso por ID
     */
    get(id: string, config?: AxiosRequestConfig): Promise<T>;

    /**
     * Criar um novo recurso
     */
    create(data: Partial<T>, config?: AxiosRequestConfig): Promise<T>;

    /**
     * Atualizar um recurso
     */
    update(id: string, data: Partial<T>, config?: AxiosRequestConfig): Promise<T>;

    /**
     * Atualizar parcialmente um recurso
     */
    patch(id: string, data: Partial<T>, config?: AxiosRequestConfig): Promise<T>;

    /**
     * Deletar um recurso
     */
    delete(id: string, config?: AxiosRequestConfig): Promise<void>;

    /**
     * Deletar múltiplos recursos
     */
    deleteMany(ids: string[], config?: AxiosRequestConfig): Promise<void>;
}

/**
 * Opções do factory
 */
export interface FactoryOptions {
    /**
     * Endpoint base (ex: '/users')
     */
    endpoint: string;

    /**
     * Se a API retorna dados paginados por padrão
     */
    defaultPaginated?: boolean;

    /**
     * Transformar response antes de retornar
     */
    transformResponse?: <T>(data: any) => T;
}

/**
 * Factory para criar API clients padronizados
 */
export function createApiClient<T>(options: FactoryOptions): ApiClientMethods<T> {
    const { endpoint, defaultPaginated = false, transformResponse } = options;

    const transform = <R>(data: any): R => {
        if (transformResponse) {
            return transformResponse(data);
        }
        return data;
    };

    return {
        async list(params, config) {
            const response = await apiClient.get<T[]>(endpoint, {
                ...config,
                params,
            });
            return transform<T[]>(response);
        },

        async listPaginated(params, config) {
            const response = await apiClient.get<PaginatedResponse<T>>(endpoint, {
                ...config,
                params: { ...params, paginated: true },
            });
            return transform<PaginatedResponse<T>>(response);
        },

        async get(id, config) {
            const response = await apiClient.get<T>(`${endpoint}/${id}`, config);
            return transform<T>(response);
        },

        async create(data, config) {
            const response = await apiClient.post<T>(endpoint, data, config);
            return transform<T>(response);
        },

        async update(id, data, config) {
            const response = await apiClient.put<T>(`${endpoint}/${id}`, data, config);
            return transform<T>(response);
        },

        async patch(id, data, config) {
            const response = await apiClient.patch<T>(`${endpoint}/${id}`, data, config);
            return transform<T>(response);
        },

        async delete(id, config) {
            await apiClient.delete(`${endpoint}/${id}`, config);
        },

        async deleteMany(ids, config) {
            await apiClient.post(`${endpoint}/delete-many`, { ids }, config);
        },
    };
}

/**
 * Helper para criar API client com tipos específicos
 */
export function createTypedApiClient<T>(endpoint: string, options?: Omit<FactoryOptions, "endpoint">) {
    return createApiClient<T>({
        endpoint,
        ...options,
    });
}
