import { z } from "zod";

export const departmentBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  unitId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(255),
  code: z.string().min(1).max(50),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).default("ativo"),
  ordem: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const criarDepartmentInputSchema = departmentBaseSchema.pick({
  orgId: true,
  unitId: true,
  name: true,
  code: true,
  description: true,
  parentId: true,
  status: true,
  ordem: true,
  metadata: true,
});

export type CriarDepartmentInput = z.infer<typeof criarDepartmentInputSchema>;

export const departmentViewSchema = departmentBaseSchema.extend({
  departmentId: z.string().uuid(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DepartmentView = z.infer<typeof departmentViewSchema>;

export const atualizarDepartmentInputSchema = z.object({
  orgId: z.string().min(1),
  departmentId: z.string().uuid(),
  unitId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(255).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1024).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type AtualizarDepartmentInput = z.infer<typeof atualizarDepartmentInputSchema>;

export const listarDepartmentsInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
    unitId: z.string().uuid().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarDepartmentsInput = z.infer<typeof listarDepartmentsInputSchema>;

export const listarDepartmentsResultadoSchema = z.object({
  itens: z.array(departmentViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarDepartmentsResultado = z.infer<typeof listarDepartmentsResultadoSchema>;
