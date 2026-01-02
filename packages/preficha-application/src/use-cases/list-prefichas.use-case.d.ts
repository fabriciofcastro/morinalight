import type { PrefichaRepository } from "@morina/preficha-domain";
import { listarPrefichasInputSchema } from "../schemas/preficha";
type Dependencies = {
    prefichaRepository: PrefichaRepository;
};
export declare class ListarPrefichasUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        itens: {
            prefichaId: string;
            orgId: string;
            produtoId: string;
            status: import("@morina/preficha-domain").PrefichaStatus;
            aprovadores: import("@morina/preficha-domain").PrefichaAprovador[];
            comentarios: import("@morina/preficha-domain").PrefichaComentario[];
            criadoPor: string;
            atualizadoPor: string;
            criadoEm: Date;
            atualizadoEm: Date;
        }[];
        proximoCursor: string | null;
    }>;
}
export { listarPrefichasInputSchema };
