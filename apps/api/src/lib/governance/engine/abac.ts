import { ConfigurationError, InternalServerError } from "../../../core/errors/app-error";
import { GeoService } from "../services/geo.service";
import type { AccessContext } from "../types/context.types";
import type { ABACPolicy, GovernancePolicy } from "../types/policy.types";
import type { TBACResult } from "./tbac";

export interface ABACResult {
  requiredEnforcements: string[]; // ["LEGAL_ACK", "AUDIT_FULL"]
}

export class ABACModule {
  /**
   * Avalia as políticas contextuais.
   */
  static evaluate(
    context: AccessContext,
    tbacResult: TBACResult,
    policy: GovernancePolicy,
  ): ABACResult {
    try {
      if (!policy || !policy.pbac) {
        throw new ConfigurationError(
          "GOVERNANCE_POLICY_INVALID",
          "Invalid governance policy structure",
        );
      }

      const activePolicyIds = policy.pbac.active_policies;
      const enforcements = new Set<string>();

      for (const rule of policy.policies) {
        // 1. Verifica se a política está ativa (PBAC)
        if (!activePolicyIds.includes(rule.id)) continue;

        // 2. Avalia a condição ("when")
        if (ABACModule.evaluateCondition(rule, context, tbacResult)) {
          // 3. Aplica obrigações ("then")
          ABACModule.collectEnforcements(rule, enforcements);
        }
      }

      return {
        requiredEnforcements: Array.from(enforcements),
      };
    } catch (error) {
      if (error instanceof ConfigurationError) throw error;
      throw new InternalServerError("Failed to evaluate ABAC policies", {
        originalError: error instanceof Error ? error.message : String(error),
        policyId: policy?.meta?.version,
      });
    }
  }

  private static evaluateCondition(
    rule: ABACPolicy,
    context: AccessContext,
    tbacResult: TBACResult,
  ): boolean {
    const { when } = rule;

    // Condition: outside_working_hours
    if (when.outside_working_hours === true) {
      if (tbacResult.shift !== "OVERTIME" && tbacResult.shift !== "OUTSIDE_SHIFT") {
        return false;
      }
    }

    // Condition: foreign_ip
    if (when.foreign_ip === true) {
      try {
        if (!GeoService.isForeignIp(context.ip)) {
          return false;
        }
      } catch (error) {
        // Fail closed on security check errors
        console.error("GeoService failure:", error);
        throw new InternalServerError("GeoService check failed during ABAC evaluation");
      }
    }

    return true;
  }

  private static collectEnforcements(rule: ABACPolicy, enforcements: Set<string>): void {
    const { require } = rule.then;

    if (require.legal_ack) enforcements.add("LEGAL_ACK");
    if (require.audit_level === "FULL") enforcements.add("AUDIT_FULL");
    if (require.backlog_event) enforcements.add("BACKLOG_EVENT");
  }
}
