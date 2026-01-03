/**
 * ABAC (Attribute-Based Access Control) Engine
 * 
 * Sistema de controle de acesso baseado em atributos para regras complexas
 */

export interface ABACCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
    value: any;
}

export interface ABACPolicy {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
    conditions: ABACCondition[];
    effect: 'allow' | 'deny';
}

export interface ABACContext {
    user: any;
    resource: any;
    context?: any;
}

export class ABACEngine {
    private policies: Map<string, ABACPolicy> = new Map();

    /**
     * Registra uma política
     */
    registerPolicy(policy: ABACPolicy) {
        this.policies.set(policy.id, policy);
    }

    /**
     * Remove uma política
     */
    removePolicy(policyId: string) {
        this.policies.delete(policyId);
    }

    /**
     * Avalia se o acesso deve ser permitido
     */
    evaluate(
        user: any,
        resource: any,
        action: string,
        context?: any,
    ): { allowed: boolean; reason?: string } {
        const relevantPolicies = this.getPoliciesForAction(resource, action);

        if (relevantPolicies.length === 0) {
            return { allowed: false, reason: 'No policies found' };
        }

        // Avaliar todas as políticas
        for (const policy of relevantPolicies) {
            const result = this.evaluatePolicy(policy, { user, resource, context });

            if (policy.effect === 'deny' && result) {
                return { allowed: false, reason: `Denied by policy: ${policy.name}` };
            }

            if (policy.effect === 'allow' && result) {
                return { allowed: true, reason: `Allowed by policy: ${policy.name}` };
            }
        }

        return { allowed: false, reason: 'No matching policy' };
    }

    /**
     * Avalia uma política específica
     */
    private evaluatePolicy(
        policy: ABACPolicy,
        context: ABACContext,
    ): boolean {
        return policy.conditions.every(condition =>
            this.evaluateCondition(condition, context),
        );
    }

    /**
     * Avalia uma condição
     */
    private evaluateCondition(
        condition: ABACCondition,
        context: ABACContext,
    ): boolean {
        const fieldValue = this.getFieldValue(condition.field, context);
        const conditionValue = condition.value;

        switch (condition.operator) {
            case 'eq':
                return fieldValue === conditionValue;
            case 'neq':
                return fieldValue !== conditionValue;
            case 'gt':
                return fieldValue > conditionValue;
            case 'gte':
                return fieldValue >= conditionValue;
            case 'lt':
                return fieldValue < conditionValue;
            case 'lte':
                return fieldValue <= conditionValue;
            case 'in':
                return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
            case 'nin':
                return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
            case 'contains':
                return String(fieldValue).includes(String(conditionValue));
            default:
                return false;
        }
    }

    /**
     * Obtém valor de um campo do contexto
     */
    private getFieldValue(field: string, context: any): any {
        const parts = field.split('.');
        let value = context;

        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) break;
        }

        return value;
    }

    /**
     * Obtém políticas relevantes para uma ação
     */
    private getPoliciesForAction(resource: any, action: string): ABACPolicy[] {
        return Array.from(this.policies.values()).filter(
            policy =>
                policy.resource === resource.constructor.name.toLowerCase() &&
                policy.action === action,
        );
    }
}

/**
 * Instância global do ABAC Engine
 */
export const abacEngine = new ABACEngine();

/**
 * Exemplos de políticas
 */

// Política: Usuário pode editar apenas documentos do seu departamento
abacEngine.registerPolicy({
    id: 'edit-own-department-documents',
    name: 'Edit Own Department Documents',
    description: 'Users can only edit documents from their department',
    resource: 'document',
    action: 'update',
    conditions: [
        {
            field: 'user.department',
            operator: 'eq',
            value: 'resource.department',
        },
        {
            field: 'resource.status',
            operator: 'neq',
            value: 'archived',
        },
    ],
    effect: 'allow',
});

// Política: Gerentes podem aprovar pedidos até R$ 10.000
abacEngine.registerPolicy({
    id: 'manager-approve-orders',
    name: 'Manager Approve Orders',
    description: 'Managers can approve orders up to R$ 10,000',
    resource: 'order',
    action: 'approve',
    conditions: [
        {
            field: 'user.role',
            operator: 'eq',
            value: 'manager',
        },
        {
            field: 'resource.total',
            operator: 'lte',
            value: 10000,
        },
    ],
    effect: 'allow',
});

// Política: Bloquear acesso a dados sensíveis fora do horário comercial
abacEngine.registerPolicy({
    id: 'block-sensitive-after-hours',
    name: 'Block Sensitive Data After Hours',
    description: 'Block access to sensitive data outside business hours',
    resource: 'sensitive_data',
    action: 'read',
    conditions: [
        {
            field: 'context.hour',
            operator: 'lt',
            value: 8,
        },
    ],
    effect: 'deny',
});

abacEngine.registerPolicy({
    id: 'block-sensitive-after-hours-2',
    name: 'Block Sensitive Data After Hours (Night)',
    resource: 'sensitive_data',
    action: 'read',
    conditions: [
        {
            field: 'context.hour',
            operator: 'gt',
            value: 18,
        },
    ],
    effect: 'deny',
});
