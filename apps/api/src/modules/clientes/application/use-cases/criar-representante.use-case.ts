import type {
  ClienteRepository,
  RepresentanteRepository,
} from "../../domain/repositories";
import { Representante } from "../../domain/entities/representante";
import { criarRepresentanteInputSchema, representanteViewSchema } from "../schemas/representante.schema";

type Dependencies = {
  clienteRepository: ClienteRepository;
  representanteRepository: RepresentanteRepository;
  actorId: string;
};

export class CriarRepresentanteUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarRepresentanteInputSchema.parse(rawInput);

    // Verificar se o cliente existe
    const cliente = await this.deps.clienteRepository.encontrarPorId(
      input.orgId,
      input.clienteId,
    );

    if (!cliente) {
      throw new Error("Cliente não encontrado");
    }

    // Verificar se já existe representante para este cliente
    const representanteExistente =
      await this.deps.representanteRepository.encontrarPorClienteId(
        input.orgId,
        input.clienteId,
      );

    if (representanteExistente) {
      throw new Error("Já existe um representante para este cliente");
    }

    const representante = Representante.criar({
      orgId: input.orgId,
      clienteId: input.clienteId,
      nome: input.nome,
      documento: input.documento,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      celular: input.celular ?? null,
      endereco: input.endereco ?? null,
      cidade: input.cidade ?? null,
      estado: input.estado ?? null,
      cep: input.cep ?? null,
      percentualComissao: input.percentualComissao,
      observacoes: input.observacoes ?? null,
      criadoPor: this.deps.actorId,
      atualizadoPor: this.deps.actorId,
    });

    await this.deps.representanteRepository.salvar(representante);

    return representanteViewSchema.parse({
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
      percentualComissao: Number(representante.dados.percentualComissao),
      status: representante.dados.status,
      observacoes: representante.dados.observacoes ?? null,
      createdBy: representante.dados.createdBy,
      updatedBy: representante.dados.updatedBy,
      createdAt: representante.dados.createdAt,
      updatedAt: representante.dados.updatedAt,
    });
  }
}

