import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  actorId: string;
  orgId: string;
};

export class ListarBoletosFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(fichaCustoId: string) {
    // Buscar ficha de custo
    const ficha = await this.deps.fichaCustoRepository.buscarPorId(fichaCustoId, this.deps.orgId);

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

    // Validar que pertence à organização
    if (ficha.dados.orgId !== this.deps.orgId) {
      throw new Error("Ficha de custo não pertence à organização");
    }

    // Listar boletos
    const boletos = ficha.boletosList;

    // Retornar boletos
    return {
      boletos: boletos.map((boleto) => boleto.toJSON()),
      total: boletos.length,
    };
  }
}
