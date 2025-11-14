import type { ClienteRepository } from "../../domain/repositories/cliente-repository";
import {
  clienteViewSchema,
  listarClientesInputSchema,
  listarClientesResultadoSchema,
} from "../schemas/cliente.schema";

type Dependencies = {
  clienteRepository: ClienteRepository;
};

export class ListarClientesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarClientesInputSchema.parse(rawInput);

    const pagina = await this.deps.clienteRepository.listarPorOrg(input.orgId, {
      status: input.status,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((cliente) =>
      clienteViewSchema.parse({
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
      }),
    );

    return listarClientesResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
