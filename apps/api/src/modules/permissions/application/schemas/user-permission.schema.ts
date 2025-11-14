import { z } from "zod";

export const userPermissionViewSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  permissionId: z.string(),
  granted: z.boolean(),
  permissionKey: z.string(),
  permissionName: z.string(),
});

export type UserPermissionView = z.infer<typeof userPermissionViewSchema>;

export const atualizarUserPermissionsInputSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().uuid(),
  permissions: z.array(
    z.object({
      permissionId: z.string(),
      granted: z.boolean(),
    }),
  ),
});

export type AtualizarUserPermissionsInput = z.infer<
  typeof atualizarUserPermissionsInputSchema
>;

export const listarUserPermissionsInputSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().uuid().optional(),
});

export type ListarUserPermissionsInput = z.infer<
  typeof listarUserPermissionsInputSchema
>;

export const verificarPermissionInputSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().uuid(),
  permission: z.string(), // formato: "resource:action"
});

export type VerificarPermissionInput = z.infer<typeof verificarPermissionInputSchema>;


