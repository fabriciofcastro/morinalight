import { StatusCustomizadoEntity } from "../../domain/entities/status-customizado";
import type { StatusCustomizadoRepository } from "../../domain/repositories/status-customizado.repository";

export class BuscarStatusCustomizadoUseCase {
  constructor(
    private readonly statusCustomizadoRepository: StatusCustomizadoRepository,
    private readonly orgId: string,
  ) {}

  async execute(id: string): Promise<{ status: StatusCustomizadoEntity }> {
    const status = await this.statusCustomizadoRepository.buscarPorId(id, this.orgId);
    if (!status) {
      throw new Error("Status customizado não encontrado");
    }

    return {
      status: StatusCustomizadoEntity.reconstituir(status),
    };
  }
}
