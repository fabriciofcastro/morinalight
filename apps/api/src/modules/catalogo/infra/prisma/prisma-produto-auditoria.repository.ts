import type {
  ProdutoAuditoriaFiltro,
  ProdutoAuditoriaPagina,
  ProdutoAuditoriaRepository,
} from "@morina/catalogo-domain";
import { ProdutoAuditoria } from "@morina/catalogo-domain";
import type { Prisma } from "@prisma/client";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

export class PrismaProdutoAuditoriaRepository implements ProdutoAuditoriaRepository {
  async registrar(log: ProdutoAuditoria) {
    const dados = log.dados;

    await prisma.productAuditLog.create({
      data: {
        id: dados.id,
        productId: dados.produtoId,
        orgId: dados.orgId,
        action: dados.acao,
        actorId: dados.actorId,
        payload: (dados.payload as Prisma.InputJsonValue | undefined) ?? undefined,
        createdAt: dados.criadoEm,
      },
    });
  }

  async listarPorProduto(
    orgId: string,
    produtoId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    return listar({
      orgId,
      produtoId,
      filtro,
    });
  }

  async listarFeed(
    orgId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    return listar({
      orgId,
      filtro,
    });
  }
}

async function listar({
  orgId,
  produtoId,
  filtro,
}: {
  orgId: string;
  produtoId?: string;
  filtro: ProdutoAuditoriaFiltro;
}): Promise<ProdutoAuditoriaPagina> {
  const take = Math.min(filtro.limite ?? 20, 100);

  const andFilters: Prisma.ProductAuditLogWhereInput[] = [{ orgId }];
  if (produtoId) {
    andFilters.push({ productId: produtoId });
  }
  if (filtro.acao) {
    andFilters.push({ action: filtro.acao });
  }
  if (filtro.inicio || filtro.fim) {
    andFilters.push({
      createdAt: {
        ...(filtro.inicio ? { gte: filtro.inicio } : {}),
        ...(filtro.fim ? { lte: filtro.fim } : {}),
      },
    });
  }
  if (filtro.cursor) {
    const cursor = decodeCursor(filtro.cursor);
    andFilters.push({
      OR: [
        { createdAt: { lt: cursor.criadoEm } },
        {
          AND: [{ createdAt: cursor.criadoEm }, { id: { lt: cursor.id } }],
        },
      ],
    });
  }

  const registros = await prisma.productAuditLog.findMany({
    where: { AND: andFilters },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
  });

  const itens = registros.map(toDomain);
  const last = registros.at(-1);

  return {
    itens,
    proximoCursor: last ? encodeCursor(last) : undefined,
  };
}

function toDomain(registro: {
  id: string;
  productId: string;
  orgId: string;
  action: string;
  actorId: string;
  payload: unknown;
  createdAt: Date;
}) {
  return new ProdutoAuditoria({
    id: registro.id,
    produtoId: registro.productId,
    orgId: registro.orgId,
    acao: registro.action,
    actorId: registro.actorId,
    payload: (registro.payload as Record<string, unknown> | null) ?? null,
    criadoEm: registro.createdAt,
  });
}

function encodeCursor(registro: { id: string; createdAt: Date }) {
  const data = JSON.stringify({
    id: registro.id,
    createdAt: registro.createdAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      createdAt: string;
    };
    return { id: parsed.id, criadoEm: new Date(parsed.createdAt) };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
