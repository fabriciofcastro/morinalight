export class DepartmentId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("DepartmentId não pode ser vazio");
    }
  }

  static from(value?: string): DepartmentId {
    return new DepartmentId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: DepartmentId): boolean {
    return this.value === other.value;
  }
}

