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

export type AdicionarMembroDepartamentoInput = z.infer<
  typeof adicionarMembroDepartamentoInputSchema
>;

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

export const adicionarMembroSetorInputSchema = z.object({
  orgId: z.string().min(1),
  sectorId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema.default("member"),
});

export type AdicionarMembroSetorInput = z.infer<typeof adicionarMembroSetorInputSchema>;

export const removerMembroSetorInputSchema = z.object({
  orgId: z.string().min(1),
  sectorId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoverMembroSetorInput = z.infer<typeof removerMembroSetorInputSchema>;

export const atualizarRoleMembroSetorInputSchema = z.object({
  orgId: z.string().min(1),
  sectorId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

export type AtualizarRoleMembroSetorInput = z.infer<typeof atualizarRoleMembroSetorInputSchema>;

export const adicionarMembroCargoInputSchema = z.object({
  orgId: z.string().min(1),
  positionId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema.default("member"),
});

export type AdicionarMembroCargoInput = z.infer<typeof adicionarMembroCargoInputSchema>;

export const removerMembroCargoInputSchema = z.object({
  orgId: z.string().min(1),
  positionId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type RemoverMembroCargoInput = z.infer<typeof removerMembroCargoInputSchema>;

export const atualizarRoleMembroCargoInputSchema = z.object({
  orgId: z.string().min(1),
  positionId: z.string().uuid(),
  userId: z.string().uuid(),
  role: organizationRoleSchema,
});

export type AtualizarRoleMembroCargoInput = z.infer<typeof atualizarRoleMembroCargoInputSchema>;
