import type { AccessContext, Decision } from "../types/context.types";
import type { AuBACConfig, GovernancePolicy } from "../types/policy.types";

export interface UserHistory {
  outsideHoursCount: number;
  foreignIpCount: number;
  lastAccess?: Date;
}

export class AuBACModule {
  /**
   * Avalia o risco com base no histórico e contexto.
   */
  static evaluate(
    context: AccessContext,
    history: UserHistory,
    policy: GovernancePolicy,
  ): Decision {
    const config = policy.aubac;
    const score = AuBACModule.calculateRiskScore(history, config);

    return AuBACModule.determineAction(score, config);
  }

  static calculateRiskScore(history: UserHistory, config: AuBACConfig): number {
    let score = 0;

    // Regra: Acesso fora de horário recorrente
    if (history.outsideHoursCount > 3) {
      score += config.risk_scoring.outside_hours_access.weight;
    }

    // Regra: Acesso de IP estrangeiro
    if (history.foreignIpCount > 0) {
      score += config.risk_scoring.foreign_ip_access.weight;
    }

    return score;
  }

  static determineAction(score: number, config: AuBACConfig): Decision {
    if (score >= config.thresholds.high_risk.score) {
      return "REQUIRE_MANAGER_APPROVAL";
    }

    if (score >= config.thresholds.medium_risk.score) {
      return "ALLOW_WITH_AUDIT";
    }

    return "ALLOW";
  }
}
