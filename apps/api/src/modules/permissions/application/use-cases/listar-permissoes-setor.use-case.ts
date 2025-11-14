import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import { z } from "zod";

const listarPermissoesSetorInputSchema = z.object({
  orgId: z.string().uuid(),
  sectorId: z.string().uuid(),
});

type Dependencies = {
  sectorPermissionRepository: SectorPermissionRepository;
  sectorRepository: SectorRepository;
  permissionRepository: PermissionRepository;
};

export class ListarPermissoesSetorUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissoesSetorInputSchema.parse(rawInput);

    // Verificar se o setor existe
    const sector = await this.deps.sectorRepository.encontrarPorId(
      input.orgId,
      input.sectorId,
    );

    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    // Buscar permissões do setor
    const sectorPermissions = await this.deps.sectorPermissionRepository.listarPorSector(
      input.orgId,
      input.sectorId,
    );

    // Buscar detalhes das permissões
    const permissionIds = sectorPermissions.map((sp) => sp.permissionId);
    const permissions = await Promise.all(
      permissionIds.map(async (permissionId) => {
        let permission = await this.deps.permissionRepository.encontrarPorId(permissionId);
        if (!permission) {
          // Tentar buscar por chave (resource:action)
          const [resource, action] = permissionId.split(":");
          if (resource && action) {
            permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);
          }
        }
        return permission;
      }),
    );

    // Combinar permissões com dados do setor
    return sectorPermissions.map((sp, index) => {
      const permission = permissions[index];
      return {
        id: sp.id,
        sectorId: sp.sectorId,
        permissionId: sp.permissionId,
        permissionKey: permission?.permissionKey || sp.permissionId,
        permissionName: permission?.dados.name || sp.permissionId,
        granted: sp.granted,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      };
    });
  }
}

