import type { OrganizationalUnitRepository } from "../../domain/repositories/organizational-unit-repository";
import {
  listarOrganizationalUnitsInputSchema,
  listarOrganizationalUnitsResultadoSchema,
  organizationalUnitViewSchema,
} from "../schemas/organizational-unit.schema";

type Dependencies = {
  organizationalUnitRepository: OrganizationalUnitRepository;
};

export class ListarOrganizationalUnitsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarOrganizationalUnitsInputSchema.parse(rawInput);

    const pagina = await this.deps.organizationalUnitRepository.listarPorOrg(input.orgId, {
      status: input.status,
      parentId: input.parentId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((unit) =>
      organizationalUnitViewSchema.parse({
        unitId: unit.unitId,
        orgId: unit.dados.orgId,
        name: unit.dados.name,
        code: unit.dados.code,
        description: unit.dados.description ?? null,
        parentId: unit.dados.parentId ?? null,
        status: unit.dados.status,
        ordem: unit.dados.ordem,
        metadata: unit.dados.metadata ?? null,
        createdBy: unit.dados.createdBy,
        updatedBy: unit.dados.updatedBy,
        createdAt: unit.dados.createdAt,
        updatedAt: unit.dados.updatedAt,
      }),
    );

    return listarOrganizationalUnitsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
