import { randomUUID } from "node:crypto";

export class ProductId {
  private constructor(private readonly value: string) {}

  static from(value?: string) {
    return new ProductId(value ?? randomUUID());
  }

  toString() {
    return this.value;
  }
}
