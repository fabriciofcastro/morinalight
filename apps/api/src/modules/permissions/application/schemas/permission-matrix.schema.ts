import { z } from "zod";
import { permissionViewSchema } from "./permission.schema";

export const roleMatrixSchema = z.object({
  role: z.string(),
  description: z.string().optional(),
  permissions: z.record(z.boolean()), // key -> boolean
});

export type RoleMatrix = z.infer<typeof roleMatrixSchema>;

export const permissionMatrixResponseSchema = z.object({
  roles: z.array(z.string()),
  permissions: z.array(
    permissionViewSchema.extend({
      roles: z.record(z.boolean()), // role -> boolean
    }),
  ),
});

export type PermissionMatrixResponse = z.infer<typeof permissionMatrixResponseSchema>;
