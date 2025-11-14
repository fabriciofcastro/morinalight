export declare class ProductVariantId {
    private readonly value;
    private constructor();
    private isValid;
    static from(value?: string): ProductVariantId;
    toString(): string;
    equals(other: ProductVariantId): boolean;
}
