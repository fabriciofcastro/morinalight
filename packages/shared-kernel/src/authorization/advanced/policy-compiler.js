"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyCompiler = void 0;
/**
 * PolicyCompiler
 * Evaluates complex logical conditions for PBAC.
 */
class PolicyCompiler {
    /**
     * Evaluates a condition or a set of complex conditions against the context and object.
     */
    static evaluate(condition, context, resource) {
        // If it's a simple condition
        if ("field" in condition && "operator" in condition) {
            return this.evaluateSimpleCondition(condition, context, resource);
        }
        // If it's a complex condition (logical operators)
        const complex = condition;
        if (complex.and) {
            return complex.and.every(cond => this.evaluate(cond, context, resource));
        }
        if (complex.or) {
            return complex.or.some(cond => this.evaluate(cond, context, resource));
        }
        if (complex.not) {
            return !this.evaluate(complex.not, context, resource);
        }
        return true; // Default to true if empty condition
    }
    /**
     * Internal evaluator for simple field-operator-value conditions.
     */
    static evaluateSimpleCondition(condition, context, resource) {
        const { field, operator, value: targetValue } = condition;
        // Resolve field value (from context or resource)
        const fieldValue = this.resolveFieldValue(field, context, resource);
        switch (operator) {
            case "equals":
                return fieldValue === targetValue;
            case "notEquals":
                return fieldValue !== targetValue;
            case "contains":
                return Array.isArray(fieldValue) ? fieldValue.includes(targetValue) : String(fieldValue).includes(String(targetValue));
            case "greaterThan":
                return fieldValue > targetValue;
            case "lessThan":
                return fieldValue < targetValue;
            case "in":
                return Array.isArray(targetValue) && targetValue.includes(fieldValue);
            // Add more operators as needed
            default:
                return false;
        }
    }
    /**
     * Resolves a field name to a value.
     * Supports dot notation: "user.id", "resource.ownerId", "environment.time"
     */
    static resolveFieldValue(path, context, resource) {
        const parts = path.split(".");
        let current = { context, resource };
        for (const part of parts) {
            if (current === null || current === undefined)
                return undefined;
            // Map context and resource prefixes if missing (optional but recommended)
            if (part === "user" || part === "environment") {
                current = context[part];
            }
            else if (part === "resource") {
                current = resource;
            }
            else {
                current = current[part];
            }
        }
        return current;
    }
}
exports.PolicyCompiler = PolicyCompiler;
