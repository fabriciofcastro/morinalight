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
            productId: string;
            nome: string;
            atributos: Record<string, string | number | boolean>;
            varianteId: string;
            ativo?: boolean | undefined;
            preco?: number | null | undefined;
            estoque?: number | null | undefined;
        }[];
        proximoCursor: string | null;
    }>;
}
export {};
