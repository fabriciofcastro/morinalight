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
    nome: string;
    sku: string;
    productId: string;
    atributos: Record<string, string | number | boolean>;
    createdBy: string;
    updatedBy: string;
    varianteId: string;
    ativo?: boolean | undefined;
    preco?: number | null | undefined;
    estoque?: number | null | undefined;
  }>;
}
