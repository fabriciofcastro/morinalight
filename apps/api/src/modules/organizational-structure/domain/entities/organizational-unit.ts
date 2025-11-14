import { OrganizationalUnitId } from "../value-objects/organizational-unit-id";

export type OrganizationalUnitStatus = "ativo" | "inativo" | "arquivado";

export type OrganizationalUnitProps = {
  orgId: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  status: OrganizationalUnitStatus;
  ordem: number;
  metadata?: Record<string, unknown> | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class OrganizationalUnit {
  constructor(
    private readonly props: OrganizationalUnitProps,
    private readonly id: OrganizationalUnitId = OrganizationalUnitId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("OrganizationalUnit requer orgId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("OrganizationalUnit requer name");
    }

    if (!props.code || props.code.trim().length === 0) {
      throw new Error("OrganizationalUnit requer code");
    }
  }

  static criar(
    input: Omit<OrganizationalUnitProps, "createdAt" | "updatedAt" | "status" | "ordem"> & {
      status?: OrganizationalUnitStatus;
      ordem?: number;
    },
  ) {
    const agora = new Date();
    return new OrganizationalUnit(
      {
        ...input,
        status: input.status ?? "ativo",
        ordem: input.ordem ?? 0,
        createdAt: agora,
        updatedAt: agora,
      },
      OrganizationalUnitId.from(),
    );
  }

  static restaurar(props: OrganizationalUnitProps, id: string) {
    return new OrganizationalUnit({ ...props }, OrganizationalUnitId.from(id));
  }

  get unitId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<OrganizationalUnitProps, "orgId" | "createdAt" | "createdBy">>,
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

  alterarStatus(status: OrganizationalUnitStatus, actorId: string) {
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
