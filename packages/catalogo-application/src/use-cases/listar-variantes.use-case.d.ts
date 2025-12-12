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
    }[];
    proximoCursor: string | null;
  }>;
}
