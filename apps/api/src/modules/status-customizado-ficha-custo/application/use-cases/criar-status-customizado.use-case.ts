import { randomUUID } from "crypto";
import { StatusCustomizadoEntity } from "../../domain/entities/status-customizado";
import type { StatusCustomizadoRepository } from "../../domain/repositories/status-customizado.repository";
import type { CreateStatusCustomizadoInput } from "../schemas/status-customizado.schema";

export class CriarStatusCustomizadoUseCase {
  constructor(
    private readonly statusCustomizadoRepository: StatusCustomizadoRepository,
    private readonly orgId: string,
    private readonly actorId: string,
  ) {}

  async execute(input: CreateStatusCustomizadoInput): Promise<{ status: StatusCustomizadoEntity }> {
    // Verificar se já existe status com mesmo nome
    const existente = await this.statusCustomizadoRepository.buscarPorNome(this.orgId, input.nome);
    if (existente) {
      throw new Error(`Já existe um status customizado com o nome "${input.nome}"`);
    }

    const status = StatusCustomizadoEntity.criar({
      id: randomUUID(),
      orgId: this.orgId,
      nome: input.nome,
      cor: input.cor,
      descricao: input.descricao,
      ordem: input.ordem ?? 0,
      ativo: input.ativo ?? true,
      criadoPor: this.actorId,
    });

    const saved = await this.statusCustomizadoRepository.criar(status.toJSON());

    return {
      status: StatusCustomizadoEntity.reconstituir(saved),
    };
  }
}
