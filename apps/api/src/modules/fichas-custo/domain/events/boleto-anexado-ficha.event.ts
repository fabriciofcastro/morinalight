import type { DomainEvent } from "@morina/shared-kernel";

export type BoletoAnexadoFichaPayload = {
  boletoId: string;
  fichaCustoId: string;
  orgId: string;
  fornecedorId?: string | null;
  fornecedorNome?: string | null;
  valorBoleto: number;
  dataVencimento: string; // ISO date string
  anexadoPor: string;
};

export type BoletoAnexadoFichaEvent = DomainEvent<BoletoAnexadoFichaPayload>;
