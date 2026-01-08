import { type GovernancePolicy, GovernancePolicySchema } from "./types/policy.types";

export class PolicyLoader {
  /**
   * Carrega e valida a política de governança.
   * Lança erro se o schema for inválido.
   *
   * @param rawPolicy Objeto JSON contendo a política (normalmente compilado do .md)
   */
  static load(rawPolicy: unknown): GovernancePolicy {
    try {
      // Validação estrita com Zod
      const policy = GovernancePolicySchema.parse(rawPolicy);

      // Validações adicionais de negócio (Seção 1)
      PolicyLoader.validateMeta(policy);

      return policy;
    } catch (error) {
      throw new Error(`Falha ao carregar política de governança: ${error}`);
    }
  }

  /**
   * Valida regras de negócio dos metadados (Seção 1)
   */
  private static validateMeta(policy: GovernancePolicy): void {
    if (!policy.meta.immutable) {
      console.warn("ALERTA: A política carregada não está marcada como IMUTÁVEL.");
    }

    if (policy.meta.audit_retention_days < 365) {
      throw new Error(
        "Compliance Error: Retenção de auditoria deve ser no mínimo 1 ano (365 dias).",
      );
    }
  }
}
