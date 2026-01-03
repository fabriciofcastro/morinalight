import { getPrisma } from "../../../../infra/database/prisma.service";
import type { Prisma } from "@prisma/client";
import type { VendaProps, VendaStatus } from "../../domain/entities/venda";
import { Venda } from "../../domain/entities/venda";
import type { VendaRepository } from "../services/venda-sync.service";

const prisma = getPrisma();

function toDomain(record: {
  id: string;
  orgId: string;
  clienteId: string;
  numeroPedido: string;
  numeroNotaFiscal: string | null;
  dataVenda: Date;
  dataPagamento: Date | null;
  valorTotal: Prisma.Decimal | number;
  valorComissao: Prisma.Decimal | number;
  status: string;
  observacoes: string | null;
  emillenniumPedidoId: string | null;
  emillenniumSyncAt: Date | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const props: VendaProps = {
    id: record.id,
    orgId: record.orgId,
    clienteId: record.clienteId,
    numeroPedido: record.numeroPedido,
    numeroNotaFiscal: record.numeroNotaFiscal,
    dataVenda: record.dataVenda,
    dataPagamento: record.dataPagamento,
    valorTotal: Number(record.valorTotal),
    valorComissao: Number(record.valorComissao),
    status: record.status as VendaStatus,
    observacoes: record.observacoes,
    emillenniumPedidoId: record.emillenniumPedidoId,
    emillenniumSyncAt: record.emillenniumSyncAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  return Venda.restaurar(props);
}

export class PrismaVendaRepository implements VendaRepository {
  async salvar(venda: Venda) {
    const dados = venda.dados;

    await prisma.venda.upsert({
      where: { id: venda.vendaId },
      create: {
        id: venda.vendaId,
        orgId: dados.orgId,
        clienteId: dados.clienteId,
        numeroPedido: dados.numeroPedido,
        numeroNotaFiscal: dados.numeroNotaFiscal,
        dataVenda: dados.dataVenda,
        dataPagamento: dados.dataPagamento,
        valorTotal: dados.valorTotal,
        valorComissao: dados.valorComissao,
        status: dados.status,
        observacoes: dados.observacoes,
        emillenniumPedidoId: dados.emillenniumPedidoId ?? null,
        emillenniumSyncAt: dados.emillenniumSyncAt ?? null,
        createdBy: dados.createdBy,
        updatedBy: dados.updatedBy,
        createdAt: dados.createdAt,
        updatedAt: dados.updatedAt,
      },
      update: {
        numeroNotaFiscal: dados.numeroNotaFiscal,
        dataPagamento: dados.dataPagamento,
        valorTotal: dados.valorTotal,
        valorComissao: dados.valorComissao,
        status: dados.status,
        observacoes: dados.observacoes,
        emillenniumSyncAt: dados.emillenniumSyncAt,
        updatedBy: dados.updatedBy,
        updatedAt: dados.updatedAt,
      },
    });
  }

  async encontrarPorNumeroPedido(orgId: string, numeroPedido: string) {
    const record = await prisma.venda.findFirst({
      where: { orgId, numeroPedido },
    });

    return record ? toDomain(record) : null;
  }

  async encontrarPorEmillenniumId(orgId: string, emillenniumPedidoId: string) {
    const record = await prisma.venda.findFirst({
      where: { orgId, emillenniumPedidoId },
    });

    return record ? toDomain(record) : null;
  }
}
