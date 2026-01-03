export type WorkflowPolicyProps = {
  id: string;
  orgId: string;
  module: string;
  flowType: string;
  config: unknown; // JSON
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowPolicy {
  constructor(private readonly props: WorkflowPolicyProps) {
    if (!props.module) {
      throw new Error("WorkflowPolicy requer module");
    }
    if (!props.flowType) {
      throw new Error("WorkflowPolicy requer flowType");
    }
  }

  static criar(
    input: Omit<WorkflowPolicyProps, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) {
    const agora = new Date();
    return new WorkflowPolicy({
      ...input,
      id: input.id || crypto.randomUUID(),
      createdAt: agora,
      updatedAt: agora,
    });
  }

  static restaurar(props: WorkflowPolicyProps) {
    return new WorkflowPolicy(props);
  }

  get workflowPolicyId() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }

  atualizarDados(dados: Partial<Omit<WorkflowPolicyProps, "id" | "orgId" | "createdAt">>): void {
    if (dados.module !== undefined) {
      this.props.module = dados.module;
    }
    if (dados.flowType !== undefined) {
      this.props.flowType = dados.flowType;
    }
    if (dados.config !== undefined) {
      this.props.config = dados.config;
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
