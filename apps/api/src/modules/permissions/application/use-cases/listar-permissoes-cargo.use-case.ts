import { z } from "zod";
import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";

const listarPermissoesCargoInputSchema = z.object({
  orgId: z.string().uuid(),
  positionId: z.string().uuid(),
});

type Dependencies = {
  positionPermissionRepository: PositionPermissionRepository;
  positionRepository: PositionRepository;
  permissionRepository: PermissionRepository;
};

export class ListarPermissoesCargoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarPermissoesCargoInputSchema.parse(rawInput);

    // Verificar se o cargo existe
    const position = await this.deps.positionRepository.encontrarPorId(
      input.orgId,
      input.positionId,
    );

    if (!position) {
      throw new Error("Cargo não encontrado");
    }

    // Buscar permissões do cargo
    const positionPermissions = await this.deps.positionPermissionRepository.listarPorPosition(
      input.orgId,
      input.positionId,
    );

    // Buscar detalhes das permissões
    const permissionIds = positionPermissions.map((pp) => pp.permissionId);
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

    // Combinar permissões com dados do cargo
    return positionPermissions.map((pp, index) => {
      const permission = permissions[index];
      return {
        id: pp.id,
        positionId: pp.positionId,
        permissionId: pp.permissionId,
        permissionKey: permission?.permissionKey || pp.permissionId,
        permissionName: permission?.dados.name || pp.permissionId,
        granted: pp.granted,
        createdAt: pp.createdAt,
        updatedAt: pp.updatedAt,
      };
    });
  }
}
