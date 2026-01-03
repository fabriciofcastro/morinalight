import { z } from "zod";

export const workflowPolicyBaseSchema = z.object({
  module: z.string().min(2).max(50),
  flowType: z.string().min(2).max(50),
  config: z.record(z.any()).optional().default({}),
  active: z.boolean().optional().default(true),
});

export const criarWorkflowPolicyInputSchema = workflowPolicyBaseSchema.extend({
  orgId: z.string().uuid(),
});

export type CriarWorkflowPolicyInput = z.infer<typeof criarWorkflowPolicyInputSchema>;

export const workflowPolicyViewSchema = workflowPolicyBaseSchema.extend({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowPolicyView = z.infer<typeof workflowPolicyViewSchema>;

export const atualizarWorkflowPolicyInputSchema = z.object({
  id: z.string().uuid(),
  module: z.string().min(2).max(50).optional(),
  flowType: z.string().min(2).max(50).optional(),
  config: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});

export type AtualizarWorkflowPolicyInput = z.infer<typeof atualizarWorkflowPolicyInputSchema>;

export const atualizarWorkflowPolicyBodySchema = z.object({
  module: z.string().min(2).max(50).optional(),
  flowType: z.string().min(2).max(50).optional(),
  config: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});

export const listarWorkflowPoliciesInputSchema = z
  .object({
    orgId: z.string().uuid(),
    module: z.string().optional(),
    flowType: z.string().optional(),
    active: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  })
  .strict();

export type ListarWorkflowPoliciesInput = z.infer<typeof listarWorkflowPoliciesInputSchema>;

export const listarWorkflowPoliciesQuerySchema = z
  .object({
    module: z.string().optional(),
    flowType: z.string().optional(),
    active: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  })
  .strict();

export const listarWorkflowPoliciesResultadoSchema = z.object({
  itens: z.array(workflowPolicyViewSchema),
});

export type ListarWorkflowPoliciesResultado = z.infer<typeof listarWorkflowPoliciesResultadoSchema>;
