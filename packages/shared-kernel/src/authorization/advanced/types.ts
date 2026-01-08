/**
 * Advanced Security Types
 * PBAC, TBAC, ACL, AUBAC
 */

export type PolicyEffect = "ALLOW" | "DENY";

// ===== ROLES =====
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    USER: 'user',
    GUEST: 'guest',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export type LogicalOperator = "and" | "or" | "not";

export type ComparisonOperator =
    | "equals"
    | "notEquals"
    | "contains"
    | "notContains"
    | "in"
    | "notIn"
    | "greaterThan"
    | "lessThan";

export interface PolicyCondition {
    field: string;
    operator: ComparisonOperator;
    value: any;
}

export interface ComplexCondition {
    and?: (PolicyCondition | ComplexCondition)[];
    or?: (PolicyCondition | ComplexCondition)[];
    not?: PolicyCondition | ComplexCondition;
}

// PBAC: Policy-Based Access Control
export interface SecurityPolicy {
    id: string;
    name: string;
    description?: string;
    effect: PolicyEffect;
    action: string | string[];
    subject: string | string[];
    conditions?: ComplexCondition;
    priority: number; // For conflict resolution (Deny wins usually)
    orgId?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// TBAC: Time-Based Access Control
// TBAC: Time-Based Access Control
export interface TimeWindow {
    id?: string;
    orgId?: string;
    name?: string;
    startTime: string; // ISO format "HH:mm"
    endTime: string;   // ISO format "HH:mm"
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timezone?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// ACL: Access Control List (Instance-based)
export interface ObjectAccessEntry {
    id?: string;
    subject: string;
    subjectId: string;
    userId?: string;
    roleId?: string;
    action: string;
}

// Unified Context for evaluation
export interface SecurityContext {
    user: {
        id: string;
        role: string;
        departmentId?: string;
        sectorId?: string;
        attributes?: Record<string, any>; // AUBAC
    };
    environment: {
        time: Date;
        timeWindows?: TimeWindow[]; // TBAC Per-request context
        ip?: string;
        userAgent?: string;
        mfaVerified: boolean;
        riskScore?: number; // 0-100 (Dynamic Risk Scoring)
    };
}

/**
 * Interface for external decision providers (e.g., OPA)
 */
export interface DecisionProvider {
    name: string;
    evaluate(action: string, subject: string, context: SecurityContext, resource?: any): Promise<boolean | null>;
}

