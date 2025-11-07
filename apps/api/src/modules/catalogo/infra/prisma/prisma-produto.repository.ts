import type { ProdutoProps, ProdutoRepository, ProdutoStatus } from "@morina/catalogo-domain";
import { Produto } from "@morina/catalogo-domain";

import { getPrisma } from "../../../../infra/database/prisma.service";

const prisma = getPrisma();

function toDomain(product: {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
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
        status: dados.status,
        createdBy: dados.criadoPor,
        updatedBy: dados.atualizadoPor,
        createdAt: dados.criadoEm,
        updatedAt: dados.atualizadoEm,
      },
      update: {
        name: dados.nome,
        description: dados.descricao,
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
}
