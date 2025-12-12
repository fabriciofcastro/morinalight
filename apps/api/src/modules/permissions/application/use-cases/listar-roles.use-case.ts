import type { RoleRepository } from "../../domain/repositories/role-repository";
import { listarRolesInputSchema, listarRolesResultadoSchema } from "../schemas/role.schema";

type Dependencies = {
  roleRepository: RoleRepository;
};

export class ListarRolesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarRolesInputSchema.parse(rawInput);

    const roles = await this.deps.roleRepository.findByOrgId(input.orgId);

    let filtered = roles;

    if (input.busca) {
      const busca = input.busca.toLowerCase();
      filtered = filtered.filter((r) => r.dados.name.toLowerCase().includes(busca));
    }

    return listarRolesResultadoSchema.parse({
      itens: filtered.map((role) => ({
        roleId: role.roleId,
        orgId: role.dados.orgId,
        name: role.dados.name,
        code: role.dados.code,
        description: role.dados.description ?? null,
        scope: role.dados.scope,
        active: role.dados.active,
        isCustom: true, // Legacy support
        createdAt: role.dados.createdAt,
        updatedAt: role.dados.updatedAt,
      })),
    });
  }
}
