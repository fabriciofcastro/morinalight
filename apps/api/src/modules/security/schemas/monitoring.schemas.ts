import { z } from "zod";

/**
 * Schema para criar alerta
 */
export const createAlertSchema = z.object({
  userId: z.string().uuid(),
  alertType: z.string().min(1).max(100),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  country: z.string().length(2).optional(),
  city: z.string().optional(),
});

export type CreateAlertDto = z.infer<typeof createAlertSchema>;

/**
 * Schema para filtrar alertas
 */
export const listAlertsSchema = z.object({
  userId: z.string().uuid().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  acknowledged: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.number().min(1).max(500).optional(),
});

export type ListAlertsDto = z.infer<typeof listAlertsSchema>;

/**
 * Schema para criar sessão
 */
export const createSessionSchema = z.object({
  userId: z.string().uuid(),
  token: z.string().min(1),
  refreshToken: z.string().optional(),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  country: z.string().length(2).optional(),
  city: z.string().optional(),
  deviceId: z.string().optional(),
  expiresInMinutes: z.number().min(1).max(43200).optional(), // Max 30 dias
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
