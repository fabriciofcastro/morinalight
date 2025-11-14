import { z } from "zod";

export const organizationRoleSchema = z.enum(["owner", "admin", "manager", "member", "viewer"]);

export const adicionarMembroUnidadeInputSchema = z.object({
  orgId: z.string().min(1),
  unitId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema.default("member"),
});

export type AdicionarMembroUnidadeInput = z.infer<typeof adicionarMembroUnidadeInputSchema>;

export const removerMembroUnidadeInputSchema = z.object({
  orgId: z.string().min(1),
  unitId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoverMembroUnidadeInput = z.infer<typeof removerMembroUnidadeInputSchema>;

export const adicionarMembroDepartamentoInputSchema = z.object({
  orgId: z.string().min(1),
  departmentId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema.default("member"),
});

export type AdicionarMembroDepartamentoInput = z.infer<typeof adicionarMembroDepartamentoInputSchema>;

export const removerMembroDepartamentoInputSchema = z.object({
  orgId: z.string().min(1),
  departmentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoverMembroDepartamentoInput = z.infer<typeof removerMembroDepartamentoInputSchema>;

export const adicionarMembroTeamInputSchema = z.object({
  orgId: z.string().min(1),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema.default("member"),
});

export type AdicionarMembroTeamInput = z.infer<typeof adicionarMembroTeamInputSchema>;

export const removerMembroTeamInputSchema = z.object({
  orgId: z.string().min(1),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoverMembroTeamInput = z.infer<typeof removerMembroTeamInputSchema>;

