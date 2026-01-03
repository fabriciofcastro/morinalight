import { z } from "zod";

export const resolverPermissoesEfetivasInputSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().uuid(),
});

export type ResolverPermissoesEfetivasInput = z.infer<typeof resolverPermissoesEfetivasInputSchema>;

export const permissionGrantSchema = z.object({
  permissionKey: z.string().min(1),
  granted: z.boolean(),
  source: z.enum(["role", "department", "sector", "position", "custom"]).optional(),
  sourceEntityId: z.string().optional(),
});

export type PermissionGrant = z.infer<typeof permissionGrantSchema>;

export const resolverPermissoesEfetivasResultadoSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().min(1),
  role: z.string().nullable(),
  effective: z.array(permissionGrantSchema),
  denied: z.array(z.string().min(1)),
  breakdown: z.object({
    role: z.array(z.string().min(1)),
    departments: z.array(permissionGrantSchema),
    sectors: z.array(permissionGrantSchema),
    positions: z.array(permissionGrantSchema),
    custom: z.array(permissionGrantSchema),
  }),
  context: z.object({
    departmentId: z.string().optional(),
    sectorId: z.string().optional(),
    positionId: z.string().optional(),
    attributes: z.record(z.any()).optional(),
  }).optional(),
});

export type ResolverPermissoesEfetivasResultado = z.infer<
  typeof resolverPermissoesEfetivasResultadoSchema
>;
