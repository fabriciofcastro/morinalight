/**
 * PolicyService - Serviço para avaliar políticas PBAC (Policy-Based Access Control)
 * 
 * Este serviço verifica se ações podem ser executadas baseadas em políticas configuradas,
 * incluindo avaliação de condições e verificação de aprovações necessárias.
 */

import type { WorkflowPolicy } from "../entities/workflow-policy";
import type { WorkflowPolicyRepository } from "../repositories/workflow-policy-repository";

/**
 * Contexto da ação a ser avaliada
 */
export interface ActionContext {
  /** ID do workflow/item (ex: ficha de custo, proposta) */
  workflowId?: string;
  /** Dados do contexto para avaliação de condições */
  [key: string]: unknown;
}

/**
 * Resultado da verificação de política
 */
export interface PolicyCheckResult {
  /** Se a ação é permitida */
  allowed: boolean;
  /** Motivo da rejeição (se não permitido) */
  reason?: string;
  /** Número de aprovações ainda necessárias */
  approvalsNeeded?: number;
  /** Políticas aplicáveis encontradas */
  applicablePolicies?: Array<{ id: string; module: string; flowType: string }>;
  /** Condições que falharam */
  failedConditions?: Array<{ policyId: string; condition: string }>;
}

/**
 * Tipo de configuração de política (DSL)
 */
export interface PolicyConfig {
  /** Condições que devem ser atendidas */
  conditions?: Record<string, unknown>;
  /** Número mínimo de aprovações necessárias */
  approvalsRequired?: number;
  /** Roles que podem aprovar */
  approverRoles?: string[];
  /** Regras customizadas */
  rules?: Record<string, unknown>;
}

/**
 * Service para avaliar políticas PBAC
 */
export class PolicyService {
  constructor(private readonly workflowPolicyRepository: WorkflowPolicyRepository) {}

  /**
   * Verifica se uma ação pode ser executada baseada nas políticas configuradas
   */
  async canExecute(
    orgId: string,
    module: string,
    flowType: string,
    context: ActionContext,
  ): Promise<PolicyCheckResult> {
    // Buscar políticas aplicáveis
    const policies = await this.workflowPolicyRepository.findAll({
      orgId,
      active: true,
    });

    const applicablePolicies = policies.filter(
      (policy) => policy.dados.module === module && policy.dados.flowType === flowType,
    );

    if (applicablePolicies.length === 0) {
      // Sem políticas = permitido (fallback para RBAC/ABAC)
      return { allowed: true };
    }

    // Avaliar cada política
    for (const policy of applicablePolicies) {
      const config = policy.dados.config as PolicyConfig | undefined;

      if (!config) {
        continue; // Política sem configuração válida
      }

      // Verificar condições
      if (config.conditions) {
        const conditionsMet = this.evaluateConditions(config.conditions, context);

        if (!conditionsMet.met) {
          return {
            allowed: false,
            reason: `Condições não atendidas: ${conditionsMet.failedCondition}`,
            applicablePolicies: applicablePolicies.map((p) => ({
              id: p.workflowPolicyId,
              module: p.dados.module,
              flowType: p.dados.flowType,
            })),
            failedConditions: [
              {
                policyId: policy.workflowPolicyId,
                condition: conditionsMet.failedCondition || "Desconhecida",
              },
            ],
          };
        }
      }

      // Se há requisito de aprovações, verificar (será implementado quando Approval model existir)
      // Por enquanto, retornamos allowed se condições foram atendidas
      if (config.approvalsRequired && config.approvalsRequired > 0) {
        // TODO: Implementar verificação de aprovações quando Approval model estiver disponível
        // const approvals = await this.approvalRepository.findByWorkflowId(context.workflowId);
        // const approvalsCount = approvals.filter(a => a.status === 'APPROVED').length;
        // if (approvalsCount < config.approvalsRequired) {
        //   return {
        //     allowed: false,
        //     reason: `Requer ${config.approvalsRequired} aprovações (${approvalsCount} recebidas)`,
        //     approvalsNeeded: config.approvalsRequired - approvalsCount,
        //   };
        // }
      }
    }

    return {
      allowed: true,
      applicablePolicies: applicablePolicies.map((p) => ({
        id: p.workflowPolicyId,
        module: p.dados.module,
        flowType: p.dados.flowType,
      })),
    };
  }

  /**
   * Avalia condições de uma política
   */
  private evaluateConditions(
    conditions: Record<string, unknown>,
    context: ActionContext,
  ): { met: boolean; failedCondition?: string } {
    for (const [key, value] of Object.entries(conditions)) {
      const contextValue = context[key];

      // Suporta operadores MongoDB-style
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const operators = value as Record<string, unknown>;

        // $gt: maior que
        if (operators.$gt !== undefined) {
          if (typeof contextValue !== "number" || contextValue <= (operators.$gt as number)) {
            return { met: false, failedCondition: `${key} deve ser maior que ${operators.$gt}` };
          }
        }

        // $gte: maior ou igual
        if (operators.$gte !== undefined) {
          if (typeof contextValue !== "number" || contextValue < (operators.$gte as number)) {
            return { met: false, failedCondition: `${key} deve ser maior ou igual a ${operators.$gte}` };
          }
        }

        // $lt: menor que
        if (operators.$lt !== undefined) {
          if (typeof contextValue !== "number" || contextValue >= (operators.$lt as number)) {
            return { met: false, failedCondition: `${key} deve ser menor que ${operators.$lt}` };
          }
        }

        // $lte: menor ou igual
        if (operators.$lte !== undefined) {
          if (typeof contextValue !== "number" || contextValue > (operators.$lte as number)) {
            return { met: false, failedCondition: `${key} deve ser menor ou igual a ${operators.$lte}` };
          }
        }

        // $eq: igual
        if (operators.$eq !== undefined) {
          if (contextValue !== operators.$eq) {
            return { met: false, failedCondition: `${key} deve ser igual a ${operators.$eq}` };
          }
        }

        // $ne: diferente
        if (operators.$ne !== undefined) {
          if (contextValue === operators.$ne) {
            return { met: false, failedCondition: `${key} não deve ser igual a ${operators.$ne}` };
          }
        }

        // $in: está em array
        if (operators.$in !== undefined) {
          const inArray = operators.$in as unknown[];
          if (!inArray.includes(contextValue)) {
            return { met: false, failedCondition: `${key} deve estar em ${JSON.stringify(inArray)}` };
          }
        }

        // $nin: não está em array
        if (operators.$nin !== undefined) {
          const ninArray = operators.$nin as unknown[];
          if (ninArray.includes(contextValue)) {
            return { met: false, failedCondition: `${key} não deve estar em ${JSON.stringify(ninArray)}` };
          }
        }

        // $exists: existe no contexto
        if (operators.$exists !== undefined) {
          const shouldExist = operators.$exists as boolean;
          const exists = key in context;
          if (shouldExist && !exists) {
            return { met: false, failedCondition: `${key} deve existir no contexto` };
          }
          if (!shouldExist && exists) {
            return { met: false, failedCondition: `${key} não deve existir no contexto` };
          }
        }

        continue; // Operador processado
      }

      // Comparação direta (igualdade)
      if (contextValue !== value) {
        return { met: false, failedCondition: `${key} deve ser igual a ${value}` };
      }
    }

    return { met: true };
  }

  /**
   * Encontra políticas aplicáveis para um módulo e tipo de flow
   */
  async findApplicablePolicies(orgId: string, module: string, flowType: string): Promise<WorkflowPolicy[]> {
    const policies = await this.workflowPolicyRepository.findAll({
      orgId,
      active: true,
    });

    return policies.filter(
      (policy) => policy.dados.module === module && policy.dados.flowType === flowType,
    );
  }

  /**
   * Verifica se há políticas configuradas para um módulo/flowType
   */
  async hasPolicies(orgId: string, module: string, flowType: string): Promise<boolean> {
    const policies = await this.findApplicablePolicies(orgId, module, flowType);
    return policies.length > 0;
  }
}

