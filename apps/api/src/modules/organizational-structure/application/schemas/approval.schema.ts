/**
 * Schemas Zod para Approval
 */

import { z } from "zod";

export const approvalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const criarApprovalInputSchema = z.object({
  orgId: z.string().uuid(),
  workflowId: z.string().min(1),
  workflowType: z.string().min(1),
  policyId: z.string().uuid(),
  approverId: z.string().uuid(),
  comments: z.string().max(1000).optional(),
});

export type CriarApprovalInput = z.infer<typeof criarApprovalInputSchema>;

export const approvalViewSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  workflowId: z.string(),
  workflowType: z.string(),
  policyId: z.string().uuid(),
  approverId: z.string().uuid(),
  status: approvalStatusSchema,
  comments: z.string().nullable(),
  approvedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ApprovalView = z.infer<typeof approvalViewSchema>;

export const aprovarApprovalInputSchema = z.object({
  id: z.string().uuid(),
  comments: z.string().max(1000).optional(),
});

export type AprovarApprovalInput = z.infer<typeof aprovarApprovalInputSchema>;

export const rejeitarApprovalInputSchema = z.object({
  id: z.string().uuid(),
  comments: z.string().max(1000).optional(),
});

export type RejeitarApprovalInput = z.infer<typeof rejeitarApprovalInputSchema>;

export const listarApprovalsInputSchema = z
  .object({
    orgId: z.string().uuid(),
    workflowId: z.string().optional(),
    workflowType: z.string().optional(),
    policyId: z.string().uuid().optional(),
    approverId: z.string().uuid().optional(),
    status: approvalStatusSchema.optional(),
  })
  .strict();

export type ListarApprovalsInput = z.infer<typeof listarApprovalsInputSchema>;

export const listarApprovalsQuerySchema = z
  .object({
    workflowId: z.string().optional(),
    workflowType: z.string().optional(),
    policyId: z.string().uuid().optional(),
    approverId: z.string().uuid().optional(),
    status: approvalStatusSchema.optional(),
  })
  .strict();

export const listarApprovalsResultadoSchema = z.object({
  itens: z.array(approvalViewSchema),
});

export type ListarApprovalsResultado = z.infer<typeof listarApprovalsResultadoSchema>;



