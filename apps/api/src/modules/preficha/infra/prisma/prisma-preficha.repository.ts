import type {
  PrefichaListaFiltro,
  PrefichaListaPagina,
  PrefichaProps,
  PrefichaRepository,
  PrefichaStatus,
} from "@morina/preficha-domain";
import { Preficha } from "@morina/preficha-domain";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(preficha: {
  id: string;
  orgId: string;
  produtoId: string;
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  aprovadores: Array<{
    userId: string;
    aprovado: boolean;
    aprovadoEm: Date | null;
    comentario: string | null;
  }>;
  comentarios: Array<{
    id: string;
    userId: string;
    comentario: string;
    createdAt: Date;
  }>;
}) {
  const props: PrefichaProps = {
    orgId: preficha.orgId,
    produtoId: preficha.produtoId,
    status: preficha.status as PrefichaStatus,
    aprovadores: preficha.aprovadores.map((a) => ({
      userId: a.userId,
      aprovado: a.aprovado,
      aprovadoEm: a.aprovadoEm,
      comentario: a.comentario,
    })),
    comentarios: preficha.comentarios.map((c) => ({
      id: c.id,
      userId: c.userId,
      comentario: c.comentario,
      criadoEm: c.createdAt,
    })),
    criadoPor: preficha.createdBy,
    atualizadoPor: preficha.updatedBy,
    criadoEm: preficha.createdAt,
    atualizadoEm: preficha.updatedAt,
  };

  return Preficha.restaurar(props, preficha.id);
}

export class PrismaPrefichaRepository implements PrefichaRepository {
  async salvar(preficha: Preficha) {
    const dados = preficha.dados;

    // Primeiro, criar ou atualizar a preficha
    await prisma.preficha.upsert({
      where: { id: preficha.prefichaId },
      create: {
        id: preficha.prefichaId,
        orgId: dados.orgId,
        produtoId: dados.produtoId,
        status: dados.status,
        createdBy: dados.criadoPor,
        updatedBy: dados.atualizadoPor,
        createdAt: dados.criadoEm,
        updatedAt: dados.atualizadoEm,
      },
      update: {
        status: dados.status,
        updatedBy: dados.atualizadoPor,
        updatedAt: dados.atualizadoEm,
      },
    });

    // Atualizar aprovadores (usar upsert para cada um)
    await Promise.all(
      dados.aprovadores.map((aprovador) =>
        prisma.prefichaAprovador.upsert({
          where: {
            prefichaId_userId: {
              prefichaId: preficha.prefichaId,
              userId: aprovador.userId,
            },
          },
          create: {
            prefichaId: preficha.prefichaId,
            userId: aprovador.userId,
            aprovado: aprovador.aprovado,
            aprovadoEm: aprovador.aprovadoEm,
            comentario: aprovador.comentario,
          },
          update: {
            aprovado: aprovador.aprovado,
            aprovadoEm: aprovador.aprovadoEm,
            comentario: aprovador.comentario,
          },
        }),
      ),
    );

    // Remover aprovadores que não estão mais na lista
    const userIds = dados.aprovadores.map((a) => a.userId);
    await prisma.prefichaAprovador.deleteMany({
      where: {
        prefichaId: preficha.prefichaId,
        userId: { notIn: userIds },
      },
    });

    // Adicionar comentários (apenas criar novos)
    await prisma.prefichaComentario.createMany({
      data: dados.comentarios.map((c) => ({
        id: c.id,
        prefichaId: preficha.prefichaId,
        userId: c.userId,
        comentario: c.comentario,
        createdAt: c.criadoEm,
      })),
      skipDuplicates: true,
    });
  }

  async encontrarPorId(orgId: string, prefichaId: string) {
    const record = await prisma.preficha.findUnique({
      where: { id: prefichaId },
      include: {
        aprovadores: true,
        comentarios: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorProdutoId(orgId: string, produtoId: string) {
    const record = await prisma.preficha.findFirst({
      where: { orgId, produtoId },
      include: {
        aprovadores: true,
        comentarios: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: PrefichaListaFiltro = {}): Promise<PrefichaListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters: Array<Record<string, unknown>> = [];

    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }

    if (filtro.produtoId) {
      andFilters.push({ produtoId: filtro.produtoId });
    }

    if (filtro.busca) {
      andFilters.push({
        OR: [
          { produtoId: { contains: filtro.busca, mode: "insensitive" } },
          {
            product: {
              OR: [
                { name: { contains: filtro.busca, mode: "insensitive" } },
                { description: { contains: filtro.busca, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    if (filtro.cursor) {
      const cursor = decodeCursor(filtro.cursor);
      andFilters.push({
        OR: [
          { updatedAt: { lt: cursor.atualizadoEm } },
          {
            AND: [{ updatedAt: cursor.atualizadoEm }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.preficha.findMany({
      where,
      include: {
        aprovadores: true,
        comentarios: {
          orderBy: { createdAt: "asc" },
        },
      },
      take: limit + 1,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const hasMore = records.length > limit;
    const pageItems = hasMore ? records.slice(0, limit) : records;
    const last = pageItems.at(-1);

    return {
      itens: pageItems.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }
}

function encodeCursor(preficha: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: preficha.id,
    atualizadoEm: preficha.updatedAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      atualizadoEm: string;
    };
    return {
      id: parsed.id,
      atualizadoEm: new Date(parsed.atualizadoEm),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}

