/**
 * Advanced Security Types
 * PBAC, TBAC, ACL, AUBAC
 */
export type PolicyEffect = "ALLOW" | "DENY";
export type LogicalOperator = "and" | "or" | "not";
export type ComparisonOperator = "equals" | "notEquals" | "contains" | "notContains" | "in" | "notIn" | "greaterThan" | "lessThan";
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
export interface SecurityPolicy {
    id: string;
    name: string;
    description?: string;
    effect: PolicyEffect;
    action: string | string[];
    subject: string | string[];
    conditions?: ComplexCondition;
    priority: number;
}
export interface TimeWindow {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone?: string;
}
export interface ObjectAccessEntry {
    id?: string;
    subject: string;
    subjectId: string;
    userId?: string;
    roleId?: string;
    action: string;
}
export interface SecurityContext {
    user: {
        id: string;
        role: string;
        departmentId?: string;
        sectorId?: string;
        attributes?: Record<string, any>;
    };
    environment: {
        time: Date;
        ip?: string;
        userAgent?: string;
        mfaVerified: boolean;
    };
}
