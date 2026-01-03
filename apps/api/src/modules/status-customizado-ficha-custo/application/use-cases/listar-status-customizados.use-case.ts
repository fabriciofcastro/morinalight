import type { StatusCustomizadoRepository } from "../../domain/repositories/status-customizado.repository";
import type { ListarStatusCustomizadosQuery } from "../schemas/status-customizado.schema";

export class ListarStatusCustomizadosUseCase {
  constructor(
    private readonly statusCustomizadoRepository: StatusCustomizadoRepository,
    private readonly orgId: string,
  ) {}

  async execute(query: ListarStatusCustomizadosQuery) {
    return this.statusCustomizadoRepository.listar({
      orgId: this.orgId,
      ativo: query.ativo,
      busca: query.busca,
      pagina: query.pagina,
      tamanhoPagina: query.tamanhoPagina,
      ordenacao: {
        campo: query.ordenacaoCampo,
        direcao: query.ordenacaoDirecao,
      },
    });
  }
}


