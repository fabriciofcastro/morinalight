import type { Contrato } from "../entities/contrato";

export interface ContratoRepository {
  salvar(contrato: Contrato): Promise<void>;
  encontrarPorId(orgId: string, contratoId: string): Promise<Contrato | null>;
  encontrarPorNumero(orgId: string, numero: string): Promise<Contrato | null>;
  listarPorRepresentante(
    orgId: string,
    representanteId: string,
    filtro?: { status?: string; cursor?: string; limite?: number },
  ): Promise<{ itens: Contrato[]; proximoCursor?: string }>;
  listarVigentesPorRepresentante(orgId: string, representanteId: string): Promise<Contrato[]>;
}
