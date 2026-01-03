export type PermissionProps = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Permission {
  constructor(private readonly props: PermissionProps) {
    if (!props.code) {
      throw new Error("Permission requer code");
    }
    if (!props.name) {
      throw new Error("Permission requer name");
    }
    if (!props.module) {
      throw new Error("Permission requer module");
    }
    if (!props.level) {
      throw new Error("Permission requer level");
    }
  }

  static criar(
    input: Omit<PermissionProps, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) {
    const agora = new Date();
    return new Permission({
      ...input,
      id: input.id || crypto.randomUUID(),
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: PermissionProps) {
    return new Permission(props);
  }

  get permissionId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  get permissionKey() {
    return this.props.code;
  }

  atualizarDados(dados: Partial<Omit<PermissionProps, "id" | "createdAt">>) {
    if (dados.code !== undefined) {
      if (!dados.code || dados.code.trim().length === 0) {
        throw new Error("Code não pode ser vazio");
      }
      this.props.code = dados.code;
    }

    if (dados.name !== undefined) {
      if (!dados.name || dados.name.trim().length === 0) {
        throw new Error("Name não pode ser vazio");
      }
      this.props.name = dados.name;
    }

    if (dados.description !== undefined) {
      this.props.description = dados.description;
    }

    if (dados.module !== undefined) {
      if (!dados.module || dados.module.trim().length === 0) {
        throw new Error("Module não pode ser vazio");
      }
      this.props.module = dados.module;
    }

    if (dados.level !== undefined) {
      if (!dados.level || dados.level.trim().length === 0) {
        throw new Error("Level não pode ser vazio");
      }
      this.props.level = dados.level;
    }

    this.props.updatedAt = new Date();
  }
}
