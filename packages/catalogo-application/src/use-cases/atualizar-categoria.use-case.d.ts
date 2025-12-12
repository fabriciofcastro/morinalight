import type { CategoryRepository } from "@morina/catalogo-domain";
type Dependencies = {
  categoriaRepository: CategoryRepository;
};
export declare class AtualizarCategoriaUseCase {
  private readonly deps;
  constructor(deps: Dependencies);
  execute(rawInput: unknown): Promise<{
    createdAt: Date;
    name: string;
    slug: string;
    updatedAt: Date;
    orgId: string;
    categoriaId: string;
    description?: string | null | undefined;
    ordem?: number | undefined;
    ativo?: boolean | undefined;
    parentId?: string | null | undefined;
  }>;
}
