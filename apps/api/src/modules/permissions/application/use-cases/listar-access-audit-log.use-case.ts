/**
 * Use Case: Listar Access Audit Log
 */

import { z } from "zod";
import type { AccessAuditLogRepository } from "../../domain/repositories/access-audit-log.repository";

const listarAccessAuditLogInputSchema = z
  .object({
    orgId: z.string().uuid(),
    userId: z.string().uuid().optional(),
    permission: z.string().optional(),
    granted: z.boolean().optional(),
    ipAddress: z.string().optional(),
    startDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export type ListarAccessAuditLogInput = z.infer<typeof listarAccessAuditLogInputSchema>;

type Dependencies = {
  accessAuditLogRepository: AccessAuditLogRepository;
};

export class ListarAccessAuditLogUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarAccessAuditLogInputSchema.parse(rawInput);

    return this.deps.accessAuditLogRepository.listar({
      orgId: input.orgId,
      userId: input.userId,
      permission: input.permission,
      granted: input.granted,
      ipAddress: input.ipAddress,
      startDate: input.startDate,
      endDate: input.endDate,
      cursor: input.cursor,
      limit: input.limit,
    });
  }
}
