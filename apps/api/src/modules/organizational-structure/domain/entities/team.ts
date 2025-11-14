import { TeamId } from "../value-objects/team-id";

export type TeamStatus = "ativo" | "inativo" | "arquivado";

export type TeamProps = {
  orgId: string;
  departmentId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  status: TeamStatus;
  ordem: number;
  metadata?: Record<string, unknown> | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Team {
  constructor(
    private readonly props: TeamProps,
    private readonly id: TeamId = TeamId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Team requer orgId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Team requer name");
    }

    if (!props.code || props.code.trim().length === 0) {
      throw new Error("Team requer code");
    }
  }

  static criar(
    input: Omit<TeamProps, "createdAt" | "updatedAt" | "status" | "ordem"> & {
      status?: TeamStatus;
      ordem?: number;
    },
  ) {
    const agora = new Date();
    return new Team(
      {
        ...input,
        status: input.status ?? "ativo",
        ordem: input.ordem ?? 0,
        createdAt: agora,
        updatedAt: agora,
      },
      TeamId.from(),
    );
  }

  static restaurar(props: TeamProps, id: string) {
    return new Team({ ...props }, TeamId.from(id));
  }

  get teamId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<TeamProps, "orgId" | "createdAt" | "createdBy">>,
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

    if (dados.departmentId !== undefined) {
      this.props.departmentId = dados.departmentId;
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

  alterarStatus(status: TeamStatus, actorId: string) {
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

