import { ProductVariantId } from "../value-objects/product-variant-id";
export type ProductVariantAttributes = Record<string, string | number | boolean>;
export type ProductVariantProps = {
    productId: string;
    orgId: string;
    sku: string;
    nome: string;
    atributos: ProductVariantAttributes;
    preco?: number | null;
    estoque?: number | null;
    ativo: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
};
export declare class ProductVariant {
    private readonly props;
    private readonly id;
    constructor(props: ProductVariantProps, id?: ProductVariantId);
    static criar(input: Omit<ProductVariantProps, "createdAt" | "updatedAt" | "ativo"> & {
        ativo?: boolean;
    }): ProductVariant;
    static restaurar(props: ProductVariantProps, id: string): ProductVariant;
    get varianteId(): string;
    get dados(): ProductVariantProps;
    atualizarPreco(preco: number | null, actorId: string): void;
    atualizarEstoque(estoque: number | null, actorId: string): void;
    adicionarEstoque(quantidade: number, actorId: string): void;
    removerEstoque(quantidade: number, actorId: string): void;
    atualizarAtributos(atributos: ProductVariantAttributes, actorId: string): void;
    desativar(actorId: string): void;
    ativar(actorId: string): void;
    atualizarNome(nome: string, actorId: string): void;
}
