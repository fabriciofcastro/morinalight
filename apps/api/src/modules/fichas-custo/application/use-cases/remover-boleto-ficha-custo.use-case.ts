import type { FichaCustoRepository } from "../../domain/repositories/ficha-custo.repository";

type Dependencies = {
  fichaCustoRepository: FichaCustoRepository;
  actorId: string;
  orgId: string;
};

export class RemoverBoletoFichaCustoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(fichaCustoId: string, boletoId: string) {
    // Buscar ficha de custo
    const ficha = await this.deps.fichaCustoRepository.buscarPorId(fichaCustoId, this.deps.orgId);

    if (!ficha) {
      throw new Error("Ficha de custo não encontrada");
    }

    // Validar que pertence à organização
    if (ficha.dados.orgId !== this.deps.orgId) {
      throw new Error("Ficha de custo não pertence à organização");
    }

    // Buscar boleto
    const boleto = ficha.buscarBoletoPorId(boletoId);

    if (!boleto) {
      throw new Error("Boleto não encontrado na ficha");
    }

    // Remover boleto (validações internas na entidade)
    ficha.removerBoleto(boletoId, this.deps.actorId);

    // Salvar no repository
    await this.deps.fichaCustoRepository.salvar(ficha);

    return {
      sucesso: true,
      boletoRemovido: boletoId,
    };
  }
}












