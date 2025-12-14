import type { DomainEvent } from "@morina/shared-kernel";

export type FichaCustoAprovadaPayload = {
  fichaCustoId: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  aprovadoPor: string;
  custoFinalPeca: number;
  departmentId?: string | null;
  sectorId?: string | null;
};

export type FichaCustoAprovadaEvent = DomainEvent<FichaCustoAprovadaPayload>;
