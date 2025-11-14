export type PermissionProps = {
  id: string;
  name: string;
  description: string | null;
  module: string;
  category: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Permission {
  constructor(private readonly props: PermissionProps) {
    if (!props.name) {
      throw new Error("Permission requer name");
    }
    if (!props.resource) {
      throw new Error("Permission requer resource");
    }
    if (!props.action) {
      throw new Error("Permission requer action");
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
    return `${this.props.resource}:${this.props.action}`;
  }
}


