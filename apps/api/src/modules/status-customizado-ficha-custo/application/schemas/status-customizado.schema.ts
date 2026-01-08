import { z } from "zod";

export const createStatusCustomizadoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido (ex: #3b82f6)"),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export const updateStatusCustomizadoSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  descricao: z.string().max(500).optional().nullable(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export const listarStatusCustomizadosQuerySchema = z.object({
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  busca: z.string().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  tamanhoPagina: z.coerce.number().int().min(1).max(100).default(20),
  ordenacaoCampo: z.enum(["nome", "cor", "ordem", "createdAt"]).optional().default("ordem"),
  ordenacaoDirecao: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateStatusCustomizadoInput = z.infer<typeof createStatusCustomizadoSchema>;
export type UpdateStatusCustomizadoInput = z.infer<typeof updateStatusCustomizadoSchema>;
export type ListarStatusCustomizadosQuery = z.infer<typeof listarStatusCustomizadosQuerySchema>;
