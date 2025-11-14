import type { Representante } from "../entities/representante";

export interface RepresentanteRepository {
  salvar(representante: Representante): Promise<void>;
  encontrarPorId(orgId: string, representanteId: string): Promise<Representante | null>;
  encontrarPorClienteId(orgId: string, clienteId: string): Promise<Representante | null>;
  listarPorOrg(orgId: string, filtro?: { status?: "ativo" | "inativo" | "suspenso"; cursor?: string; limite?: number }): Promise<{ itens: Representante[]; proximoCursor?: string }>;
}

