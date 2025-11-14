import { randomUUID } from "node:crypto";

export type ComissaoStatus = "pendente" | "calculada" | "paga" | "cancelada";

export type ComissaoProps = {
  id: string;
  orgId: string;
  representanteId: string;
  clienteId: string;
  vendaId: string;
  valorComissao: number;
  percentualAplicado: number;
  dataVenda: Date;
  dataCalculo: Date;
  dataPagamento?: Date | null;
  status: ComissaoStatus;
  observacoes?: string | null;
  // Rastreamento de assinatura
  assinadoEm?: Date | null;
  assinadoPor?: string | null;
  // Campos de pagamento
  numeroPagamento?: string | null;
  comprovantePagamento?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Comissao {
  constructor(private readonly props: ComissaoProps) {
    if (!props.orgId) {
      throw new Error("Comissão requer orgId");
    }

    if (!props.representanteId) {
      throw new Error("Comissão requer representanteId");
    }

    if (!props.clienteId) {
      throw new Error("Comissão requer clienteId");
    }

    if (!props.vendaId) {
      throw new Error("Comissão requer vendaId");
    }

    if (props.valorComissao < 0) {
      throw new Error("Valor da comissão não pode ser negativo");
    }

    if (props.percentualAplicado < 0 || props.percentualAplicado > 100) {
      throw new Error("Percentual aplicado deve estar entre 0 e 100");
    }
  }

  static criar(
    input: Omit<ComissaoProps, "id" | "dataCalculo" | "criadoEm" | "atualizadoEm" | "status"> & {
      status?: ComissaoStatus;
    },
  ) {
    const agora = new Date();
    return new Comissao({
      ...input,
      id: randomUUID(),
      dataCalculo: agora,
      status: input.status ?? "pendente",
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: ComissaoProps) {
    return new Comissao({ ...props });
  }

  get comissaoId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  /**
   * Assina a comissão - o representante assume responsabilidade pela venda
   */
  assinar(assinadoPor: string) {
    if (this.props.status !== "pendente" && this.props.status !== "calculada") {
      throw new Error("Comissão só pode ser assinada se estiver pendente ou calculada");
    }

    this.props.status = "calculada";
    this.props.assinadoEm = new Date();
    this.props.assinadoPor = assinadoPor;
    this.props.updatedAt = new Date();
  }

  /**
   * Marca a comissão como paga
   */
  marcarComoPaga(numeroPagamento?: string, comprovantePagamento?: string, actorId?: string) {
    if (this.props.status !== "calculada") {
      throw new Error("Apenas comissões calculadas (assinadas) podem ser marcadas como pagas");
    }

    this.props.status = "paga";
    this.props.dataPagamento = new Date();
    if (numeroPagamento) {
      this.props.numeroPagamento = numeroPagamento;
    }
    if (comprovantePagamento) {
      this.props.comprovantePagamento = comprovantePagamento;
    }
    if (actorId) {
      this.props.updatedBy = actorId;
    }
    this.props.updatedAt = new Date();
  }

  cancelar(actorId: string, motivo?: string) {
    if (this.props.status === "paga") {
      throw new Error("Comissão já paga não pode ser cancelada");
    }

    this.props.status = "cancelada";
    if (motivo) {
      this.props.observacoes = `${this.props.observacoes ?? ""}\nCancelamento: ${motivo}`.trim();
    }
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  estaPaga(): boolean {
    return this.props.status === "paga";
  }

  estaAssinada(): boolean {
    return !!this.props.assinadoEm && !!this.props.assinadoPor;
  }
}

