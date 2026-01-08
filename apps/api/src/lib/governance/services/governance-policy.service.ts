import { getPrisma } from "../../infra/database/prisma.service";
import { type GovernancePolicy, GovernancePolicySchema } from "../types/policy.types";

const prisma = getPrisma();

/**
 * Serviço para carregar e gerenciar políticas de governança dinâmicas (PBAC)
 */
export class GovernancePolicyService {
  /**
   * Carrega a política ativa de uma organização ou a política global do sistema
   */
  static async getActivePolicy(orgId: string): Promise<GovernancePolicy> {
    // 1. Buscar janelas de tempo (TBAC)
    const timeWindows = await prisma.timeWindow.findMany({
      where: { orgId, active: true },
    });

    // 2. Buscar políticas de segurança (ABAC/PBAC)
    const securityPolicies = await prisma.securityPolicy.findMany({
      where: { orgId, active: true },
      orderBy: { priority: "desc" },
    });

    // 3. Mapear para o objeto GovernancePolicy (Zod Schema)
    // Para manter a compatibilidade com a engine, montamos o objeto final
    const policy: GovernancePolicy = {
      meta: {
        system: "Morina Security Shield",
        version: "2.0.0-PROD",
        timezone: "America/Sao_Paulo",
        audit_retention_days: 90,
        immutable: true,
      },
      working_hours: {
        default: {
          days: timeWindows[0]?.daysOfWeek.map((d) => GovernancePolicyService.mapDay(d)) || [
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
          ],
          start: timeWindows[0]?.startTime || "08:00",
          end: timeWindows[0]?.endTime || "18:00",
        },
        tolerance_minutes: 15,
      },
      roles: {
        // TODO: Carregar do modelo de Roles do banco
        ADMIN: { allowed_screens: ["*"] },
        MANAGER: { allowed_screens: ["inventory:*", "sales:*", "audit:*"] },
        USER: { allowed_screens: ["inventory:view", "sales:view"] },
      },
      policies: securityPolicies.map((p) => ({
        id: p.id,
        when: (p.conditions as any)?.when || {},
        then: (p.conditions as any)?.then || { require: {} },
      })),
      pbac: {
        active_policies: securityPolicies.map((p) => p.id),
        policy_versioning: {
          enabled: true,
          decision_log: true,
        },
      },
      aubac: {
        risk_scoring: {
          outside_hours_access: { weight: 5 },
          foreign_ip_access: { weight: 20 },
        },
        thresholds: {
          medium_risk: { score: 30, action: "AUDIT_FULL" },
          high_risk: { score: 70, action: "DENY" },
        },
      },
    };

    // Validar com Zod para garantir integridade (SOC2 requirement)
    return GovernancePolicySchema.parse(policy);
  }

  private static mapDay(day: number): string {
    const map = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return map[day] || "MON";
  }
}
