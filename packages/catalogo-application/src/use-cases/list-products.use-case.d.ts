import type { ProdutoRepository } from "@morina/catalogo-domain";
type Dependencies = {
    produtoRepository: ProdutoRepository;
};
export declare class ListarProdutosUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        itens: {
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
        }[];
        proximoCursor?: string | null | undefined;
    }>;
}
export {};
