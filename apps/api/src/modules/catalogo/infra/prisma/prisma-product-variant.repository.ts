import type {
  ProductVariant,
  ProductVariantProps,
  ProductVariantRepository,
} from "@morina/catalogo-domain";
import { ProductVariant as ProductVariantEntity } from "@morina/catalogo-domain";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(variant: {
  id: string;
  productId: string;
  orgId: string;
  sku: string;
  nome: string;
  atributos: unknown;
  preco: unknown;
  estoque: number | null;
  ativo: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: ProductVariantProps = {
    productId: variant.productId,
    orgId: variant.orgId,
    sku: variant.sku,
    nome: variant.nome,
    atributos: variant.atributos as ProductVariantProps["atributos"],
    preco: typeof variant.preco === "number" ? variant.preco : null,
    estoque: variant.estoque,
    ativo: variant.ativo,
    createdBy: variant.createdBy,
    updatedBy: variant.updatedBy,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };

  return ProductVariantEntity.restaurar(props, variant.id);
}

export class PrismaProductVariantRepository implements ProductVariantRepository {
  async criar(variante: ProductVariant) {
    const dados = variante.dados;

    await prisma.productVariant.create({
      data: {
        id: variante.varianteId,
        productId: dados.productId,
        orgId: dados.orgId,
        sku: dados.sku,
        nome: dados.nome,
        atributos: dados.atributos,
        preco: dados.preco ? dados.preco : null,
        estoque: dados.estoque ?? 0,
        ativo: dados.ativo,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async atualizar(variante: ProductVariant) {
    const dados = variante.dados;

    await prisma.productVariant.update({
      where: { id: variante.varianteId },
      data: {
        nome: dados.nome,
        atributos: dados.atributos,
        preco: dados.preco ? dados.preco : null,
        estoque: dados.estoque ?? 0,
        ativo: dados.ativo,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(varianteId: string, orgId: string) {
    const record = await prisma.productVariant.findUnique({
      where: { id: varianteId },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorSku(sku: string, orgId: string) {
    const record = await prisma.productVariant.findFirst({
      where: { orgId, sku },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorProduto(
    productId: string,
    orgId: string,
    options: {
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    } = {},
  ) {
    const limit = Math.min(Math.max(options.limite ?? 20, 1), 50);

    const andFilters: Array<unknown> = [{ productId, orgId }];

    if (options.ativo !== undefined) {
      andFilters.push({ ativo: options.ativo });
    }

    if (options.cursor) {
      const cursor = decodeCursor(options.cursor);
      andFilters.push({
        OR: [
          { updatedAt: { lt: cursor.updatedAt } },
          {
            AND: [{ updatedAt: cursor.updatedAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where = {
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.productVariant.findMany({
      where,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : null,
    };
  }

  async listarPorOrg(
    orgId: string,
    options: {
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    } = {},
  ) {
    const limit = Math.min(Math.max(options.limite ?? 20, 1), 50);

    const andFilters: Array<unknown> = [{ orgId }];

    if (options.ativo !== undefined) {
      andFilters.push({ ativo: options.ativo });
    }

    if (options.cursor) {
      const cursor = decodeCursor(options.cursor);
      andFilters.push({
        OR: [
          { updatedAt: { lt: cursor.updatedAt } },
          {
            AND: [{ updatedAt: cursor.updatedAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const where = {
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.productVariant.findMany({
      where,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : null,
    };
  }

  async contarPorProduto(productId: string, orgId: string, ativo?: boolean) {
    const where: {
      productId: string;
      orgId: string;
      ativo?: boolean;
    } = { productId, orgId };
    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    return await prisma.productVariant.count({ where });
  }

  async remover(varianteId: string, orgId: string) {
    await prisma.productVariant.deleteMany({
      where: {
        id: varianteId,
        orgId,
      },
    });
  }
}

function encodeCursor(variant: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: variant.id,
    updatedAt: variant.updatedAt.toISOString(),
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
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (_error) {
    throw new Error("Cursor inválido");
  }
}
