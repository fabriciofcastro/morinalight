export class SectorId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("SectorId não pode ser vazio");
    }
  }

  static create(value?: string): SectorId {
    return new SectorId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: SectorId): boolean {
    return this.value === other.value;
  }
}

