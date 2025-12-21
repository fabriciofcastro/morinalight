import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories/organizational-structure-audit-log.repository";
import { z } from "zod";

const listarOrganizationalStructureAuditLogInputSchema = z.object({
  orgId: z.string().uuid(),
  entityType: z.enum(["unit", "department", "team", "branch", "sector", "position", "subdepartment"]).optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
  cursor: z.string().optional(),
  limite: z.coerce.number().int().min(1).max(50).default(20),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  search: z.string().optional(),
});

const organizationalStructureAuditLogViewSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.string(),
  actorId: z.string().uuid(),
  payload: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
});

const listarOrganizationalStructureAuditLogResultadoSchema = z.object({
  itens: z.array(organizationalStructureAuditLogViewSchema),
  proximoCursor: z.string().nullable().optional(),
});

type Dependencies = {
  auditLogRepository: OrganizationalStructureAuditLogRepository;
};

export class ListarOrganizationalStructureAuditLogUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarOrganizationalStructureAuditLogInputSchema.parse(rawInput);

    const pagina = await this.deps.auditLogRepository.listar(input.orgId, {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      cursor: input.cursor,
      limite: input.limite,
    });

    // Filtrar por data se fornecido
    let itens = pagina.itens;
    if (input.dataInicio) {
      const dataInicio = new Date(input.dataInicio);
      itens = itens.filter((item) => item.createdAt >= dataInicio);
    }
    if (input.dataFim) {
      const dataFim = new Date(input.dataFim);
      itens = itens.filter((item) => item.createdAt <= dataFim);
    }

    // Filtrar por busca se fornecido
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      itens = itens.filter((item) => {
        const payloadStr = JSON.stringify(item.payload || {}).toLowerCase();
        return (
          item.entityType.toLowerCase().includes(searchLower) ||
          item.entityId.toLowerCase().includes(searchLower) ||
          item.action.toLowerCase().includes(searchLower) ||
          item.actorId.toLowerCase().includes(searchLower) ||
          payloadStr.includes(searchLower)
        );
      });
    }

    return listarOrganizationalStructureAuditLogResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}


