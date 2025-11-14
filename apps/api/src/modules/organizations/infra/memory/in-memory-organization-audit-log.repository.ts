import { randomUUID } from "node:crypto";

import type { DomainEventBus } from "@morina/shared-kernel";

import type {
  OrganizationAuditLogFilter,
  OrganizationAuditLogPage,
  OrganizationAuditLogRecord,
  OrganizationAuditLogRepository,
} from "../../repositories/organization-audit-log.repository";

type StoredRecord = OrganizationAuditLogRecord;

export class InMemoryOrganizationAuditLogRepository implements OrganizationAuditLogRepository {
  public readonly registros: StoredRecord[] = [];
  private readonly eventBus?: DomainEventBus;

  constructor(options: { eventBus?: DomainEventBus } = {}) {
    this.eventBus = options.eventBus;
  }

  async registrar(entry: {
    orgId: string;
    action: string;
    actorId: string;
    targetId?: string | null;
    payload?: Record<string, unknown> | null;
    createdAt?: Date;
  }): Promise<void> {
    const createdAt = entry.createdAt ?? new Date();
    const record: StoredRecord = {
      id: randomUUID(),
      orgId: entry.orgId,
      action: entry.action,
      actorId: entry.actorId,
      targetId: entry.targetId ?? null,
      payload: entry.payload ?? null,
      createdAt,
    };

    this.registros.push(record);
    await this.publishRealtime(record);
  }

  async listar(
    orgId: string,
    filtro: OrganizationAuditLogFilter = {},
  ): Promise<OrganizationAuditLogPage> {
    const limite = Math.min(filtro.limite ?? 20, 100);
    const registros = this.registros
      .filter((registro) => {
        if (registro.orgId !== orgId) return false;
        if (filtro.acao && registro.action !== filtro.acao) return false;
        if (filtro.inicio && registro.createdAt < filtro.inicio) return false;
        if (filtro.fim && registro.createdAt > filtro.fim) return false;
        return true;
      })
      .sort((a, b) => {
        const diff = b.createdAt.getTime() - a.createdAt.getTime();
        if (diff !== 0) return diff;
        return b.id.localeCompare(a.id);
      });

    let startIndex = 0;
    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      startIndex = registros.findIndex(
        (registro) =>
          registro.id === cursor.id && registro.createdAt.getTime() === cursor.createdAt.getTime(),
      );
      startIndex = startIndex >= 0 ? startIndex + 1 : 0;
    }

    const slice = registros.slice(startIndex, startIndex + limite);
    const last = slice.at(-1);

    return {
      itens: slice,
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }

  clear() {
    this.registros.length = 0;
  }

  private async publishRealtime(record: StoredRecord) {
    if (!this.eventBus) return;

    await this.eventBus.publish({
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
        targetId: record.targetId ?? null,
        data: record.payload ?? null,
      },
    });
  }
}

function encodeCursor(registro: { id: string; createdAt: Date }) {
  const raw = JSON.stringify({ id: registro.id, createdAt: registro.createdAt.toISOString() });
  return Buffer.from(raw).toString("base64url");
}

function decodeCursor(cursor: string) {
  const raw = Buffer.from(cursor, "base64url").toString("utf-8");
  const parsed = JSON.parse(raw) as { id: string; createdAt: string };
  return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
}
