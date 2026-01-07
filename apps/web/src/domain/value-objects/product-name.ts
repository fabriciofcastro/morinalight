import { ValidationError } from '../errors';

/**
 * ProductName Value Object
 * 
 * Representa o nome de um produto com validação.
 */
export class ProductName {
  private constructor(private readonly value: string) {}

  static create(name: string): ProductName {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Product name cannot be empty', 'name');
    }

    const trimmed = name.trim();

    if (trimmed.length < 3) {
      throw new ValidationError(
        'Product name must be at least 3 characters',
        'name',
        name
      );
    }

    if (trimmed.length > 200) {
      throw new ValidationError(
        'Product name cannot exceed 200 characters',
        'name',
        name
      );
    }

    return new ProductName(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
