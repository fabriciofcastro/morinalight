import type { DomainEvent } from "@morina/shared-kernel";

export type FichaCustoAtualizadaPayload = {
  fichaCustoId: string;
  orgId: string;
  camposAlterados: string[];
  versao: number;
};

export type FichaCustoAtualizadaEvent = DomainEvent<FichaCustoAtualizadaPayload>;
