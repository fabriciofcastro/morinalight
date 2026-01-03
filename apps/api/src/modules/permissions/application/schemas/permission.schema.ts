import { z } from "zod";

export const permissionViewSchema = z.object({
  permissionId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  module: z.string(),
  category: z.string(),
  resource: z.string(),
  action: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PermissionView = z.infer<typeof permissionViewSchema>;

export const criarPermissionInputSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(512).optional().nullable(),
  module: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(50),
});

export type CriarPermissionInput = z.infer<typeof criarPermissionInputSchema>;

export const atualizarPermissionInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(512).optional().nullable(),
  module: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(100).optional(),
  resource: z.string().min(1).max(100).optional(),
  action: z.string().min(1).max(50).optional(),
});

export type AtualizarPermissionInput = z.infer<typeof atualizarPermissionInputSchema>;

export const listarPermissionsInputSchema = z.object({
  module: z.string().optional(),
  category: z.string().optional(),
  resource: z.string().optional(),
  busca: z.string().min(2).max(120).optional(),
});

export type ListarPermissionsInput = z.infer<typeof listarPermissionsInputSchema>;

export const listarPermissionsResultadoSchema = z.object({
  itens: z.array(permissionViewSchema),
});

export type ListarPermissionsResultado = z.infer<typeof listarPermissionsResultadoSchema>;
