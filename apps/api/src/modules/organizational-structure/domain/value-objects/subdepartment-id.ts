export class SubdepartmentId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("SubdepartmentId não pode ser vazio");
    }
  }

  static from(value?: string): SubdepartmentId {
    return new SubdepartmentId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: SubdepartmentId): boolean {
    return this.value === other.value;
  }
}

