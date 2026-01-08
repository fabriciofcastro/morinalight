import { z } from "zod";

/**
 * Schema para criar janela de tempo
 */
export const createTimeWindowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato deve ser HH:mm"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato deve ser HH:mm"),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1),
  timezone: z.string().optional(),
  excludeDates: z.array(z.coerce.date()).optional(),
  includeDates: z.array(z.coerce.date()).optional(),
});

export type CreateTimeWindowDto = z.infer<typeof createTimeWindowSchema>;

/**
 * Schema para atualizar janela de tempo
 */
export const updateTimeWindowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  startTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  timezone: z.string().optional(),
  active: z.boolean().optional(),
});

export type UpdateTimeWindowDto = z.infer<typeof updateTimeWindowSchema>;

/**
 * Schema para atribuir janela de tempo
 */
export const assignTimeWindowSchema = z.object({
  targetType: z.enum(["user", "role"]),
  targetId: z.string().uuid(),
});

export type AssignTimeWindowDto = z.infer<typeof assignTimeWindowSchema>;

/**
 * Schema para validar acesso temporal
 */
export const validateTimeWindowSchema = z.object({
  userId: z.string().uuid(),
  timestamp: z.coerce.date().optional(),
});

export type ValidateTimeWindowDto = z.infer<typeof validateTimeWindowSchema>;

/**
 * Schema para acesso emergencial
 */
export const createEmergencyAccessSchema = z.object({
  userId: z.string().uuid(),
  durationMinutes: z.number().min(1).max(480), // Máximo 8 horas
  reason: z.string().min(1).max(500),
});

export type CreateEmergencyAccessDto = z.infer<typeof createEmergencyAccessSchema>;
