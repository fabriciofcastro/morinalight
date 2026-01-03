import { randomUUID } from "node:crypto";

export class PrefichaId {
  private constructor(private readonly value: string) {}

  static from(value?: string) {
    return new PrefichaId(value ?? randomUUID());
  }

  toString() {
    return this.value;
  }
}
