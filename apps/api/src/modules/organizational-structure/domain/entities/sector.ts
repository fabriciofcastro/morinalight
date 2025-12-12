import { SectorId } from "../value-objects/sector-id";

export type SectorStatus = "ativo" | "inativo" | "arquivado";

export type SectorProps = {
  orgId: string;
  departmentId: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  status: SectorStatus;
  ordem: number;
  metadata?: Record<string, unknown> | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};

export class Sector {
  constructor(
    private readonly props: SectorProps,
    private readonly id: SectorId = SectorId.create(crypto.randomUUID()),
  ) {
    if (!props.orgId) {
      throw new Error("Sector requer orgId");
    }

    if (!props.departmentId) {
      throw new Error("Sector requer departmentId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Sector requer name");
    }

    if (!props.code || props.code.trim().length === 0) {
      throw new Error("Sector requer code");
    }
  }

  static criar(
    input: Omit<SectorProps, "createdAt" | "updatedAt" | "status" | "ordem"> & {
      status?: SectorStatus;
      ordem?: number;
    },
  ) {
    const agora = new Date();
    return new Sector(
      {
        ...input,
        status: input.status ?? "ativo",
        ordem: input.ordem ?? 0,
        createdAt: agora,
        updatedAt: agora,
        deletedAt: null,
        deletedBy: null,
      },
      SectorId.create(crypto.randomUUID()),
    );
  }

  static restaurar(props: SectorProps, id: string) {
    return new Sector({ ...props }, SectorId.create(id));
  }

  get sectorId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<SectorProps, "orgId" | "departmentId" | "createdAt" | "createdBy">>,
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

    if (dados.parentId !== undefined) {
      this.props.parentId = dados.parentId;
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

  alterarStatus(status: SectorStatus, actorId: string) {
    this.props.status = status;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  ativar(actorId: string) {
    this.props.status = "ativo";
    this.props.deletedAt = null;
    this.props.deletedBy = null;
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
    this.props.deletedAt = new Date();
    this.props.deletedBy = actorId;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}
