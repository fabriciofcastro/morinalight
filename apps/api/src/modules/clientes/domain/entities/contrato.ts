import { randomUUID } from "node:crypto";

export type ContratoStatus = "rascunho" | "pendente_assinatura" | "vigente" | "encerrado" | "cancelado";

export type ContratoProps = {
  id: string;
  orgId: string;
  representanteId: string;
  numero: string;
  dataInicio: Date;
  dataFim?: Date | null;
  percentualComissao: number;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  termos?: string | null;
  status: ContratoStatus;
  assinadoEm?: Date | null;
  assinadoPor?: string | null;
  encerradoEm?: Date | null;
  observacoes?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Contrato {
  constructor(private readonly props: ContratoProps) {
    if (!props.orgId) {
      throw new Error("Contrato requer orgId");
    }

    if (!props.representanteId) {
      throw new Error("Contrato requer representanteId");
    }

    if (!props.numero) {
      throw new Error("Contrato requer número");
    }

    if (props.percentualComissao < 0 || props.percentualComissao > 100) {
      throw new Error("Percentual de comissão deve estar entre 0 e 100");
    }

    if (props.dataFim && props.dataFim < props.dataInicio) {
      throw new Error("Data de fim não pode ser anterior à data de início");
    }
  }

  static criar(
    input: Omit<ContratoProps, "id" | "criadoEm" | "atualizadoEm" | "status"> & {
      status?: ContratoStatus;
    },
  ) {
    const agora = new Date();
    return new Contrato({
      ...input,
      id: randomUUID(),
      status: input.status ?? "rascunho",
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: ContratoProps) {
    return new Contrato({ ...props });
  }

  get contratoId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  assinar(assinadoPor: string) {
    if (this.props.status !== "rascunho" && this.props.status !== "pendente_assinatura") {
      throw new Error("Contrato só pode ser assinado se estiver em rascunho ou pendente de assinatura");
    }

    this.props.status = "vigente";
    this.props.assinadoEm = new Date();
    this.props.assinadoPor = assinadoPor;
    this.props.updatedAt = new Date();
  }

  encerrar(actorId: string) {
    if (this.props.status !== "vigente") {
      throw new Error("Apenas contratos vigentes podem ser encerrados");
    }

    this.props.status = "encerrado";
    this.props.encerradoEm = new Date();
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  cancelar(actorId: string) {
    if (this.props.status === "encerrado") {
      throw new Error("Contrato encerrado não pode ser cancelado");
    }

    this.props.status = "cancelado";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  estaVigente(): boolean {
    if (this.props.status !== "vigente") {
      return false;
    }

    const agora = new Date();
    if (this.props.dataInicio > agora) {
      return false;
    }

    if (this.props.dataFim && this.props.dataFim < agora) {
      return false;
    }

    return true;
  }
}

