import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
type Dependencies = {
    auditoriaRepository: ProdutoAuditoriaRepository;
    produtoRepository: ProdutoRepository;
};
export declare class ListarAuditoriaFeedUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        itens: {
            id: string;
            orgId: string;
            actorId: string;
            produtoId: string;
            acao: string;
            criadoEm: Date;
            payload?: unknown;
            produto?: {
                status: "ativo" | "rascunho" | "aguardando_aprovacao" | "inativo";
                orgId: string;
                criadoPor: string;
                nome: string;
                produtoId: string;
                atualizadoPor: string;
                criadoEm: Date;
                atualizadoEm: Date;
                sku?: string | null | undefined;
                categoryId?: string | null | undefined;
                descricao?: string | null | undefined;
            } | null | undefined;
        }[];
        proximoCursor?: string | null | undefined;
    }>;
}
export {};
