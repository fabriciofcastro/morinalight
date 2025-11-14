import type { SectorRepository } from "../../domain/repositories/sector-repository";
import {
  listarSectorsInputSchema,
  listarSectorsResultadoSchema,
  sectorViewSchema,
} from "../schemas/sector.schema";

type Dependencies = {
  sectorRepository: SectorRepository;
};

export class ListarSectorsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarSectorsInputSchema.parse(rawInput);

    const pagina = await this.deps.sectorRepository.listarPorOrg(input.orgId, {
      status: input.status,
      departmentId: input.departmentId,
      parentId: input.parentId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((sector) =>
      sectorViewSchema.parse({
        id: sector.sectorId,
        orgId: sector.dados.orgId,
        departmentId: sector.dados.departmentId,
        name: sector.dados.name,
        code: sector.dados.code,
        description: sector.dados.description ?? null,
        parentId: sector.dados.parentId ?? null,
        status: sector.dados.status,
        ordem: sector.dados.ordem,
        metadata: sector.dados.metadata ?? null,
        createdBy: sector.dados.createdBy,
        updatedBy: sector.dados.updatedBy,
        createdAt: sector.dados.createdAt,
        updatedAt: sector.dados.updatedAt,
      }),
    );

    return listarSectorsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

