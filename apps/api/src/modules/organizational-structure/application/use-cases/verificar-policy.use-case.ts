/**
 * Use Case: Verificar Policy (PBAC)
 *
 * Verifica se uma ação pode ser executada baseada em políticas configuradas.
 */

import { z } from "zod";
import type { PolicyService } from "../../domain/services/policy-service";

const verificarPolicyInputSchema = z.object({
  orgId: z.string().uuid(),
  module: z.string().min(1),
  flowType: z.string().min(1),
  context: z.record(z.unknown()),
});

export type VerificarPolicyInput = z.infer<typeof verificarPolicyInputSchema>;

const verificarPolicyResultadoSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  approvalsNeeded: z.number().optional(),
  applicablePolicies: z
    .array(
      z.object({
        id: z.string().uuid(),
        module: z.string(),
        flowType: z.string(),
      }),
    )
    .optional(),
  failedConditions: z
    .array(
      z.object({
        policyId: z.string().uuid(),
        condition: z.string(),
      }),
    )
    .optional(),
});

export type VerificarPolicyResultado = z.infer<typeof verificarPolicyResultadoSchema>;

type Dependencies = {
  policyService: PolicyService;
};

export class VerificarPolicyUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown): Promise<VerificarPolicyResultado> {
    const input = verificarPolicyInputSchema.parse(rawInput);

    const result = await this.deps.policyService.canExecute(
      input.orgId,
      input.module,
      input.flowType,
      input.context,
    );

    return verificarPolicyResultadoSchema.parse(result);
  }
}
