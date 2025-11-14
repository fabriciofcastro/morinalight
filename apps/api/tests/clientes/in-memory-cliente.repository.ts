import type { ClienteRepository } from "../../src/modules/clientes/domain/repositories/cliente-repository";
import { Cliente } from "../../src/modules/clientes/domain/entities/cliente";

export class InMemoryClienteRepository implements ClienteRepository {
  private readonly items = new Map<string, Cliente>();
  private readonly byDocumento = new Map<string, Cliente>();

  async salvar(cliente: Cliente) {
    this.items.set(cliente.clienteId, cliente);
    this.byDocumento.set(cliente.dados.documento, cliente);
  }

  async encontrarPorId(orgId: string, clienteId: string) {
    const cliente = this.items.get(clienteId);
    if (!cliente || cliente.dados.orgId !== orgId) return null;
    return cliente;
  }

  async encontrarPorDocumento(orgId: string, documento: string) {
    const cliente = this.byDocumento.get(documento);
    if (!cliente || cliente.dados.orgId !== orgId) return null;
    return cliente;
  }

  async listarPorOrg(orgId: string, filtro = {}) {
    const itens = Array.from(this.items.values())
      .filter((c) => c.dados.orgId === orgId)
      .filter((c) => {
        if (filtro.status && c.dados.status !== filtro.status) {
          return false;
        }
        if (filtro.busca) {
          const busca = filtro.busca.toLowerCase();
          return (
            c.dados.nome.toLowerCase().includes(busca) ||
            c.dados.documento.toLowerCase().includes(busca) ||
            (c.dados.email && c.dados.email.toLowerCase().includes(busca))
          );
        }
        return true;
      });

    return {
      itens,
      proximoCursor: undefined,
    };
  }

  async contarPorOrg(orgId: string, status?: string) {
    return Array.from(this.items.values()).filter((c) => {
      if (c.dados.orgId !== orgId) return false;
      if (status && c.dados.status !== status) return false;
      return true;
    }).length;
  }
}

