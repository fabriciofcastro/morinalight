export type RoleProps = {
    id: string;
    orgId: string;
    name: string;
    code: string;
    description: string | null;
    scope: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export class Role {
    constructor(private readonly props: RoleProps) {
        if (!props.orgId) {
            throw new Error("Role requer orgId");
        }
        if (!props.name) {
            throw new Error("Role requer name");
        }
        if (!props.code) {
            throw new Error("Role requer code");
        }
    }

    static criar(
        input: Omit<RoleProps, "id" | "createdAt" | "updatedAt"> & {
            id?: string;
        },
    ) {
        const agora = new Date();
        return new Role({
            ...input,
            id: input.id || crypto.randomUUID(),
            createdAt: agora,
            updatedAt: agora,
        });
    }

    static restaurar(props: RoleProps) {
        return new Role(props);
    }

    get roleId() {
        return this.props.id;
    }

    get dados() {
        return this.props;
    }

    atualizarDados(dados: Partial<Omit<RoleProps, "id" | "orgId" | "createdAt">> & { updatedBy?: string }) {
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

        if (dados.scope !== undefined) {
            this.props.scope = dados.scope;
        }

        if (dados.active !== undefined) {
            this.props.active = dados.active;
        }

        this.props.updatedAt = new Date();
    }
}
