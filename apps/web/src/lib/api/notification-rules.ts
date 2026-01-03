import { apiClient as api } from "./base";

export enum RuleScope {
    GLOBAL = 'GLOBAL',
    DEPARTMENT = 'DEPARTMENT',
    ROLE = 'ROLE',
    USER = 'USER',
    AD_HOC = 'AD_HOC',
}

export interface NotificationRule {
    id: string;
    tenantId: string;
    templateId?: string;
    name: string;
    description?: string;
    eventType: string;
    scope: RuleScope;
    targetValue?: string;
    filterExpression?: any;
    customTitle?: string;
    customMessage?: string;
    priority: number;
    active: boolean;
    channels: string[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string;
    version: number;
    template?: NotificationTemplate;
    executions?: NotificationRuleExecution[];
}

export interface NotificationTemplate {
    id: string;
    tenantId: string;
    name: string;
    title: string;
    message: string;
    variables: string[];
    category?: string;
    active: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    version: number;
}

export interface NotificationRuleExecution {
    id: string;
    ruleId: string;
    eventType: string;
    payload: any;
    matched: boolean;
    recipients: number;
    created: number;
    error?: string;
    executedAt: string;
    duration?: number;
}

export interface CreateNotificationRuleDto {
    name: string;
    description?: string;
    eventType: string;
    scope: RuleScope;
    targetValue?: string;
    filterExpression?: any;
    templateId?: string;
    customTitle?: string;
    customMessage?: string;
    priority?: number;
    active?: boolean;
    channels?: string[];
    tenantId?: string;
}

export interface UpdateNotificationRuleDto {
    name?: string;
    description?: string;
    eventType?: string;
    scope?: RuleScope;
    targetValue?: string;
    filterExpression?: any;
    templateId?: string;
    customTitle?: string;
    customMessage?: string;
    priority?: number;
    active?: boolean;
    channels?: string[];
}

export interface TestRuleDto {
    testPayload: any;
}

export interface TestRuleResult {
    matched: boolean;
    recipients: string[];
    renderedMessage: {
        title: string;
        message: string;
        link?: string;
    };
    filterResult?: boolean;
}

/**
 * Notification Rules API Client
 */
export const notificationRulesApi = {
    create: async (data: CreateNotificationRuleDto): Promise<NotificationRule> => {
        return api.post<NotificationRule>('/notification-rules', data);
    },

    findAll: async (params?: {
        active?: boolean;
        eventType?: string;
        scope?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: NotificationRule[]; total: number }> => {
        return api.get<{ data: NotificationRule[]; total: number }>('/notification-rules', { params });
    },

    findOne: async (id: string): Promise<NotificationRule> => {
        return api.get<NotificationRule>(`/notification-rules/${id}`);
    },

    update: async (id: string, data: UpdateNotificationRuleDto): Promise<NotificationRule> => {
        return api.patch<NotificationRule>(`/notification-rules/${id}`, data);
    },

    remove: async (id: string): Promise<void> => {
        return api.delete(`/notification-rules/${id}`);
    },

    toggleActive: async (id: string, active: boolean): Promise<NotificationRule> => {
        return api.patch<NotificationRule>(`/notification-rules/${id}/toggle`, { active });
    },

    testRule: async (id: string, testPayload: any): Promise<{ message: string; result: TestRuleResult }> => {
        return api.post<{ message: string; result: TestRuleResult }>(`/notification-rules/${id}/test`, { query: { testPayload } });
    },

    getAvailableEvents: async (): Promise<{ events: string[] }> => {
        return api.get<{ events: string[] }>('/notification-rules/meta/events');
    },

    getExecutions: async (id: string, limit?: number): Promise<NotificationRuleExecution[]> => {
        return api.get<NotificationRuleExecution[]>(`/notification-rules/${id}/executions`, { params: { limit } });
    },
};
