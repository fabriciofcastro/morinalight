import { z } from "zod";

export const clienteBaseSchema = z.object({
  orgId: z.string().min(1, "orgId obrigatório"),
  nome: z.string().min(2).max(255),
  razaoSocial: z.string().max(255).optional().nullable(),
  tipo: z.enum(["fisica", "juridica"]).default("fisica"),
  documento: z.string().min(11).max(18), // CPF ou CNPJ
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  celular: z.string().max(20).optional().nullable(),
  endereco: z.string().max(512).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  observacoes: z.string().max(2048).optional().nullable(),
});

export const criarClienteInputSchema = clienteBaseSchema.pick({
  orgId: true,
  nome: true,
  razaoSocial: true,
  tipo: true,
  documento: true,
  email: true,
  telefone: true,
  celular: true,
  endereco: true,
  cidade: true,
  estado: true,
  cep: true,
  observacoes: true,
});

export type CriarClienteInput = z.infer<typeof criarClienteInputSchema>;

export const clienteViewSchema = clienteBaseSchema.extend({
  clienteId: z.string().uuid(),
  status: z.enum(["ativo", "inativo", "bloqueado"]),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClienteView = z.infer<typeof clienteViewSchema>;

export const atualizarClienteInputSchema = z.object({
  orgId: z.string().min(1),
  clienteId: z.string().uuid(),
  nome: z.string().min(2).max(255).optional(),
  razaoSocial: z.string().max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  celular: z.string().max(20).optional().nullable(),
  endereco: z.string().max(512).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  status: z.enum(["ativo", "inativo", "bloqueado"]).optional(),
  observacoes: z.string().max(2048).optional().nullable(),
});

export type AtualizarClienteInput = z.infer<typeof atualizarClienteInputSchema>;

export const listarClientesInputSchema = z
  .object({
    orgId: z.string().min(1),
    status: z.enum(["ativo", "inativo", "bloqueado"]).optional(),
    busca: z.string().min(2).max(120).optional(),
    cursor: z.string().optional(),
    limite: z.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListarClientesInput = z.infer<typeof listarClientesInputSchema>;

export const listarClientesResultadoSchema = z.object({
  itens: z.array(clienteViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type ListarClientesResultado = z.infer<typeof listarClientesResultadoSchema>;
