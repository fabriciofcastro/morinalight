import { z } from "zod";

export type StatusBoleto = "pendente" | "pago" | "cancelado" | "vencido";

export const statusBoletoSchema = z.enum(["pendente", "pago", "cancelado", "vencido"]);

/**
 * Value Object para Status de Boleto
 */
export class StatusBoletoVO {
  private constructor(private readonly status: StatusBoleto) {}

  static criar(status: StatusBoleto): StatusBoletoVO {
    return new StatusBoletoVO(status);
  }

  get valor(): StatusBoleto {
    return this.status;
  }

  isPendente(): boolean {
    return this.status === "pendente";
  }

  isPago(): boolean {
    return this.status === "pago";
  }

  isCancelado(): boolean {
    return this.status === "cancelado";
  }

  isVencido(): boolean {
    return this.status === "vencido";
  }

  podePagar(): boolean {
    return this.status === "pendente";
  }

  podeCancelar(): boolean {
    return this.status === "pendente";
  }

  toString(): string {
    return this.status;
  }

  equals(outro: StatusBoletoVO): boolean {
    return this.status === outro.status;
  }
}












