import type { ClienteRepository } from "../../domain/repositories/cliente-repository";
import { atualizarClienteInputSchema, clienteViewSchema } from "../schemas/cliente.schema";

type Dependencies = {
  clienteRepository: ClienteRepository;
  actorId: string;
};

export class AtualizarClienteUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarClienteInputSchema.parse(rawInput);

    const cliente = await this.deps.clienteRepository.encontrarPorId(input.orgId, input.clienteId);

    if (!cliente) {
      throw new Error("Cliente não encontrado");
    }

    // Atualizar campos individualmente se fornecidos
    if (input.nome !== undefined) {
      cliente.atualizarNome(input.nome);
    }
    if (input.razaoSocial !== undefined) {
      cliente.atualizarRazaoSocial(input.razaoSocial);
    }
    if (input.email !== undefined) {
      cliente.atualizarEmail(input.email);
    }
    if (input.telefone !== undefined) {
      cliente.atualizarTelefone(input.telefone);
    }
    if (input.celular !== undefined) {
      cliente.atualizarCelular(input.celular);
    }
    if (input.endereco !== undefined) {
      cliente.atualizarEndereco(input.endereco);
    }
    if (input.cidade !== undefined) {
      cliente.atualizarCidade(input.cidade);
    }
    if (input.estado !== undefined) {
      cliente.atualizarEstado(input.estado);
    }
    if (input.cep !== undefined) {
      cliente.atualizarCep(input.cep);
    }
    if (input.status !== undefined) {
      cliente.alterarStatus(input.status);
    }
    if (input.observacoes !== undefined) {
      cliente.atualizarObservacoes(input.observacoes);
    }

    // Marcar como atualizado pelo usuário
    cliente.marcarComoAtualizado(this.deps.actorId);

    await this.deps.clienteRepository.salvar(cliente);

    return clienteViewSchema.parse({
      clienteId: cliente.clienteId,
      orgId: cliente.dados.orgId,
      nome: cliente.dados.nome,
      razaoSocial: cliente.dados.razaoSocial ?? null,
      tipo: cliente.dados.tipo,
      documento: cliente.dados.documento,
      email: cliente.dados.email ?? null,
      telefone: cliente.dados.telefone ?? null,
      celular: cliente.dados.celular ?? null,
      endereco: cliente.dados.endereco ?? null,
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
