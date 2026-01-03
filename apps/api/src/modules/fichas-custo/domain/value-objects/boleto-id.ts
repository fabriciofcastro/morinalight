import { randomUUID } from "node:crypto";

/**
 * Value Object para ID de Boleto
 */
export class BoletoId {
  private constructor(private readonly value: string) {}

  static criar(value: string): BoletoId {
    if (!value || value.trim().length === 0) {
      throw new Error("ID do boleto é obrigatório");
    }
    return new BoletoId(value);
  }

  static from(): BoletoId {
    return new BoletoId(randomUUID());
  }

  get valor(): string {
    return this.value;
  }

  equals(outro: BoletoId): boolean {
    return this.value === outro.value;
  }

  toString(): string {
    return this.value;
  }
}











