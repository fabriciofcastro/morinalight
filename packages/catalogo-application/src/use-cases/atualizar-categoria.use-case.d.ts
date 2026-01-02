import type { CategoryRepository } from "@morina/catalogo-domain";
type Dependencies = {
    categoriaRepository: CategoryRepository;
};
export declare class AtualizarCategoriaUseCase {
    private readonly deps;
    constructor(deps: Dependencies);
    execute(rawInput: unknown): Promise<{
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        name: string;
        slug: string;
        categoriaId: string;
        description?: string | null | undefined;
        parentId?: string | null | undefined;
        ordem?: number | undefined;
        ativo?: boolean | undefined;
    }>;
}
export {};
