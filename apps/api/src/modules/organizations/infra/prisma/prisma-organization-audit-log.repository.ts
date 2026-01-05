import { randomUUID } from "node:crypto";

import type { DomainEventBus } from "@morina/shared-kernel";

import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../../infra/database/prisma.service";
import type {
  OrganizationAuditLogFilter,
  OrganizationAuditLogPage,
  OrganizationAuditLogRepository,
} from "../../repositories/organization-audit-log.repository";
import { siemExporter } from "../../../../lib/siem/siem-exporter";

const prisma = getPrisma();

export class PrismaOrganizationAuditLogRepository implements OrganizationAuditLogRepository {
  constructor(private readonly options: { eventBus?: DomainEventBus } = {}) { }

  async registrar(entry: {
    orgId: string;
    action: string;
    actorId: string;
    targetId?: string | null;
    payload?: Record<string, unknown> | null;
    createdAt?: Date;
  }): Promise<void> {
    const createdAt = entry.createdAt ?? new Date();

    // Verificar se a organização existe antes de criar o log
    // Se orgId for "system" ou não existir, tentar usar uma organização padrão ou pular o log
    let orgIdToUse = entry.orgId;

    if (entry.orgId === "system") {
      // Tentar encontrar uma organização padrão ou criar uma organização "system"
      const systemOrg = await prisma.organization.findUnique({
        where: { id: "system" },
      });

      if (!systemOrg) {
        // Se não existir organização "system", tentar usar a primeira organização disponível
        // ou pular o log de auditoria para evitar erro de foreign key
        const firstOrg = await prisma.organization.findFirst({
          select: { id: true },
        });

        if (firstOrg) {
          orgIdToUse = firstOrg.id;
        } else {
          // Se não houver nenhuma organização, não criar o log
          // Isso pode acontecer durante setup inicial
          console.warn(
            `Não foi possível criar log de auditoria: organização "${entry.orgId}" não existe e nenhuma organização está disponível`,
          );
          return;
        }
      }
    } else {
      // Verificar se a organização existe
      const orgExists = await prisma.organization.findUnique({
        where: { id: entry.orgId },
        select: { id: true },
      });

      if (!orgExists) {
        console.warn(
          `Não foi possível criar log de auditoria: organização "${entry.orgId}" não existe`,
        );
        return;
      }
    }

    const registro = await prisma.organizationAuditLog.create({
      data: {
        orgId: orgIdToUse,
        action: entry.action,
        actorId: entry.actorId,
        targetId: entry.targetId ?? null,
        payload: entry.payload ? (entry.payload as Prisma.InputJsonValue) : undefined,
        createdAt,
      },
    });

    // Pipe to SIEM
    siemExporter.log({
      timestamp: createdAt.toISOString(),
      source: "audit-log",
      action: entry.action,
      severity: this.mapActionToSeverity(entry.action),
      actorId: entry.actorId,
      orgId: orgIdToUse,
      payload: entry.payload || {},
    });

    await this.publishRealtime({
      id: registro.id,
      orgId: registro.orgId,
      action: registro.action,
      actorId: registro.actorId,
      targetId: registro.targetId,
      payload: (registro.payload as Record<string, unknown> | null) ?? null,
      createdAt: registro.createdAt,
    });
  }

  async listar(
    orgId: string,
    filtro: OrganizationAuditLogFilter = {},
  ): Promise<OrganizationAuditLogPage> {
    const take = Math.min(filtro.limite ?? 20, 100);

    const where: Array<Record<string, unknown>> = [{ orgId }];

    if (filtro.acao) {
      where.push({ action: filtro.acao });
    }

    if (filtro.inicio || filtro.fim) {
      where.push({
        createdAt: {
          ...(filtro.inicio ? { gte: filtro.inicio } : {}),
          ...(filtro.fim ? { lte: filtro.fim } : {}),
        },
      });
    }

    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      where.push({
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          {
            AND: [{ createdAt: cursor.createdAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const registros = await prisma.organizationAuditLog.findMany({
      where: { AND: where },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    });

    const last = registros.at(-1);

    return {
      itens: registros.map((registro) => ({
        id: registro.id,
        orgId: registro.orgId,
        action: registro.action,
        actorId: registro.actorId,
        targetId: registro.targetId,
        payload: (registro.payload as Record<string, unknown> | null) ?? null,
        createdAt: registro.createdAt,
      })),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  private mapActionToSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalActions = ['auth.login_failure_critical', 'security.ids_block', 'lgpd.data_deletion'];
    const highActions = ['auth.password_change', 'auth.mfa_disabled', 'permission.update'];
    const mediumActions = ['organization.update', 'branch.delete', 'user.invite'];

    if (criticalActions.some(a => action.includes(a))) return 'critical';
    if (highActions.some(a => action.includes(a))) return 'high';
    if (mediumActions.some(a => action.includes(a))) return 'medium';
    return 'low';
  }

  private async publishRealtime(record: {
    id: string;
    orgId: string;
    action: string;
    actorId: string;
    targetId: string | null;
    payload: Record<string, unknown> | null;
    createdAt: Date;
  }) {
    if (!this.options.eventBus) return;

    await this.options.eventBus.publish({
      name: "Organizations.AuditLog",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId: record.orgId,
        actorId: record.actorId,
        timestamp: record.createdAt,
      },
      payload: {
        id: record.id,
        action: record.action,
        targetId: record.targetId,
        data: record.payload,
      },
    });
  }
}

function encodeCursor(registro: { id: string; createdAt: Date }) {
  const data = JSON.stringify({ id: registro.id, createdAt: registro.createdAt.toISOString() });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw) as { id: string; createdAt: string };
    return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
