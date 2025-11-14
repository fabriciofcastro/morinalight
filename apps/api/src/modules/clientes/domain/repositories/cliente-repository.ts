import type { Cliente } from "../entities/cliente";

export type ClienteListaFiltro = {
  status?: "ativo" | "inativo" | "bloqueado";
  busca?: string;
  cursor?: string;
  limite?: number;
};

export type ClienteListaPagina = {
  itens: Cliente[];
  proximoCursor?: string;
};

export interface ClienteRepository {
  salvar(cliente: Cliente): Promise<void>;
  encontrarPorId(orgId: string, clienteId: string): Promise<Cliente | null>;
  encontrarPorDocumento(orgId: string, documento: string): Promise<Cliente | null>;
  listarPorOrg(orgId: string, filtro?: ClienteListaFiltro): Promise<ClienteListaPagina>;
  contarPorOrg(orgId: string, status?: "ativo" | "inativo" | "bloqueado"): Promise<number>;
}
