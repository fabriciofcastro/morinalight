import { z } from "zod";

export const sectorStatusSchema = z.enum(["ativo", "inativo", "arquivado"]);

export type SectorStatus = z.infer<typeof sectorStatusSchema>;

const sectorBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  departmentId: z.string().uuid("departmentId deve ser UUID válido"),
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(180, "Nome deve ter no máximo 180 caracteres"),
  code: z
    .string()
    .min(2, "Código deve ter no mínimo 2 caracteres")
    .max(50, "Código deve ter no máximo 50 caracteres"),
  description: z
    .string()
    .max(1024, "Descrição deve ter no máximo 1024 caracteres")
    .nullable()
    .optional(),
  parentId: z.string().uuid("parentId deve ser UUID válido").nullable().optional(),
  status: sectorStatusSchema.optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export const criarSectorInputSchema = sectorBaseSchema.omit({ status: true, ordem: true }).strict();

export type CriarSectorInput = z.infer<typeof criarSectorInputSchema>;

export const atualizarSectorInputSchema = sectorBaseSchema
  .partial()
  .required({ orgId: true })
  .extend({
    sectorId: z.string().uuid("sectorId deve ser UUID válido"),
  })
  .omit({ departmentId: true })
  .strict();

export type AtualizarSectorInput = z.infer<typeof atualizarSectorInputSchema>;

export const sectorViewSchema = sectorBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});

export type SectorView = z.infer<typeof sectorViewSchema>;

export const listarSectorsInputSchema = z
  .object({
    orgId: z.string().min(1),
    departmentId: z.string().uuid().optional(),
    parentId: z.string().uuid().nullable().optional(),
    status: sectorStatusSchema.optional(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarSectorsInput = z.infer<typeof listarSectorsInputSchema>;

export const listarSectorsResultadoSchema = z.object({
  itens: z.array(sectorViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarSectorsResultado = z.infer<typeof listarSectorsResultadoSchema>;

export const deletarSectorInputSchema = z
  .object({
    orgId: z.string().min(1),
    sectorId: z.string().uuid(),
  })
  .strict();

export type DeletarSectorInput = z.infer<typeof deletarSectorInputSchema>;
