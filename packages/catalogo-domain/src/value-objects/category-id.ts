export class CategoryId {
  private constructor(private readonly value: string) {
    if (!value || !this.isValid(value)) {
      throw new Error("CategoryId inválido");
    }
  }

  private isValid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  static from(value?: string): CategoryId {
    if (value) {
      return new CategoryId(value);
    }
    // Generate UUID v4
    return new CategoryId(
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    );
  }

  toString(): string {
    return this.value;
  }

  equals(other: CategoryId): boolean {
    return this.value === other.value;
  }
}


