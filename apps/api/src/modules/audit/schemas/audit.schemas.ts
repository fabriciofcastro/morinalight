import { z } from "zod";

/**
 * Schema para busca de auditoria
 */
export const auditSearchSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  subject: z.string().optional(),
  effect: z.enum(["ALLOW", "DENY"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minRiskScore: z.number().min(0).max(100).optional(),
  hasAnomalies: z.boolean().optional(),
  ipAddress: z.string().ip().optional(),
  country: z.string().length(2).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(1000).optional(),
});

export type AuditSearchDto = z.infer<typeof auditSearchSchema>;

/**
 * Schema para relatório de compliance
 */
export const complianceReportSchema = z.object({
  type: z.enum(["LGPD", "SOC2", "ISO27001"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type ComplianceReportDto = z.infer<typeof complianceReportSchema>;

/**
 * Schema para exportação de logs
 */
export const exportLogsSchema = z.object({
  format: z.enum(["CSV", "JSON", "PDF"]),
  ...auditSearchSchema.shape,
});

export type ExportLogsDto = z.infer<typeof exportLogsSchema>;
