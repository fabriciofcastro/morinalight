import { StatusCustomizadoEntity } from "../../domain/entities/status-customizado";
import type { StatusCustomizadoRepository } from "../../domain/repositories/status-customizado.repository";
import type { UpdateStatusCustomizadoInput } from "../schemas/status-customizado.schema";

export class AtualizarStatusCustomizadoUseCase {
  constructor(
    private readonly statusCustomizadoRepository: StatusCustomizadoRepository,
    private readonly orgId: string,
    private readonly actorId: string,
  ) {}

  async execute(
    id: string,
    input: UpdateStatusCustomizadoInput,
  ): Promise<{ status: StatusCustomizadoEntity }> {
    const statusExistente = await this.statusCustomizadoRepository.buscarPorId(id, this.orgId);
    if (!statusExistente) {
      throw new Error("Status customizado não encontrado");
    }

    // Se está mudando o nome, verificar se não existe outro com mesmo nome
    if (input.nome && input.nome !== statusExistente.nome) {
      const existente = await this.statusCustomizadoRepository.buscarPorNome(
        this.orgId,
        input.nome,
      );
      if (existente && existente.id !== id) {
        throw new Error(`Já existe um status customizado com o nome "${input.nome}"`);
      }
    }

    const status = StatusCustomizadoEntity.reconstituir(statusExistente);
    status.atualizar({
      nome: input.nome,
      cor: input.cor,
      descricao: input.descricao,
      ordem: input.ordem,
      ativo: input.ativo,
      atualizadoPor: this.actorId,
    });

    const updated = await this.statusCustomizadoRepository.atualizar(status.toJSON());

    return {
      status: StatusCustomizadoEntity.reconstituir(updated),
    };
  }
}
