import type { ProductVariantRepository, ProdutoRepository } from "@morina/catalogo-domain";
type Dependencies = {
    produtoRepository: ProdutoRepository;
    varianteRepository: ProductVariantRepository;
    actorId: string;
};
export declare class CriarVarianteUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        sku: string;
        createdBy: string;
        updatedBy: string;
        productId: string;
        nome: string;
        atributos: Record<string, string | number | boolean>;
        varianteId: string;
        ativo?: boolean | undefined;
        preco?: number | null | undefined;
        estoque?: number | null | undefined;
    }>;
}
export {};
