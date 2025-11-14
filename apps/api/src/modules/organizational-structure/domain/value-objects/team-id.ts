export class TeamId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("TeamId não pode ser vazio");
    }
  }

  static from(value?: string): TeamId {
    return new TeamId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: TeamId): boolean {
    return this.value === other.value;
  }
}

