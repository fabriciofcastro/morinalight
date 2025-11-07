import type {
  ProdutoAuditoriaFiltro,
  ProdutoAuditoriaPagina,
  ProdutoAuditoriaRepository,
} from "@morina/catalogo-domain";
import { ProdutoAuditoria } from "@morina/catalogo-domain";

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
        payload: dados.payload ?? undefined,
        createdAt: dados.criadoEm,
      },
    });
  }

  async listarPorProduto(
    orgId: string,
    produtoId: string,
    filtro: ProdutoAuditoriaFiltro = {},
  ): Promise<ProdutoAuditoriaPagina> {
    const take = Math.min(filtro.limite ?? 20, 100);
    const where: Record<string, unknown> = {
      orgId,
      productId: produtoId,
    };

    if (filtro.acao) {
      where.action = filtro.acao;
    }

    if (filtro.inicio || filtro.fim) {
      where.createdAt = {
        ...(filtro.inicio ? { gte: filtro.inicio } : {}),
        ...(filtro.fim ? { lte: filtro.fim } : {}),
      };
    }

    const registros = await prisma.productAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      ...(filtro.cursor ? { skip: 1, cursor: { id: filtro.cursor } } : {}),
    });

    const itens = registros.map(
      (registro) =>
        new ProdutoAuditoria({
          id: registro.id,
          produtoId: registro.productId,
          orgId: registro.orgId,
          acao: registro.action,
          actorId: registro.actorId,
          payload: (registro.payload as Record<string, unknown> | null) ?? null,
          criadoEm: registro.createdAt,
        }),
    );

    const proximoCursor = itens.length === take ? itens[itens.length - 1]?.dados.id : undefined;

    return { itens, proximoCursor };
  }
}
