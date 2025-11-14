import type { RepresentanteRepository } from "../../domain/repositories/representante-repository";
import {
  listarRepresentantesInputSchema,
  listarRepresentantesResultadoSchema,
  representanteViewSchema,
} from "../schemas/representante.schema";

type Dependencies = {
  representanteRepository: RepresentanteRepository;
};

export class ListarRepresentantesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarRepresentantesInputSchema.parse(rawInput);

    const pagina = await this.deps.representanteRepository.listarPorOrg(input.orgId, {
      status: input.status,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((representante) =>
      representanteViewSchema.parse({
        representanteId: representante.representanteId,
        orgId: representante.dados.orgId,
        clienteId: representante.dados.clienteId,
        nome: representante.dados.nome,
        documento: representante.dados.documento,
        email: representante.dados.email ?? null,
        telefone: representante.dados.telefone ?? null,
        celular: representante.dados.celular ?? null,
        endereco: representante.dados.endereco ?? null,
        cidade: representante.dados.cidade ?? null,
        estado: representante.dados.estado ?? null,
        cep: representante.dados.cep ?? null,
        percentualComissao: representante.dados.percentualComissao,
        status: representante.dados.status,
        observacoes: representante.dados.observacoes ?? null,
        createdBy: representante.dados.createdBy,
        updatedBy: representante.dados.updatedBy,
        createdAt: representante.dados.createdAt,
        updatedAt: representante.dados.updatedAt,
      }),
    );

    return listarRepresentantesResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

