export type PrefichaAuditoriaProps = {
    id: string;
    prefichaId: string;
    orgId: string;
    acao: string;
    actorId: string;
    payload?: Record<string, unknown> | null;
    criadoEm: Date;
};
export declare class PrefichaAuditoria {
    private readonly props;
    constructor(props: PrefichaAuditoriaProps);
    get id(): string;
    get dados(): PrefichaAuditoriaProps;
}
