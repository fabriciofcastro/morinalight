import { z } from "zod";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";

const listarPermissionAuditLogInputSchema = z.object({
  orgId: z.string().uuid(),
  search: z.string().min(1).max(200).optional(),
  entityType: z.enum(["position", "sector", "department", "user"]).optional(),
  entityId: z.string().uuid().optional(),
  permissionId: z.string().optional(),
  action: z.enum(["granted", "denied", "removed"]).optional(),
  actorId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limite: z.number().min(1).max(50).optional().default(20),
});

type Dependencies = {
  auditLogRepository: PermissionAuditLogRepository;
};

export class ListarPermissionAuditLogUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissionAuditLogInputSchema.parse(rawInput);

    const filtro = {
      search: input.search,
      entityType: input.entityType,
      entityId: input.entityId,
      permissionId: input.permissionId,
      action: input.action,
      actorId: input.actorId ?? input.userId,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
      cursor: input.cursor,
      limite: input.limite,
    };

    const pagina = await this.deps.auditLogRepository.listar(input.orgId, filtro);

    return {
      itens: pagina.itens.map((log) => ({
        id: log.id,
        orgId: log.orgId,
        entityType: log.entityType,
        entityId: log.entityId,
        permissionId: log.permissionId,
        action: log.action,
        granted: log.granted,
        newValue: log.granted,
        previousValue: log.previousValue,
        actorId: log.actorId,
        userId: log.actorId,
        reason: log.reason,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      proximoCursor: pagina.proximoCursor ?? null,
    };
  }
}
