import { AccessEngine } from "../../lib/governance/engine/core";
import { PolicyLoader } from "../../lib/governance/loader";
import type { AccessContext, DecisionResult } from "../../lib/governance/types/context.types";

export class SimulatorService {
  /**
   * Executa uma simulação "What-if" sem efeitos colaterais.
   * Útil para prever o impacto de uma nova política antes de aplicá-la.
   */
  static simulate(context: AccessContext, policyConfig: any): DecisionResult {
    // 1. Carrega a política candidata
    const candidatePolicy = PolicyLoader.load(policyConfig);

    // 2. Mock history (pior cenário ou estatístico)
    const mockHistory = {
      outsideHoursCount: 5, // Simula usuário reincidente
      foreignIpCount: 0,
    };

    // 3. Roda engine
    return AccessEngine.evaluateAccess(context, candidatePolicy, mockHistory);
  }
}
