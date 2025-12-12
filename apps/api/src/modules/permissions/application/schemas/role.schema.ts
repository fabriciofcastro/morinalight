import { z } from "zod";

export const roleBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  scope: z.string().min(1).max(40).default("GLOBAL"),
  active: z.boolean().default(true),
  isCustom: z.boolean().default(true),
});

export const criarRoleInputSchema = roleBaseSchema.pick({
  orgId: true,
  name: true,
  code: true,
  description: true,
  scope: true,
  active: true,
  isCustom: true,
});

export type CriarRoleInput = z.infer<typeof criarRoleInputSchema>;

export const roleViewSchema = roleBaseSchema.extend({
  roleId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoleView = z.infer<typeof roleViewSchema>;

export const atualizarRoleInputSchema = z.object({
  orgId: z.string().min(1),
  roleId: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional().nullable(),
  scope: z.string().min(1).max(40).optional(),
  active: z.boolean().optional(),
  isCustom: z.boolean().optional(),
});

export type AtualizarRoleInput = z.infer<typeof atualizarRoleInputSchema>;

export const listarRolesInputSchema = z
  .object({
    orgId: z.string().min(1),
    busca: z.string().min(2).max(120).optional(),
  })
  .strict();

export type ListarRolesInput = z.infer<typeof listarRolesInputSchema>;

export const listarRolesResultadoSchema = z.object({
  itens: z.array(roleViewSchema),
});

export type ListarRolesResultado = z.infer<typeof listarRolesResultadoSchema>;
