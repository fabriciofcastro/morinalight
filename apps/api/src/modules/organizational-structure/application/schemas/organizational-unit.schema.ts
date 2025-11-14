import { z } from "zod";

export const organizationalUnitBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  name: z.string().min(2).max(255),
  code: z.string().min(1).max(50),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).default("ativo"),
  ordem: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const criarOrganizationalUnitInputSchema = organizationalUnitBaseSchema.pick({
  orgId: true,
  name: true,
  code: true,
  description: true,
  parentId: true,
  status: true,
  ordem: true,
  metadata: true,
});

export type CriarOrganizationalUnitInput = z.infer<typeof criarOrganizationalUnitInputSchema>;

export const organizationalUnitViewSchema = organizationalUnitBaseSchema.extend({
  unitId: z.string().uuid(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrganizationalUnitView = z.infer<typeof organizationalUnitViewSchema>;

export const atualizarOrganizationalUnitInputSchema = z.object({
  orgId: z.string().min(1),
  unitId: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type AtualizarOrganizationalUnitInput = z.infer<
  typeof atualizarOrganizationalUnitInputSchema
>;

export const listarOrganizationalUnitsInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
    parentId: z.string().uuid().optional().nullable(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarOrganizationalUnitsInput = z.infer<typeof listarOrganizationalUnitsInputSchema>;

export const listarOrganizationalUnitsResultadoSchema = z.object({
  itens: z.array(organizationalUnitViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarOrganizationalUnitsResultado = z.infer<
  typeof listarOrganizationalUnitsResultadoSchema
>;
