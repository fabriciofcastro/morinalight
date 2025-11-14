import type {
  PrefichaAuditoriaFiltro,
  PrefichaAuditoriaPagina,
  PrefichaAuditoriaProps,
  PrefichaAuditoriaRepository,
} from "@morina/preficha-domain";
import { PrefichaAuditoria } from "@morina/preficha-domain";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(log: {
  id: string;
  prefichaId: string;
  orgId: string;
  action: string;
  actorId: string;
  payload: unknown;
  createdAt: Date;
}) {
  const props: PrefichaAuditoriaProps = {
    id: log.id,
    prefichaId: log.prefichaId,
    orgId: log.orgId,
    acao: log.action,
    actorId: log.actorId,
    payload: (log.payload as Record<string, unknown> | null) ?? null,
    criadoEm: log.createdAt,
  };

  return new PrefichaAuditoria(props);
}

export class PrismaPrefichaAuditoriaRepository implements PrefichaAuditoriaRepository {
  async registrar(log: PrefichaAuditoria) {
    const dados = log.dados;

    await prisma.prefichaAuditLog.create({
      data: {
        id: dados.id,
        prefichaId: dados.prefichaId,
        orgId: dados.orgId,
        action: dados.acao,
        actorId: dados.actorId,
        payload: dados.payload ?? undefined,
        createdAt: dados.criadoEm,
      },
    });
  }

  async listarPorPreficha(
    orgId: string,
    prefichaId: string,
    filtro: PrefichaAuditoriaFiltro = {},
  ): Promise<PrefichaAuditoriaPagina> {
    const limit = Math.min(filtro.limite ?? 20, 100);

    const andFilters: Array<Record<string, unknown>> = [{ orgId }, { prefichaId }];

    if (filtro.acao) {
      andFilters.push({ action: filtro.acao });
    }

    if (filtro.inicio) {
      andFilters.push({ createdAt: { gte: filtro.inicio } });
    }

    if (filtro.fim) {
      andFilters.push({ createdAt: { lte: filtro.fim } });
    }

    if (filtro.cursor) {
      andFilters.push({ id: { gt: filtro.cursor } });
    }

    const where = {
      AND: andFilters,
    };

    const records = await prisma.prefichaAuditLog.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = records.length > limit;
    const pageItems = hasMore ? records.slice(0, limit) : records;
    const last = pageItems.at(-1);

    return {
      itens: pageItems.map(toDomain),
      proximoCursor: last ? last.id : undefined,
    };
  }

  async listarFeed(
    orgId: string,
    filtro: PrefichaAuditoriaFiltro = {},
  ): Promise<PrefichaAuditoriaPagina> {
    const limit = Math.min(filtro.limite ?? 20, 100);

    const andFilters: Array<Record<string, unknown>> = [{ orgId }];

    if (filtro.acao) {
      andFilters.push({ action: filtro.acao });
    }

    if (filtro.inicio) {
      andFilters.push({ createdAt: { gte: filtro.inicio } });
    }

    if (filtro.fim) {
      andFilters.push({ createdAt: { lte: filtro.fim } });
    }

    if (filtro.cursor) {
      andFilters.push({ id: { gt: filtro.cursor } });
    }

    const where = {
      AND: andFilters,
    };

    const records = await prisma.prefichaAuditLog.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = records.length > limit;
    const pageItems = hasMore ? records.slice(0, limit) : records;
    const last = pageItems.at(-1);

    return {
      itens: pageItems.map(toDomain),
      proximoCursor: last ? last.id : undefined,
    };
  }
}
