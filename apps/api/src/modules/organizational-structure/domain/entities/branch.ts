import { BranchId } from "../value-objects/branch-id";

export type BranchProps = {
  orgId: string;
  name: string;
  type: string; // FABRICA, LOJA, CD, ESCRITORIO
  internalCode?: string | null;
  cnpj?: string | null;
  stateRegistration?: string | null;
  address?: Record<string, unknown> | null;
  phone?: string | null;
  email?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Branch {
  constructor(
    private readonly props: BranchProps,
    private readonly id: BranchId = BranchId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Branch requer orgId");
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Branch requer name");
    }

    if (!props.type || props.type.trim().length === 0) {
      throw new Error("Branch requer type");
    }
  }

  static criar(
    input: Omit<BranchProps, "createdAt" | "updatedAt" | "active"> & {
      active?: boolean;
    },
  ) {
    const agora = new Date();
    return new Branch(
      {
        ...input,
        active: input.active ?? true,
        createdAt: agora,
        updatedAt: agora,
      },
      BranchId.from(),
    );
  }

  static restaurar(props: BranchProps, id: string) {
    return new Branch({ ...props }, BranchId.from(id));
  }

  get branchId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarDados(dados: Partial<Omit<BranchProps, "orgId" | "createdAt">>) {
    if (dados.name !== undefined) {
      if (!dados.name || dados.name.trim().length === 0) {
        throw new Error("Name não pode ser vazio");
      }
      this.props.name = dados.name;
    }

    if (dados.type !== undefined) {
      if (!dados.type || dados.type.trim().length === 0) {
        throw new Error("Type não pode ser vazio");
      }
      this.props.type = dados.type;
    }

    if (dados.internalCode !== undefined) {
      this.props.internalCode = dados.internalCode;
    }

    if (dados.cnpj !== undefined) {
      this.props.cnpj = dados.cnpj;
    }

    if (dados.stateRegistration !== undefined) {
      this.props.stateRegistration = dados.stateRegistration;
    }

    if (dados.address !== undefined) {
      this.props.address = dados.address;
    }

    if (dados.phone !== undefined) {
      this.props.phone = dados.phone;
    }

    if (dados.email !== undefined) {
      this.props.email = dados.email;
    }

    if (dados.active !== undefined) {
      this.props.active = dados.active;
    }

    this.props.updatedAt = new Date();
  }

  ativar() {
    this.props.active = true;
    this.props.updatedAt = new Date();
  }

  desativar() {
    this.props.active = false;
    this.props.updatedAt = new Date();
  }
}
