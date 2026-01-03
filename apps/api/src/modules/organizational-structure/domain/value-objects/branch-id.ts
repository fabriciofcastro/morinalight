export class BranchId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("BranchId não pode ser vazio");
    }
  }

  static from(value?: string): BranchId {
    return new BranchId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: BranchId): boolean {
    return this.value === other.value;
  }
}
