import { z } from "zod";

export const teamBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  departmentId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(255),
  code: z.string().min(1).max(50),
  description: z.string().max(1024).optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).default("ativo"),
  ordem: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const criarTeamInputSchema = teamBaseSchema.pick({
  orgId: true,
  departmentId: true,
  name: true,
  code: true,
  description: true,
  status: true,
  ordem: true,
  metadata: true,
});

export type CriarTeamInput = z.infer<typeof criarTeamInputSchema>;

export const teamViewSchema = teamBaseSchema.extend({
  teamId: z.string().uuid(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeamView = z.infer<typeof teamViewSchema>;

export const atualizarTeamInputSchema = z.object({
  orgId: z.string().min(1),
  teamId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(255).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(1024).optional().nullable(),
  status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
  ordem: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type AtualizarTeamInput = z.infer<typeof atualizarTeamInputSchema>;

export const listarTeamsInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "arquivado"]).optional(),
    departmentId: z.string().uuid().optional().nullable(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarTeamsInput = z.infer<typeof listarTeamsInputSchema>;

export const listarTeamsResultadoSchema = z.object({
  itens: z.array(teamViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarTeamsResultado = z.infer<typeof listarTeamsResultadoSchema>;
