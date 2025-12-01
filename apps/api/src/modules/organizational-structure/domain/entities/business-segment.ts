export type BusinessSegmentProps = {
    id: string;
    orgId: string;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export class BusinessSegment {
    constructor(private readonly props: BusinessSegmentProps) {
        if (!props.name) {
            throw new Error("BusinessSegment requer name");
        }
    }

    static criar(
        input: Omit<BusinessSegmentProps, "id" | "createdAt" | "updatedAt"> & {
            id?: string;
        },
    ) {
        const agora = new Date();
        return new BusinessSegment({
            ...input,
            id: input.id || crypto.randomUUID(),
            createdAt: agora,
            updatedAt: agora,
        });
    }

    static restaurar(props: BusinessSegmentProps) {
        return new BusinessSegment(props);
    }

    get businessSegmentId() {
        return this.props.id;
    }

    get dados() {
        return this.props;
    }

    atualizarDados(dados: Partial<Omit<BusinessSegmentProps, "id" | "orgId" | "createdAt">>): void {
        if (dados.name !== undefined) {
            this.props.name = dados.name;
        }
        if (dados.description !== undefined) {
            this.props.description = dados.description;
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
