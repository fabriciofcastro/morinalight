import { PositionId } from "../value-objects/position-id";

export type PositionStatus = "ativo" | "inativo" | "arquivado";

export type PositionProps = {
  orgId: string;
  sectorId: string;
  name: string;
  code: string;
  description?: string | null;
  responsabilidades?: string | null;
  requisitos?: string | null;
  salarioMin?: number | null;
  salarioMax?: number | null;
  status: PositionStatus;
  ordem: number;
  metadata?: Record<string, unknown> | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Position {
  constructor(
    private readonly props: PositionProps,
    private readonly id: PositionId = PositionId.create(crypto.randomUUID()),
  ) {
    if (!props.orgId) {
      throw new Error("Position requer orgId");
    }

    if (!props.sectorId) {
      throw new Error("Position requer sectorId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Position requer name");
    }

    if (!props.code || props.code.trim().length === 0) {
      throw new Error("Position requer code");
    }
  }

  static criar(
    input: Omit<PositionProps, "createdAt" | "updatedAt" | "status" | "ordem"> & {
      status?: PositionStatus;
      ordem?: number;
    },
  ) {
    const agora = new Date();
    return new Position(
      {
        ...input,
        status: input.status ?? "ativo",
        ordem: input.ordem ?? 0,
        createdAt: agora,
        updatedAt: agora,
      },
      PositionId.create(crypto.randomUUID()),
    );
  }

  static restaurar(props: PositionProps, id: string) {
    return new Position({ ...props }, PositionId.create(id));
  }

  get positionId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<PositionProps, "orgId" | "sectorId" | "createdAt" | "createdBy">>,
    actorId: string,
  ) {
    if (dados.name !== undefined) {
      if (!dados.name || dados.name.trim().length === 0) {
        throw new Error("Name não pode ser vazio");
      }
      this.props.name = dados.name;
    }

    if (dados.code !== undefined) {
      if (!dados.code || dados.code.trim().length === 0) {
        throw new Error("Code não pode ser vazio");
      }
      this.props.code = dados.code;
    }

    if (dados.description !== undefined) {
      this.props.description = dados.description;
    }

    if (dados.responsabilidades !== undefined) {
      this.props.responsabilidades = dados.responsabilidades;
    }

    if (dados.requisitos !== undefined) {
      this.props.requisitos = dados.requisitos;
    }

    if (dados.salarioMin !== undefined) {
      this.props.salarioMin = dados.salarioMin;
    }

    if (dados.salarioMax !== undefined) {
      this.props.salarioMax = dados.salarioMax;
    }

    if (dados.status !== undefined) {
      this.props.status = dados.status;
    }

    if (dados.ordem !== undefined) {
      this.props.ordem = dados.ordem;
    }

    if (dados.metadata !== undefined) {
      this.props.metadata = dados.metadata;
    }

    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  alterarStatus(status: PositionStatus, actorId: string) {
    this.props.status = status;
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

  arquivar(actorId: string) {
    this.props.status = "arquivado";
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}
