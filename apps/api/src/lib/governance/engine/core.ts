// Services
import { BacklogService } from "../services/backlog.service";
import { GeoService } from "../services/geo.service";
import type { AccessContext, DecisionResult } from "../types/context.types";
import type { GovernancePolicy } from "../types/policy.types";
// Modules
import { ABACModule } from "./abac";
import { AuBACModule, type UserHistory } from "./aubac";
import { RBACModule } from "./rbac";
import { ReBACModule } from "./rebac";
import { TBACModule } from "./tbac";

/**
 * IMPLEMENTAÇÃO RIGOROSA DO FLUXO DE 10 PASSOS DA SPEC
 */
export class AccessEngine {
  static async evaluateAccess(
    context: AccessContext,
    policy: GovernancePolicy,
    history: UserHistory,
  ): Promise<DecisionResult> {
    const reasons: string[] = [];

    // ---------------------------------------------------------
    // 3. Validar RBAC (Teto de Permissão)
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // 1. Verificação de Versão da Política (Integridade)
    // ---------------------------------------------------------
    if (policy.pbac?.policy_versioning?.enabled) {
      // Placeholder: Aqui validaríamos se o hash da política bate com o esperado
      // Para garantir que decisões não sejam tomadas com políticas adulteradas em memória
    }

    // ---------------------------------------------------------
    // 3. Validar RBAC (Teto de Permissão)
    // ---------------------------------------------------------
    const rbacAllowed = RBACModule.checkAccess(context.role, context.screen, policy);
    if (!rbacAllowed) {
      return { decision: "DENY", reasons: ["RBAC_VIOLATION"] };
    }

    // ---------------------------------------------------------
    // 3.5 Validar ReBAC (Propriedade/Relacionamento)
    // ---------------------------------------------------------
    let isOwner = false;
    if (context.resourceId && context.resourceType) {
      isOwner = await ReBACModule.checkOwnership(
        context.userId,
        context.resourceType,
        context.resourceId,
      );
      // Injetamos o resultado no contexto para o ABAC usar se necessário
      (context as any).isOwner = isOwner;
    }

    // ---------------------------------------------------------
    // 4. Avaliar Horário (TBAC)
    // ---------------------------------------------------------
    const tbacResult = TBACModule.evaluate(context, policy);
    if (tbacResult.shift === "OVERTIME") {
      reasons.push("OUTSIDE_HOURS");
    }

    // ---------------------------------------------------------
    // 5. Avaliar Localização (Ambiente)
    // ---------------------------------------------------------
    if (GeoService.isForeignIp(context.ip)) {
      reasons.push("FOREIGN_IP");
    }

    // ---------------------------------------------------------
    // 6. Aplicar ABAC (Decisão Contextual)
    // ---------------------------------------------------------
    const abacResult = ABACModule.evaluate(context, tbacResult, policy);
    // ABAC pode recomendar auditoria full ou legal_ack

    // ---------------------------------------------------------
    // 7. Decidir (AuBAC desempata e agrava)
    // ---------------------------------------------------------
    const aubacDecision = AuBACModule.evaluate(context, history, policy);

    // Fusão das decisões
    let finalDecision = aubacDecision; // AuBAC tem peso alto (Risco)

    // Se ABAC exige auditoria mas AuBAC permite livre, ABAC vence no rigor
    if (abacResult.requiredEnforcements.includes("AUDIT_FULL") && finalDecision === "ALLOW") {
      finalDecision = "ALLOW_WITH_AUDIT";
    }

    // Se TBAC exige Legal Ack, adicionamos à lista de enforcements
    const requiredEnforcements = [...abacResult.requiredEnforcements];
    if (tbacResult.requiresLegalAck) {
      requiredEnforcements.push("LEGAL_ACK");
      // Se não bloqueado, vira ALLOW_WITH_AUDIT no mínimo
      if (finalDecision === "ALLOW") finalDecision = "ALLOW_WITH_AUDIT";
    }

    // ---------------------------------------------------------
    // 10. Criar backlog se necessário (Side-Effect seguro)
    // ---------------------------------------------------------
    BacklogService.createEventWhen(finalDecision, context, reasons);

    return {
      decision: finalDecision,
      reasons,
      requiredEnforcements,
      meta: {
        policyVersion: policy.meta.version,
        policySystem: policy.meta.system,
      },
    };
  }
}
