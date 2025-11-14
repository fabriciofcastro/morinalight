import { randomUUID } from "node:crypto";

export type VendaStatus = "pendente" | "confirmada" | "cancelada";

export type VendaProps = {
  id: string;
  orgId: string;
  clienteId: string;
  numeroPedido: string;
  numeroNotaFiscal?: string | null;
  dataVenda: Date;
  dataPagamento?: Date | null;
  valorTotal: number;
  valorComissao: number;
  status: VendaStatus;
  observacoes?: string | null;
  // Campos de sincronização com e-millennium
  emillenniumPedidoId?: string | null;
  emillenniumSyncAt?: Date | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Venda {
  constructor(private readonly props: VendaProps) {
    if (!props.orgId) {
      throw new Error("Venda requer orgId");
    }

    if (!props.clienteId) {
      throw new Error("Venda requer clienteId");
    }

    if (!props.numeroPedido) {
      throw new Error("Venda requer número do pedido");
    }

    if (props.valorTotal < 0) {
      throw new Error("Valor total não pode ser negativo");
    }

    if (props.valorComissao < 0) {
      throw new Error("Valor da comissão não pode ser negativo");
    }
  }

  static criar(
    input: Omit<VendaProps, "id" | "criadoEm" | "atualizadoEm" | "status"> & {
      status?: VendaStatus;
    },
  ) {
    const agora = new Date();
    return new Venda({
      ...input,
      id: randomUUID(),
      status: input.status ?? "pendente",
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: VendaProps) {
    return new Venda({ ...props });
  }

  get vendaId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  confirmar(actorId: string) {
    this.props.status = "confirmada";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  cancelar(actorId: string, motivo?: string) {
    this.props.status = "cancelada";
    if (motivo) {
      this.props.observacoes = `${this.props.observacoes ?? ""}\nCancelamento: ${motivo}`.trim();
    }
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  registrarPagamento(dataPagamento: Date, actorId: string) {
    this.props.dataPagamento = dataPagamento;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}

