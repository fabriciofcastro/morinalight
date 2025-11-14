export type ProdutoAuditoriaProps = {
    id: string;
    produtoId: string;
    orgId: string;
    acao: string;
    actorId: string;
    payload?: Record<string, unknown> | null;
    criadoEm: Date;
};
export declare class ProdutoAuditoria {
    private readonly props;
    constructor(props: ProdutoAuditoriaProps);
    get id(): string;
    get dados(): ProdutoAuditoriaProps;
}
