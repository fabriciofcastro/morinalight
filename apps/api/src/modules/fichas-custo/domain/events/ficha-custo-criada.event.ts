import type { DomainEvent } from "@morina/shared-kernel";

export type FichaCustoCriadaPayload = {
  fichaCustoId: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  nomePeca: string;
  categoria?: string | null;
  departmentId?: string | null;
  sectorId?: string | null;
  criadoPor: string;
  totalCustos: number;
  custoFinalPeca: number;
};

export type FichaCustoCriadaEvent = DomainEvent<FichaCustoCriadaPayload>;
