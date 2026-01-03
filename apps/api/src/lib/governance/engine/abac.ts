import { GovernancePolicy, ABACPolicy } from "../types/policy.types";
import { AccessContext } from "../types/context.types";
import { TBACResult } from "./tbac";

export interface ABACResult {
    requiredEnforcements: string[]; // ["LEGAL_ACK", "AUDIT_FULL"]
}

export class ABACModule {
    /**
     * Avalia as políticas contextuais.
     */
    static evaluate(context: AccessContext, tbacResult: TBACResult, policy: GovernancePolicy): ABACResult {
        const activePolicyIds = policy.pbac.active_policies;
        const enforcements = new Set<string>();

        for (const rule of policy.policies) {
            // 1. Verifica se a política está ativa (PBAC)
            if (!activePolicyIds.includes(rule.id)) continue;

            // 2. Avalia a condição ("when")
            if (this.evaluateCondition(rule, context, tbacResult)) {
                // 3. Aplica obrigações ("then")
                this.collectEnforcements(rule, enforcements);
            }
        }

        return {
            requiredEnforcements: Array.from(enforcements)
        };
    }

    private static evaluateCondition(rule: ABACPolicy, context: AccessContext, tbacResult: TBACResult): boolean {
        const { when } = rule;

        // Condition: outside_working_hours
        if (when.outside_working_hours === true) {
            if (tbacResult.shift !== 'OVERTIME' && tbacResult.shift !== 'OUTSIDE_SHIFT') {
                return false;
            }
        }

        // Condition: foreign_ip
        // TODO: Integrar com GeoService na Fase 6
        // if (when.foreign_ip && context.location !== "BR") ...

        return true;
    }

    private static collectEnforcements(rule: ABACPolicy, enforcements: Set<string>): void {
        const { require } = rule.then;

        if (require.legal_ack) enforcements.add("LEGAL_ACK");
        if (require.audit_level === "FULL") enforcements.add("AUDIT_FULL");
        if (require.backlog_event) enforcements.add("BACKLOG_EVENT");
    }
}
