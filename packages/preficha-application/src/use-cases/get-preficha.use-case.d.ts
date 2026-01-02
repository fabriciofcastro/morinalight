import type { PrefichaRepository } from "@morina/preficha-domain";
type Dependencies = {
    prefichaRepository: PrefichaRepository;
};
export declare class ObterPrefichaUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        status: "aprovado" | "rascunho" | "pendente_aprovacao" | "rejeitado";
        orgId: string;
        criadoPor: string;
        produtoId: string;
        prefichaId: string;
        atualizadoPor: string;
        aprovadores: {
            userId: string;
            aprovado: boolean;
            aprovadoEm: Date | null;
            comentario: string | null;
        }[];
        comentarios: {
            userId: string;
            id: string;
            comentario: string;
            criadoEm: Date;
        }[];
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
}
export {};
