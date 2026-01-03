import type { Representante } from "../../src/modules/clientes/domain/entities/representante";
import type { RepresentanteRepository } from "../../src/modules/clientes/domain/repositories/representante-repository";

export class InMemoryRepresentanteRepository implements RepresentanteRepository {
  private readonly items = new Map<string, Representante>();
  private readonly byClienteId = new Map<string, Representante>();

  async salvar(representante: Representante) {
    this.items.set(representante.representanteId, representante);
    this.byClienteId.set(representante.dados.clienteId, representante);
  }

  async encontrarPorId(orgId: string, representanteId: string) {
    const representante = this.items.get(representanteId);
    if (!representante || representante.dados.orgId !== orgId) return null;
    return representante;
  }

  async encontrarPorClienteId(orgId: string, clienteId: string) {
    const representante = this.byClienteId.get(clienteId);
    if (!representante || representante.dados.orgId !== orgId) return null;
    return representante;
  }

  async listarPorOrg(orgId: string, filtro = {}) {
    const itens = Array.from(this.items.values())
      .filter((r) => r.dados.orgId === orgId)
      .filter((r) => {
        if (filtro.status && r.dados.status !== filtro.status) {
          return false;
        }
        return true;
      });

    return {
      itens,
      proximoCursor: undefined,
    };
  }
}
