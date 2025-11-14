import { z } from "zod";

import { produtoViewSchema } from "./product";

export const listarAuditoriaFeedInputSchema = z
  .object({
    orgId: z.string().min(1),
    acao: z.string().min(3).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
    inicio: z.coerce.date().optional(),
    fim: z.coerce.date().optional(),
  })
  .strict();

export type ListarAuditoriaFeedInput = z.infer<typeof listarAuditoriaFeedInputSchema>;

export const auditoriaFeedItemSchema = z.object({
  id: z.string().uuid(),
  produtoId: z.string().uuid(),
  orgId: z.string().min(1),
  acao: z.string().min(1),
  actorId: z.string().min(1),
  payload: z.unknown().nullable(),
  criadoEm: z.date(),
  produto: produtoViewSchema.nullable().optional(),
});

export type AuditoriaFeedItem = z.infer<typeof auditoriaFeedItemSchema>;

export const listarAuditoriaFeedResultadoSchema = z.object({
  itens: z.array(auditoriaFeedItemSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarAuditoriaFeedResultado = z.infer<
  typeof listarAuditoriaFeedResultadoSchema
>;

