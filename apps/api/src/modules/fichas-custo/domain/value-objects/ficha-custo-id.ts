export class FichaCustoId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("FichaCustoId não pode ser vazio");
    }
  }

  static from(value?: string): FichaCustoId {
    if (value) {
      return new FichaCustoId(value);
    }
    // Gerar UUID - em produção usar biblioteca UUID
    const uuid = crypto.randomUUID();
    return new FichaCustoId(uuid);
  }

  toString(): string {
    return this.value;
  }

  equals(other: FichaCustoId): boolean {
    return this.value === other.value;
  }
}
