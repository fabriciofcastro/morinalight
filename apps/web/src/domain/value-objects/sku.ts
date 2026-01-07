import { ValidationError } from '../errors';

/**
 * SKU (Stock Keeping Unit) Value Object
 * 
 * Representa um código SKU único para produtos.
 */
export class SKU {
  private constructor(private readonly value: string) {}

  static create(sku: string): SKU {
    if (!sku || sku.trim().length === 0) {
      throw new ValidationError('SKU cannot be empty', 'sku');
    }

    const trimmed = sku.trim().toUpperCase();

    // SKU deve ter entre 3 e 50 caracteres
    if (trimmed.length < 3) {
      throw new ValidationError(
        'SKU must be at least 3 characters',
        'sku',
        sku
      );
    }

    if (trimmed.length > 50) {
      throw new ValidationError(
        'SKU cannot exceed 50 characters',
        'sku',
        sku
      );
    }

    // SKU deve conter apenas letras, números, hífens e underscores
    const skuPattern = /^[A-Z0-9\-_]+$/;
    if (!skuPattern.test(trimmed)) {
      throw new ValidationError(
        'SKU can only contain letters, numbers, hyphens and underscores',
        'sku',
        sku
      );
    }

    return new SKU(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SKU): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
