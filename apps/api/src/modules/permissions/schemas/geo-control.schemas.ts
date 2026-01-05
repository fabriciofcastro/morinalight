import { z } from 'zod';

/**
 * Schema para criar restrição geográfica
 */
export const createGeoRestrictionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['COUNTRY', 'IP_RANGE', 'CITY', 'STATE']),
    action: z.enum(['ALLOW', 'DENY']),
    countries: z.array(z.string().length(2)).optional(), // ISO codes
    ipRanges: z.array(z.string()).optional(), // CIDR notation
    cities: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    blockVpn: z.boolean().optional(),
    blockProxy: z.boolean().optional(),
    blockTor: z.boolean().optional(),
    priority: z.number().min(0).max(100).optional(),
});

export type CreateGeoRestrictionDto = z.infer<typeof createGeoRestrictionSchema>;

/**
 * Schema para atualizar restrição geográfica
 */
export const updateGeoRestrictionSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    countries: z.array(z.string().length(2)).optional(),
    ipRanges: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    blockVpn: z.boolean().optional(),
    blockProxy: z.boolean().optional(),
    blockTor: z.boolean().optional(),
    isActive: z.boolean().optional(),
    priority: z.number().min(0).max(100).optional(),
});

export type UpdateGeoRestrictionDto = z.infer<typeof updateGeoRestrictionSchema>;

/**
 * Schema para atribuir restrição geográfica
 */
export const assignGeoRestrictionSchema = z.object({
    targetType: z.enum(['user', 'role']),
    targetId: z.string().uuid(),
});

export type AssignGeoRestrictionDto = z.infer<typeof assignGeoRestrictionSchema>;

/**
 * Schema para validar acesso geográfico
 */
export const validateGeoAccessSchema = z.object({
    userId: z.string().uuid(),
    ipAddress: z.string().ip(),
});

export type ValidateGeoAccessDto = z.infer<typeof validateGeoAccessSchema>;
