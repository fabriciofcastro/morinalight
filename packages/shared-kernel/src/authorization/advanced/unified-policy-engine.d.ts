import { SecurityContext, SecurityPolicy, TimeWindow, ObjectAccessEntry } from "./types";
/**
 * UnifiedPolicyEngine
 * Orchestrates PBAC, TBAC, and ACL evaluations.
 */
export declare class UnifiedPolicyEngine {
    private policies;
    private timeWindows;
    private aclEntries;
    /**
     * Set global security policies (PBAC)
     */
    setPolicies(policies: SecurityPolicy[]): void;
    /**
     * Set active time windows (TBAC)
     */
    setTimeWindows(windows: TimeWindow[]): void;
    /**
     * Set ACL entries (Instance-based)
     */
    setAclEntries(entries: ObjectAccessEntry[]): void;
    /**
     * Evaluates if an action on a subject is permitted.
     * Deny wins principle.
     */
    evaluate(action: string, subject: string, context: SecurityContext, resource?: any): boolean;
}
export declare const unifiedPolicyEngine: UnifiedPolicyEngine;
