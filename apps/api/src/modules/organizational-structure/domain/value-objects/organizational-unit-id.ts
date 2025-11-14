export class OrganizationalUnitId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("OrganizationalUnitId não pode ser vazio");
    }
  }

  static from(value?: string): OrganizationalUnitId {
    return new OrganizationalUnitId(value ?? crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: OrganizationalUnitId): boolean {
    return this.value === other.value;
  }
}
