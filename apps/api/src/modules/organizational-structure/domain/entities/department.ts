import { DepartmentId } from "../value-objects/department-id";

export type DepartmentStatus = "ativo" | "inativo" | "arquivado";

export type DepartmentProps = {
  orgId: string;
  branchId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  status: DepartmentStatus;
  ordem: number;
  metadata?: Record<string, unknown> | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
};

export class Department {
  constructor(
    private readonly props: DepartmentProps,
    private readonly id: DepartmentId = DepartmentId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Department requer orgId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Department requer name");
    }

    if (!props.code || props.code.trim().length === 0) {
      throw new Error("Department requer code");
    }
  }

  static criar(
    input: Omit<DepartmentProps, "createdAt" | "updatedAt" | "status" | "ordem"> & {
      status?: DepartmentStatus;
      ordem?: number;
    },
  ) {
    const agora = new Date();
    return new Department(
      {
        ...input,
        status: input.status ?? "ativo",
        ordem: input.ordem ?? 0,
        createdAt: agora,
        updatedAt: agora,
        deletedAt: null,
        deletedBy: null,
      },
      DepartmentId.from(),
    );
  }

  static restaurar(props: DepartmentProps, id: string) {
    return new Department({ ...props }, DepartmentId.from(id));
  }

  get departmentId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(
    dados: Partial<Omit<DepartmentProps, "orgId" | "createdAt" | "createdBy">>,
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

    if (dados.branchId !== undefined) {
      this.props.branchId = dados.branchId;
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

  alterarStatus(status: DepartmentStatus, actorId: string) {
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
