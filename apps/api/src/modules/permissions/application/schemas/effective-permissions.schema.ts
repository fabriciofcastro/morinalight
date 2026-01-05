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

export const securityPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  effect: z.enum(["ALLOW", "DENY"]),
  action: z.union([z.string(), z.array(z.string())]),
  subject: z.union([z.string(), z.array(z.string())]),
  conditions: z.record(z.any()).optional(), // ComplexCondition is hard to type fully in Zod, record(any) is safer for transmission
  priority: z.number(),
  orgId: z.string().optional(),
  active: z.boolean().optional(),
});

export const aclEntrySchema = z.object({
  id: z.string().optional(),
  subject: z.string(),
  subjectId: z.string(),
  userId: z.string().optional(),
  roleId: z.string().optional(),
  action: z.string(),
});

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
  policies: z.array(securityPolicySchema).optional(),
  aclEntries: z.array(aclEntrySchema).optional(),
});

export type ResolverPermissoesEfetivasResultado = z.infer<
  typeof resolverPermissoesEfetivasResultadoSchema
>;
