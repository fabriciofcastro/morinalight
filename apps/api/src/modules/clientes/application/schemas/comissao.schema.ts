import { z } from "zod";

export const comissaoViewSchema = z.object({
  comissaoId: z.string().uuid(),
  orgId: z.string().min(1),
  representanteId: z.string().uuid(),
  clienteId: z.string().uuid(),
  vendaId: z.string().uuid(),
  valorComissao: z.number().nonnegative(),
  percentualAplicado: z.number().min(0).max(100),
  dataVenda: z.date(),
  dataCalculo: z.date(),
  dataPagamento: z.date().optional().nullable(),
  status: z.enum(["pendente", "calculada", "paga", "cancelada"]),
  observacoes: z.string().max(1024).optional().nullable(),
  assinadoEm: z.date().optional().nullable(),
  assinadoPor: z.string().optional().nullable(),
  numeroPagamento: z.string().max(100).optional().nullable(),
  comprovantePagamento: z.string().max(512).optional().nullable(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ComissaoView = z.infer<typeof comissaoViewSchema>;

export const assinarComissaoInputSchema = z.object({
  orgId: z.string().min(1),
  comissaoId: z.string().uuid(),
  assinadoPor: z.string().min(1),
});

export type AssinarComissaoInput = z.infer<typeof assinarComissaoInputSchema>;

export const pagarComissaoInputSchema = z.object({
  orgId: z.string().min(1),
  comissaoId: z.string().uuid(),
  numeroPagamento: z.string().max(100).optional(),
  comprovantePagamento: z.string().max(512).optional(),
});

export type PagarComissaoInput = z.infer<typeof pagarComissaoInputSchema>;

export const listarComissoesInputSchema = z
  .object({
    orgId: z.string().min(1),
    representanteId: z.string().uuid().optional(),
    clienteId: z.string().uuid().optional(),
    status: z.enum(["pendente", "calculada", "paga", "cancelada"]).optional(),
    dataInicio: z.coerce.date().optional(),
    dataFim: z.coerce.date().optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarComissoesInput = z.infer<typeof listarComissoesInputSchema>;

export const listarComissoesResultadoSchema = z.object({
  itens: z.array(comissaoViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarComissoesResultado = z.infer<typeof listarComissoesResultadoSchema>;
