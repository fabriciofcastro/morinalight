import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import {
  listarPermissionsInputSchema,
  listarPermissionsResultadoSchema,
} from "../schemas/permission.schema";

type Dependencies = {
  permissionRepository: PermissionRepository;
};

export class ListarPermissionsUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissionsInputSchema.parse(rawInput);

    // Assuming findAll or similar exists, or we filter in memory if repository doesn't support filtering
    const permissions = await this.deps.permissionRepository.listar();

    let filtered = permissions;

    if (input.module) {
      filtered = filtered.filter((p) => p.dados.module === input.module);
    }
    if (input.resource) {
      filtered = filtered.filter((p) => p.dados.code === input.resource);
    }
    if (input.busca) {
      const busca = input.busca.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.dados.name.toLowerCase().includes(busca) ||
          p.dados.description?.toLowerCase().includes(busca) ||
          p.dados.code.toLowerCase().includes(busca),
      );
    }

    return listarPermissionsResultadoSchema.parse({
      itens: filtered.map((permission) => ({
        permissionId: permission.permissionId,
        name: permission.dados.name,
        description: permission.dados.description ?? null,
        module: permission.dados.module,
        category: permission.dados.module,
        resource: permission.permissionKey.includes(":")
          ? permission.permissionKey.split(":", 2)[0]
          : permission.permissionKey,
        action: permission.permissionKey.includes(":")
          ? permission.permissionKey.split(":", 2)[1]
          : permission.dados.level,
        createdAt: permission.dados.createdAt,
        updatedAt: permission.dados.updatedAt,
      })),
    });
  }
}
