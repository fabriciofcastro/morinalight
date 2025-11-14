export declare class CategoryId {
  private readonly value;
  private constructor();
  private isValid;
  static from(value?: string): CategoryId;
  toString(): string;
  equals(other: CategoryId): boolean;
}
