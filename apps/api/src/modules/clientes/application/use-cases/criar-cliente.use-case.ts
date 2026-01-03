import { Cliente } from "../../domain/entities/cliente";
import type { ClienteRepository } from "../../domain/repositories/cliente-repository";
import { clienteViewSchema, criarClienteInputSchema } from "../schemas/cliente.schema";

type Dependencies = {
  clienteRepository: ClienteRepository;
  actorId: string;
};

export class CriarClienteUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarClienteInputSchema.parse(rawInput);

    // Verificar se já existe cliente com este documento
    const clienteExistente = await this.deps.clienteRepository.encontrarPorDocumento(
      input.orgId,
      input.documento,
    );

    if (clienteExistente) {
      throw new Error("Cliente com este documento já existe");
    }

    const cliente = Cliente.criar({
      orgId: input.orgId,
      nome: input.nome,
      razaoSocial: input.razaoSocial ?? null,
      nomeFantasia: input.nomeFantasia ?? null,
      tipo: input.tipo ?? "fisica",
      documento: input.documento,
      inscricaoEstadual: input.inscricaoEstadual ?? null,
      inscricaoMunicipal: input.inscricaoMunicipal ?? null,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      celular: input.celular ?? null,
      website: input.website ?? null,
      endereco: input.endereco ?? null,
      numero: input.numero ?? null,
      complemento: input.complemento ?? null,
      bairro: input.bairro ?? null,
      cidade: input.cidade ?? null,
      estado: input.estado ?? null,
      cep: input.cep ?? null,
      observacoes: input.observacoes ?? null,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.clienteRepository.salvar(cliente);

    return clienteViewSchema.parse({
      clienteId: cliente.clienteId,
      orgId: cliente.dados.orgId,
      nome: cliente.dados.nome,
      razaoSocial: cliente.dados.razaoSocial ?? null,
      nomeFantasia: cliente.dados.nomeFantasia ?? null,
      tipo: cliente.dados.tipo,
      documento: cliente.dados.documento,
      inscricaoEstadual: cliente.dados.inscricaoEstadual ?? null,
      inscricaoMunicipal: cliente.dados.inscricaoMunicipal ?? null,
      email: cliente.dados.email ?? null,
      telefone: cliente.dados.telefone ?? null,
      celular: cliente.dados.celular ?? null,
      website: cliente.dados.website ?? null,
      endereco: cliente.dados.endereco ?? null,
      numero: cliente.dados.numero ?? null,
      complemento: cliente.dados.complemento ?? null,
      bairro: cliente.dados.bairro ?? null,
      cidade: cliente.dados.cidade ?? null,
      estado: cliente.dados.estado ?? null,
      cep: cliente.dados.cep ?? null,
      status: cliente.dados.status,
      observacoes: cliente.dados.observacoes ?? null,
      createdBy: cliente.dados.createdBy,
      updatedBy: cliente.dados.updatedBy,
      createdAt: cliente.dados.createdAt,
      updatedAt: cliente.dados.updatedAt,
    });
  }
}
