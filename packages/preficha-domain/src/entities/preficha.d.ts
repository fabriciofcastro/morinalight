import { PrefichaId } from "../value-objects/preficha-id";
export type PrefichaStatus = "rascunho" | "pendente_aprovacao" | "aprovado" | "rejeitado";
export type PrefichaAprovador = {
    userId: string;
    aprovado: boolean;
    aprovadoEm?: Date | null;
    comentario?: string | null;
};
export type PrefichaComentario = {
    id: string;
    userId: string;
    comentario: string;
    criadoEm: Date;
};
export type PrefichaProps = {
    orgId: string;
    produtoId: string;
    status: PrefichaStatus;
    aprovadores: PrefichaAprovador[];
    comentarios: PrefichaComentario[];
    criadoPor: string;
    atualizadoPor: string;
    criadoEm: Date;
    atualizadoEm: Date;
};
export declare class Preficha {
    private readonly props;
    private readonly id;
    constructor(props: PrefichaProps, id?: PrefichaId);
    static criar(input: Omit<PrefichaProps, "criadoEm" | "atualizadoEm" | "status" | "aprovadores" | "comentarios"> & {
        status?: PrefichaStatus;
        aprovadores?: PrefichaAprovador[];
        comentarios?: PrefichaComentario[];
    }): Preficha;
    static restaurar(props: PrefichaProps, id: string): Preficha;
    get prefichaId(): string;
    get dados(): PrefichaProps;
    encaminharParaAprovacao(actorId: string, aprovadoresIds: string[]): void;
    aprovar(actorId: string, comentario?: string): void;
    rejeitar(actorId: string, motivo: string): void;
    adicionarComentario(userId: string, comentario: string): void;
    retornarParaRascunho(actorId: string): void;
}
