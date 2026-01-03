/**
 * Schemas Zod para Policy Service
 */

import { z } from "zod";

export const policyCheckResultSchema = z.object({
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

export type PolicyCheckResult = z.infer<typeof policyCheckResultSchema>;

