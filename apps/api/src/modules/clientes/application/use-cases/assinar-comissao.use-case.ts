import type { ComissaoRepository } from "../../domain/repositories/comissao-repository";
import { assinarComissaoInputSchema, comissaoViewSchema } from "../schemas/comissao.schema";

type Dependencies = {
  comissaoRepository: ComissaoRepository;
};

export class AssinarComissaoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = assinarComissaoInputSchema.parse(rawInput);

    const comissao = await this.deps.comissaoRepository.encontrarPorId(
      input.orgId,
      input.comissaoId,
    );

    if (!comissao) {
      throw new Error("Comissão não encontrada");
    }

    // Assinar a comissão - o representante assume responsabilidade
    comissao.assinar(input.assinadoPor);

    await this.deps.comissaoRepository.salvar(comissao);

    return comissaoViewSchema.parse({
      comissaoId: comissao.comissaoId,
      orgId: comissao.dados.orgId,
      representanteId: comissao.dados.representanteId,
      clienteId: comissao.dados.clienteId,
      vendaId: comissao.dados.vendaId,
      valorComissao: Number(comissao.dados.valorComissao),
      percentualAplicado: Number(comissao.dados.percentualAplicado),
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
    });
  }
}

