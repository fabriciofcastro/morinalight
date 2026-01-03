import type { DomainEvent } from "@morina/shared-kernel";

export type FichaCustoReprovadaPayload = {
  fichaCustoId: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  reprovadoPor: string;
  justificativa: string;
  departmentId?: string | null;
  sectorId?: string | null;
};

export type FichaCustoReprovadaEvent = DomainEvent<FichaCustoReprovadaPayload>;
