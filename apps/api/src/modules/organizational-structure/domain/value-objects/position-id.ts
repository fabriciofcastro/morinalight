export class PositionId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("PositionId não pode ser vazio");
    }
  }

  static create(value?: string): PositionId {
    return new PositionId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: PositionId): boolean {
    return this.value === other.value;
  }
}

