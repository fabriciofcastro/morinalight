import type { ComissaoRepository } from "../../domain/repositories/comissao-repository";
import {
  listarComissoesInputSchema,
  listarComissoesResultadoSchema,
  comissaoViewSchema,
} from "../schemas/comissao.schema";

type Dependencies = {
  comissaoRepository: ComissaoRepository;
};

export class ListarComissoesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarComissoesInputSchema.parse(rawInput);

    const pagina = await this.deps.comissaoRepository.listarPorOrg(input.orgId, {
      status: input.status,
      representanteId: input.representanteId,
      clienteId: input.clienteId,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((comissao) =>
      comissaoViewSchema.parse({
        comissaoId: comissao.comissaoId,
        orgId: comissao.dados.orgId,
        representanteId: comissao.dados.representanteId,
        clienteId: comissao.dados.clienteId,
        vendaId: comissao.dados.vendaId,
        valorComissao: comissao.dados.valorComissao,
        percentualAplicado: comissao.dados.percentualAplicado,
        dataVenda: comissao.dados.dataVenda,
        dataCalculo: comissao.dados.dataCalculo,
        dataPagamento: comissao.dados.dataPagamento ?? null,
        status: comissao.dados.status,
        observacoes: comissao.dados.observacoes ?? null,
        assinadoEm: comissao.dados.assinadoEm ?? null,
        assinadoPor: comissao.dados.assinadoPor ?? null,
        numeroPagamento: comissao.dados.numeroPagamento ?? null,
        comprovantePagamento: comissao.dados.comprovantePagamento ?? null,
        createdBy: comissao.dados.createdBy,
        updatedBy: comissao.dados.updatedBy,
        createdAt: comissao.dados.createdAt,
        updatedAt: comissao.dados.updatedAt,
      }),
    );

    return listarComissoesResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

