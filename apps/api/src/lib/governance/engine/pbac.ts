import type { GovernancePolicy } from "../types/policy.types";

export class PBACModule {
  /**
   * Retorna os IDs das políticas ativas.
   */
  static getActivePolicies(policy: GovernancePolicy): string[] {
    // 1. Verifica se o sistema de versionamento está ativo
    if (!policy.pbac.policy_versioning.enabled) {
      // Se versionamento desligado, talvez retornar todas? Ou falhar seguro?
      // Pela spec, active_policies é a fonte da verdade.
      return policy.pbac.active_policies;
    }

    return policy.pbac.active_policies;
  }
}
