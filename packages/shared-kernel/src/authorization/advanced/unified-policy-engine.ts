import { PolicyCompiler } from "./policy-compiler";
import { TemporalEvaluator } from "./temporal-evaluator";
import { DecisionProvider, ObjectAccessEntry, SecurityContext, SecurityPolicy, TimeWindow } from "./types";

/**
 * UnifiedPolicyEngine
 * Orchestrates PBAC, TBAC, and ACL evaluations.
 */
export class UnifiedPolicyEngine {
    private policies: SecurityPolicy[] = [];
    private timeWindows: TimeWindow[] = [];
    private aclEntries: ObjectAccessEntry[] = [];
    private providers: DecisionProvider[] = [];

    /**
     * Register an external decision provider (e.g. OPA)
     */
    registerProvider(provider: DecisionProvider): void {
        this.providers.push(provider);
    }

    /**
     * Set global security policies (PBAC)
     */
    setPolicies(policies: SecurityPolicy[]): void {
        this.policies = [...policies].sort((a, b) => b.priority - a.priority);
    }

    /**
     * Set active time windows (TBAC)
     */
    setTimeWindows(windows: TimeWindow[]): void {
        this.timeWindows = windows;
    }

    /**
     * Set ACL entries (Instance-based)
     */
    setAclEntries(entries: ObjectAccessEntry[]): void {
        this.aclEntries = entries;
    }

    /**
     * Asynchronously evaluates if an action on a subject is permitted.
     * Incorporates external providers (OPA) and risk-based logic.
     */
    async evaluateAsync(action: string, subject: string, context: SecurityContext, resource?: any): Promise<boolean> {
        // 0. Risk-Based Block (Dynamic Risk Scoring)
        if (context.environment.riskScore !== undefined && context.environment.riskScore > 90) {
            return false; // Extreme risk: block everything
        }

        // 1. External Providers (Hybrid OPA)
        for (const provider of this.providers) {
            const decision = await provider.evaluate(action, subject, context, resource);
            if (decision === false) return false; // Fail fast on deny
            if (decision === true) return true;  // Explicit allow from provider
        }

        // Fallback to internal synchronous evaluation
        return this.evaluate(action, subject, context, resource);
    }

    /**
     * Evaluates if an action on a subject is permitted.
     * Deny wins principle.
     */
    evaluate(action: string, subject: string, context: SecurityContext, resource?: any): boolean {
        // 0. Risk-Based Restricted (Medium Risk)
        if (context.environment.riskScore !== undefined && context.environment.riskScore > 70) {
            // Block sensitive actions if risk is medium-high
            const sensitiveActions = ['delete', 'manage', 'export', 'publish'];
            if (sensitiveActions.includes(action)) return false;
        }

        // 1. TBAC Check (Time-Based)
        // Check per-request windows (e.g. user shift) or fallback to global system windows
        const activeTimeWindows = context.environment.timeWindows ?? this.timeWindows;

        if (activeTimeWindows.length > 0 && !TemporalEvaluator.isWithinAllowedWindows(context.environment.time, activeTimeWindows)) {
            return false; // Denied by time
        }

        // 2. ACL Check (Object-Level)
        // If a specific entry exists for this object, it takes precedence in some systems
        // Here we'll treat it as a whitelist if entries exist for the subject
        if (resource?.id) {
            const explicitEntry = this.aclEntries.find(entry =>
                entry.subject === subject &&
                entry.subjectId === resource.id &&
                (entry.userId === context.user.id || (entry.roleId && entry.roleId === context.user.role)) &&
                entry.action === action
            );
            if (explicitEntry) return true; // Explicitly allowed by ACL
        }

        // 3. PBAC Check (Policy-Based)
        // Check for ANY Deny policy that matches
        const matchesSubject = (p: SecurityPolicy) =>
            Array.isArray(p.subject) ? p.subject.includes(subject) : p.subject === subject || p.subject === "all";

        const matchesAction = (p: SecurityPolicy) =>
            Array.isArray(p.action) ? p.action.includes(action) : p.action === action || p.action === "manage";

        const matchingPolicies = this.policies.filter(p => matchesSubject(p) && matchesAction(p));

        // Deny wins logic
        const denyPolicy = matchingPolicies.find(p => p.effect === "DENY" && PolicyCompiler.evaluate(p.conditions || {}, context, resource));
        if (denyPolicy) return false;

        // Check for Allow policy
        const allowPolicy = matchingPolicies.find(p => p.effect === "ALLOW" && PolicyCompiler.evaluate(p.conditions || {}, context, resource));

        return !!allowPolicy;
    }
}

// Global instance for the application
export const unifiedPolicyEngine = new UnifiedPolicyEngine();
