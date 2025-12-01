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
}
