import type {
  ProdutoListaFiltro,
  ProdutoListaPagina,
  ProdutoProps,
  ProdutoRepository,
  ProdutoStatus,
} from "@morina/catalogo-domain";
import { Produto } from "@morina/catalogo-domain";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(product: {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: string | null;
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: ProdutoProps = {
    orgId: product.orgId,
    nome: product.name,
    descricao: product.description,
    sku: product.sku,
    categoryId: product.categoryId,
    status: product.status as ProdutoStatus,
    criadoPor: product.createdBy,
    atualizadoPor: product.updatedBy,
    criadoEm: product.createdAt,
    atualizadoEm: product.updatedAt,
  };

  return Produto.restaurar(props, product.id);
}

export class PrismaProdutoRepository implements ProdutoRepository {
  async salvar(produto: Produto) {
    const dados = produto.dados;

    await prisma.product.upsert({
      where: { id: produto.produtoId },
      create: {
        id: produto.produtoId,
        orgId: dados.orgId,
        name: dados.nome,
        description: dados.descricao,
        sku: dados.sku,
        categoryId: dados.categoryId,
        status: dados.status,
        createdBy: dados.criadoPor,
        updatedBy: dados.atualizadoPor,
        createdAt: dados.criadoEm,
        updatedAt: dados.atualizadoEm,
      },
      update: {
        name: dados.nome,
        description: dados.descricao,
        sku: dados.sku,
        categoryId: dados.categoryId,
        status: dados.status,
        updatedBy: dados.atualizadoPor,
        updatedAt: dados.atualizadoEm,
      },
    });
  }

  async encontrarPorId(orgId: string, produtoId: string) {
    const record = await prisma.product.findUnique({ where: { id: produtoId } });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorNome(orgId: string, nome: string) {
    const record = await prisma.product.findFirst({ where: { orgId, name: nome } });
    return record ? toDomain(record) : null;
  }

  async listarPorOrg(orgId: string, filtro: ProdutoListaFiltro = {}): Promise<ProdutoListaPagina> {
    const limit = Math.min(Math.max(filtro.limite ?? 20, 1), 50);

    const andFilters = [];
    if (filtro.status) {
      andFilters.push({ status: filtro.status });
    }
    if (filtro.busca) {
      andFilters.push({
        OR: [
          { name: { contains: filtro.busca, mode: "insensitive" } },
          { description: { contains: filtro.busca, mode: "insensitive" } },
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

    const records = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : undefined,
    };
  }
}

function encodeCursor(product: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: product.id,
    updatedAt: product.updatedAt.toISOString(),
  });
  return Buffer.from(data).toString("base64url");
}

function decodeCursor(cursor: string) {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8")) as {
      id: string;
      updatedAt: string;
    };
    return {
      id: parsed.id,
      atualizadoEm: new Date(parsed.updatedAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
