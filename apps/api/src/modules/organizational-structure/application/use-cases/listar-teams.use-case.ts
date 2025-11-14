import type { TeamRepository } from "../../domain/repositories/team-repository";
import {
  listarTeamsInputSchema,
  listarTeamsResultadoSchema,
  teamViewSchema,
} from "../schemas/team.schema";

type Dependencies = {
  teamRepository: TeamRepository;
};

export class ListarTeamsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarTeamsInputSchema.parse(rawInput);

    const pagina = await this.deps.teamRepository.listarPorOrg(input.orgId, {
      status: input.status,
      departmentId: input.departmentId,
      busca: input.busca,
      cursor: input.cursor,
      limite: input.limite,
    });

    const itens = pagina.itens.map((team) =>
      teamViewSchema.parse({
        teamId: team.teamId,
        orgId: team.dados.orgId,
        departmentId: team.dados.departmentId ?? null,
        name: team.dados.name,
        code: team.dados.code,
        description: team.dados.description ?? null,
        status: team.dados.status,
        ordem: team.dados.ordem,
        metadata: team.dados.metadata ?? null,
        createdBy: team.dados.createdBy,
        updatedBy: team.dados.updatedBy,
        createdAt: team.dados.createdAt,
        updatedAt: team.dados.updatedAt,
      }),
    );

    return listarTeamsResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}
