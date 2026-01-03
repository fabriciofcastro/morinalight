import type { DomainEvent } from "@morina/shared-kernel";

export type FichaCustoEnviadaConferenciaPayload = {
  fichaCustoId: string;
  orgId: string;
  numeroSequencial: number;
  referenciaPeca: string;
  enviadoPor: string;
  departmentId?: string | null;
  sectorId?: string | null;
  totalCustos: number;
};

export type FichaCustoEnviadaConferenciaEvent =
  DomainEvent<FichaCustoEnviadaConferenciaPayload>;
