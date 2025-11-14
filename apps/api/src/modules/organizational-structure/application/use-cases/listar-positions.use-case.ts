import type { PositionRepository } from "../../domain/repositories/position-repository";
import {
  listarPositionsInputSchema,
  listarPositionsResultadoSchema,
  positionViewSchema,
} from "../schemas/position.schema";

type Dependencies = {
  positionRepository: PositionRepository;
};

export class ListarPositionsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPositionsInputSchema.parse(rawInput);

    const pagina = await this.deps.positionRepository.listarPorOrg(input.orgId, {
      status: input.status,
      sectorId: input.sectorId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((position) =>
      positionViewSchema.parse({
        id: position.positionId,
        orgId: position.dados.orgId,
        sectorId: position.dados.sectorId,
        name: position.dados.name,
        code: position.dados.code,
        description: position.dados.description ?? null,
        responsabilidades: position.dados.responsabilidades ?? null,
        requisitos: position.dados.requisitos ?? null,
        salarioMin: position.dados.salarioMin ?? null,
        salarioMax: position.dados.salarioMax ?? null,
        status: position.dados.status,
        ordem: position.dados.ordem,
        metadata: position.dados.metadata ?? null,
        createdBy: position.dados.createdBy,
        updatedBy: position.dados.updatedBy,
        createdAt: position.dados.createdAt,
        updatedAt: position.dados.updatedAt,
      }),
    );

    return listarPositionsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

