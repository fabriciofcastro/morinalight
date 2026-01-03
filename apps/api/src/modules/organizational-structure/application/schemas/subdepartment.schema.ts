import { z } from "zod";

export const subdepartmentBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  branchId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().min(1, "departmentId obrigatório"),
  name: z.string().min(2).max(255),
  code: z.string().min(1).max(50),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).default("ativo"),
  ordem: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const criarSubdepartmentInputSchema = subdepartmentBaseSchema.pick({
  orgId: true,
  branchId: true,
  departmentId: true,
  name: true,
  code: true,
  description: true,
  parentId: true,
  status: true,
  ordem: true,
  metadata: true,
});

export type CriarSubdepartmentInput = z.infer<typeof criarSubdepartmentInputSchema>;

export const subdepartmentViewSchema = subdepartmentBaseSchema.extend({
  subdepartmentId: z.string().uuid(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SubdepartmentView = z.infer<typeof subdepartmentViewSchema>;

export const atualizarSubdepartmentInputSchema = z.object({
  orgId: z.string().min(1),
  subdepartmentId: z.string().uuid(),
  branchId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(255).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type AtualizarSubdepartmentInput = z.infer<typeof atualizarSubdepartmentInputSchema>;

export const listarSubdepartmentsInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
    branchId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional().nullable(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarSubdepartmentsInput = z.infer<typeof listarSubdepartmentsInputSchema>;

export const listarSubdepartmentsResultadoSchema = z.object({
  itens: z.array(subdepartmentViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarSubdepartmentsResultado = z.infer<typeof listarSubdepartmentsResultadoSchema>;

