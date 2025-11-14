import type { ProductVariant } from "../entities/product-variant";

export interface ProductVariantRepository {
  criar(variante: ProductVariant): Promise<void>;
  atualizar(variante: ProductVariant): Promise<void>;
  encontrarPorId(
    varianteId: string,
    orgId: string,
  ): Promise<ProductVariant | null>;
  encontrarPorSku(sku: string, orgId: string): Promise<ProductVariant | null>;
  listarPorProduto(
    productId: string,
    orgId: string,
    options?: {
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    },
  ): Promise<{
    itens: ProductVariant[];
    proximoCursor?: string | null;
  }>;
  listarPorOrg(
    orgId: string,
    options?: {
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    },
  ): Promise<{
    itens: ProductVariant[];
    proximoCursor?: string | null;
  }>;
  contarPorProduto(
    productId: string,
    orgId: string,
    ativo?: boolean,
  ): Promise<number>;
  remover(varianteId: string, orgId: string): Promise<void>;
}


