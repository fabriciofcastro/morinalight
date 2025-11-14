import { z } from "zod";

export const positionStatusSchema = z.enum(["ativo", "inativo", "arquivado"]);

export type PositionStatus = z.infer<typeof positionStatusSchema>;

const positionBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  sectorId: z.string().uuid("sectorId deve ser UUID válido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(180, "Nome deve ter no máximo 180 caracteres"),
  code: z.string().min(2, "Código deve ter no mínimo 2 caracteres").max(50, "Código deve ter no máximo 50 caracteres"),
  description: z.string().max(1024, "Descrição deve ter no máximo 1024 caracteres").nullable().optional(),
  responsabilidades: z.string().nullable().optional(),
  requisitos: z.string().nullable().optional(),
  salarioMin: z.number().positive("Salário mínimo deve ser positivo").nullable().optional(),
  salarioMax: z.number().positive("Salário máximo deve ser positivo").nullable().optional(),
  status: positionStatusSchema.optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export const criarPositionInputSchema = positionBaseSchema.omit({ status: true, ordem: true }).strict();

export type CriarPositionInput = z.infer<typeof criarPositionInputSchema>;

export const atualizarPositionInputSchema = positionBaseSchema
  .partial()
  .required({ orgId: true })
  .extend({
    positionId: z.string().uuid("positionId deve ser UUID válido"),
  })
  .omit({ orgId: true, sectorId: true })
  .strict();

export type AtualizarPositionInput = z.infer<typeof atualizarPositionInputSchema>;

export const positionViewSchema = positionBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});

export type PositionView = z.infer<typeof positionViewSchema>;

export const listarPositionsInputSchema = z
  .object({
    orgId: z.string().min(1),
    sectorId: z.string().uuid().optional(),
    status: positionStatusSchema.optional(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarPositionsInput = z.infer<typeof listarPositionsInputSchema>;

export const listarPositionsResultadoSchema = z.object({
  itens: z.array(positionViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarPositionsResultado = z.infer<typeof listarPositionsResultadoSchema>;

export const deletarPositionInputSchema = z
  .object({
    orgId: z.string().min(1),
    positionId: z.string().uuid(),
  })
  .strict();

export type DeletarPositionInput = z.infer<typeof deletarPositionInputSchema>;

