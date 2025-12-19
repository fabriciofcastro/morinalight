import type { PreFichaTecnicaRepository } from "../../domain/repositories/pre-ficha-tecnica.repository";
import { listarPreFichasTecnicasFiltroSchema, paginacaoSchema } from "../schemas/pre-ficha-tecnica.schema";

type Dependencies = {
  preFichaTecnicaRepository: PreFichaTecnicaRepository;
  orgId: string;
};

export class ListarPreFichasTecnicasUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = paginacaoSchema.parse(rawInput);
    const filtro = listarPreFichasTecnicasFiltroSchema.parse(rawInput);

    const resultado = await this.deps.preFichaTecnicaRepository.listar(
      {
        ...filtro,
        orgId: this.deps.orgId,
      },
      input.pagina,
      input.tamanhoPagina,
    );

    return {
      itens: resultado.itens.map((preFicha) => ({
        id: preFicha.preFichaTecnicaId,
        numeroSequencial: preFicha.numeroSequencial,
        codigoPeca: preFicha.codigoPeca,
        nomePecaPiloto: preFicha.nomePecaPiloto,
        categoria: preFicha.dados.categoria,
        status: preFicha.status.valor,
        versaoMolde: preFicha.dados.versaoMolde,
        createdAt: preFicha.dados.createdAt,
      })),
      total: resultado.total,
      pagina: resultado.pagina,
      tamanhoPagina: resultado.tamanhoPagina,
      totalPaginas: resultado.totalPaginas,
    };
  }
}












