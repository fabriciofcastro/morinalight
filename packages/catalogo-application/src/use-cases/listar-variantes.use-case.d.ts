import type { ProductVariantRepository } from "@morina/catalogo-domain";
type Dependencies = {
    varianteRepository: ProductVariantRepository;
};
export declare class ListarVariantesUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        itens: {
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            sku: string;
            createdBy: string;
            updatedBy: string;
            nome: string;
            productId: string;
            atributos: Record<string, string | number | boolean>;
            varianteId: string;
            preco?: number | null | undefined;
            estoque?: number | null | undefined;
            ativo?: boolean | undefined;
        }[];
        proximoCursor: string | null;
    }>;
}
export {};
