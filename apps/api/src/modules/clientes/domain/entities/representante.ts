import { RepresentanteId } from "../value-objects/representante-id";

export type RepresentanteStatus = "ativo" | "inativo" | "suspenso";

export type RepresentanteProps = {
  orgId: string;
  clienteId: string;
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  celular?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  percentualComissao: number;
  status: RepresentanteStatus;
  observacoes?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Representante {
  constructor(
    private readonly props: RepresentanteProps,
    private readonly id: RepresentanteId = RepresentanteId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Representante requer orgId");
    }

    if (!props.clienteId) {
      throw new Error("Representante requer clienteId");
    }

    if (!props.nome) {
      throw new Error("Representante requer nome");
    }

    if (props.percentualComissao < 0 || props.percentualComissao > 100) {
      throw new Error("Percentual de comissão deve estar entre 0 e 100");
    }
  }

  static criar(
    input: Omit<RepresentanteProps, "criadoEm" | "atualizadoEm" | "status"> & {
      status?: RepresentanteStatus;
    },
  ) {
    const agora = new Date();
    return new Representante(
      {
        ...input,
        status: input.status ?? "ativo",
        createdAt: agora,
        updatedAt: agora,
      },
      RepresentanteId.from(),
    );
  }

  static restaurar(props: RepresentanteProps, id: string) {
    return new Representante({ ...props }, RepresentanteId.from(id));
  }

  get representanteId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarPercentualComissao(percentual: number, actorId: string) {
    if (percentual < 0 || percentual > 100) {
      throw new Error("Percentual de comissão deve estar entre 0 e 100");
    }
    this.props.percentualComissao = percentual;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  suspender(actorId: string) {
    this.props.status = "suspenso";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  ativar(actorId: string) {
    this.props.status = "ativo";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  desativar(actorId: string) {
    this.props.status = "inativo";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}

