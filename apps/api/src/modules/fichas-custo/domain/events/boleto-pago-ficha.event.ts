import type { DomainEvent } from "@morina/shared-kernel";

export type BoletoPagoFichaPayload = {
  boletoId: string;
  fichaCustoId: string;
  orgId: string;
  valorPago: number;
  dataPagamento: string; // ISO date string
  pagoPor: string;
};

export type BoletoPagoFichaEvent = DomainEvent<BoletoPagoFichaPayload>;
