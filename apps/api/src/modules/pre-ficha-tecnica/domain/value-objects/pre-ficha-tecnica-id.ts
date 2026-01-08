export class PreFichaTecnicaId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("PreFichaTecnicaId não pode ser vazio");
    }
  }

  static from(value?: string): PreFichaTecnicaId {
    if (value) {
      return new PreFichaTecnicaId(value);
    }
    // Gerar UUID
    const uuid = crypto.randomUUID();
    return new PreFichaTecnicaId(uuid);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PreFichaTecnicaId): boolean {
    return this.value === other.value;
  }
}
