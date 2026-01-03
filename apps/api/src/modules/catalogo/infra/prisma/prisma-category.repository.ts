import type { Category, CategoryProps, CategoryRepository } from "@morina/catalogo-domain";
import { Category as CategoryEntity } from "@morina/catalogo-domain";
import type { Prisma } from "@prisma/client";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(category: {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: CategoryProps = {
    orgId: category.orgId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    ordem: category.ordem,
    ativo: category.ativo,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };

  return CategoryEntity.restaurar(props, category.id);
}

export class PrismaCategoryRepository implements CategoryRepository {
  async criar(categoria: Category) {
    const dados = categoria.dados;

    await prisma.category.create({
      data: {
        id: categoria.categoriaId,
        orgId: dados.orgId,
        name: dados.name,
        slug: dados.slug,
        description: dados.description,
        parentId: dados.parentId,
        ordem: dados.ordem,
        ativo: dados.ativo,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async atualizar(categoria: Category) {
    const dados = categoria.dados;

    await prisma.category.update({
      where: { id: categoria.categoriaId },
      data: {
        name: dados.name,
        slug: dados.slug,
        description: dados.description,
        parentId: dados.parentId,
        ordem: dados.ordem,
        ativo: dados.ativo,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorId(categoriaId: string, orgId: string) {
    const record = await prisma.category.findUnique({
      where: { id: categoriaId },
    });

    if (!record || record.orgId !== orgId) {
      return null;
    }

    return toDomain(record);
  }

  async encontrarPorSlug(slug: string, orgId: string) {
    const record = await prisma.category.findFirst({
      where: { orgId, slug },
    });

    return record ? toDomain(record) : null;
  }

  async listarPorOrg(
    orgId: string,
    options: {
      parentId?: string | null;
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    } = {},
  ) {
    const limit = Math.min(Math.max(options.limite ?? 20, 1), 50);

    const andFilters: Prisma.CategoryWhereInput[] = [];

    if (options.parentId !== undefined) {
      andFilters.push({ parentId: options.parentId });
    }

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

    const where: Prisma.CategoryWhereInput = {
      orgId,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const records = await prisma.category.findMany({
      where,
      take: limit,
      orderBy: [{ ordem: "asc" }, { updatedAt: "desc" }, { id: "desc" }],
    });

    const last = records.at(-1);

    return {
      itens: records.map(toDomain),
      proximoCursor: last ? encodeCursor(last) : null,
    };
  }

  async listarPorParent(orgId: string, parentId: string | null) {
    const records = await prisma.category.findMany({
      where: {
        orgId,
        parentId,
      },
      orderBy: [{ ordem: "asc" }, { name: "asc" }],
    });

    return records.map(toDomain);
  }

  async contarPorOrg(orgId: string, ativo?: boolean) {
    const where: { orgId: string; ativo?: boolean } = { orgId };
    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    return await prisma.category.count({ where });
  }

  async remover(categoriaId: string, orgId: string) {
    await prisma.category.deleteMany({
      where: {
        id: categoriaId,
        orgId,
      },
    });
  }
}

function encodeCursor(category: { id: string; updatedAt: Date }) {
  const data = JSON.stringify({
    id: category.id,
    updatedAt: category.updatedAt.toISOString(),
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
