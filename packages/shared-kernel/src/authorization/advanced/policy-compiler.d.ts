import { ComplexCondition, PolicyCondition, SecurityContext } from "./types";
/**
 * PolicyCompiler
 * Evaluates complex logical conditions for PBAC.
 */
export declare class PolicyCompiler {
    /**
     * Evaluates a condition or a set of complex conditions against the context and object.
     */
    static evaluate(condition: ComplexCondition | PolicyCondition, context: SecurityContext, resource?: any): boolean;
    /**
     * Internal evaluator for simple field-operator-value conditions.
     */
    private static evaluateSimpleCondition;
    /**
     * Resolves a field name to a value.
     * Supports dot notation: "user.id", "resource.ownerId", "environment.time"
     */
    private static resolveFieldValue;
}
