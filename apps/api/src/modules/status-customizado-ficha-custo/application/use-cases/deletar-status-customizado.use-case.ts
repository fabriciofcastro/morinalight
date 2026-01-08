import type { StatusCustomizadoRepository } from "../../domain/repositories/status-customizado.repository";

export class DeletarStatusCustomizadoUseCase {
  constructor(
    private readonly statusCustomizadoRepository: StatusCustomizadoRepository,
    private readonly orgId: string,
    private readonly actorId: string,
  ) {}

  async execute(id: string): Promise<void> {
    const status = await this.statusCustomizadoRepository.buscarPorId(id, this.orgId);
    if (!status) {
      throw new Error("Status customizado não encontrado");
    }

    await this.statusCustomizadoRepository.deletar(id, this.orgId, this.actorId);
  }
}
