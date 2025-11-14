import { z } from "zod";

export const representanteBaseSchema = z.object({
  orgId: z.string().min(1),
  clienteId: z.string().uuid(),
  nome: z.string().min(2).max(255),
  documento: z.string().min(11).max(20),
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  celular: z.string().max(20).optional().nullable(),
  endereco: z.string().max(512).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  percentualComissao: z.number().min(0).max(100),
  observacoes: z.string().max(2048).optional().nullable(),
});

export const criarRepresentanteInputSchema = representanteBaseSchema.pick({
  orgId: true,
  clienteId: true,
  nome: true,
  documento: true,
  email: true,
  telefone: true,
  celular: true,
  endereco: true,
  cidade: true,
  estado: true,
  cep: true,
  percentualComissao: true,
  observacoes: true,
});

export type CriarRepresentanteInput = z.infer<typeof criarRepresentanteInputSchema>;

export const representanteViewSchema = representanteBaseSchema.extend({
  representanteId: z.string().uuid(),
  status: z.enum(["ativo", "inativo", "suspenso"]),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RepresentanteView = z.infer<typeof representanteViewSchema>;

export const listarRepresentantesInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarRepresentantesInput = z.infer<typeof listarRepresentantesInputSchema>;

export const listarRepresentantesResultadoSchema = z.object({
  itens: z.array(representanteViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarRepresentantesResultado = z.infer<typeof listarRepresentantesResultadoSchema>;
