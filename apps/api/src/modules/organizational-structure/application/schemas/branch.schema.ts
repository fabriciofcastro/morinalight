import { z } from "zod";

export const branchBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  name: z.string().min(2).max(255),
  type: z.string().min(1).max(50), // FABRICA, LOJA, CD, ESCRITORIO
  internalCode: z.string().max(20).optional().nullable(),
  cnpj: z.string().max(18).optional().nullable(),
  stateRegistration: z.string().max(20).optional().nullable(),
  address: z.record(z.unknown()).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  active: z.boolean().default(true),
});

export const criarBranchInputSchema = branchBaseSchema.pick({
  orgId: true,
  name: true,
  type: true,
  internalCode: true,
  cnpj: true,
  stateRegistration: true,
  address: true,
  phone: true,
  email: true,
  active: true,
});

export type CriarBranchInput = z.infer<typeof criarBranchInputSchema>;

export const branchViewSchema = branchBaseSchema.extend({
  branchId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BranchView = z.infer<typeof branchViewSchema>;

export const atualizarBranchInputSchema = z.object({
  orgId: z.string().min(1),
  branchId: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  type: z.string().min(1).max(50).optional(),
  internalCode: z.string().max(20).optional().nullable(),
  cnpj: z.string().max(18).optional().nullable(),
  stateRegistration: z.string().max(20).optional().nullable(),
  address: z.record(z.unknown()).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  active: z.boolean().optional(),
});

export type AtualizarBranchInput = z.infer<typeof atualizarBranchInputSchema>;

export const listarBranchesInputSchema = z
  .object({
    orgId: z.string().min(1),
    active: z.boolean().optional(),
    busca: z.string().min(2).max(120).optional(),
  })
  .strict();

export type ListarBranchesInput = z.infer<typeof listarBranchesInputSchema>;

export const listarBranchesResultadoSchema = z.object({
  itens: z.array(branchViewSchema),
});

export type ListarBranchesResultado = z.infer<typeof listarBranchesResultadoSchema>;
