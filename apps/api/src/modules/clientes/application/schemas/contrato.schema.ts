import { z } from "zod";

export const criarContratoInputSchema = z.object({
  orgId: z.string().min(1),
  representanteId: z.string().uuid(),
  numero: z.string().min(1).max(50),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().optional().nullable(),
  percentualComissao: z.number().min(0).max(100),
  valorMinimo: z.number().nonnegative().optional().nullable(),
  valorMaximo: z.number().nonnegative().optional().nullable(),
  termos: z.string().optional().nullable(),
  observacoes: z.string().max(2048).optional().nullable(),
});

export type CriarContratoInput = z.infer<typeof criarContratoInputSchema>;

export const contratoViewSchema = criarContratoInputSchema.extend({
  contratoId: z.string().uuid(),
  status: z.enum(["rascunho", "pendente_assinatura", "vigente", "encerrado", "cancelado"]),
  assinadoEm: z.date().optional().nullable(),
  assinadoPor: z.string().optional().nullable(),
  encerradoEm: z.date().optional().nullable(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContratoView = z.infer<typeof contratoViewSchema>;
